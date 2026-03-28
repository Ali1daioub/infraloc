"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Stage, Layer, Line, Rect, Text, Group, Circle } from "react-konva";
import * as d3 from "d3";
import type { Activity, Dependency, DiagramViewport } from "@/types/schedule";

interface Props {
  activities: Activity[];
  dependencies: Dependency[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string | null) => void;
  onUpdateActivity: (id: string, data: Partial<Activity>) => void;
  startChainage: number;
  endChainage: number;
  chainageUnit: string;
  width: number;
  height: number;
}

const MARGIN = { top: 60, right: 40, bottom: 40, left: 100 };
const COLORS = {
  grid: "#e5e7eb",
  gridMajor: "#d1d5db",
  axis: "#374151",
  critical: "#ef4444",
  selected: "#3b82f6",
  milestone: "#f59e0b",
  background: "#ffffff",
  headerBg: "#f9fafb",
};

export default function TimeDistanceDiagram({
  activities,
  dependencies,
  selectedActivityId,
  onSelectActivity,
  onUpdateActivity,
  startChainage,
  endChainage,
  chainageUnit,
  width,
  height,
}: Props) {
  const stageRef = useRef<any>(null);
  const [viewport, setViewport] = useState<DiagramViewport>({
    x: 0, y: 0, scaleX: 1, scaleY: 1,
  });

  // Calculate date range from activities
  const dateRange = useMemo(() => {
    const dates = activities
      .flatMap((a) => [a.planned_start, a.planned_finish])
      .filter(Boolean)
      .map((d) => new Date(d!));

    if (dates.length === 0) {
      const now = new Date();
      return [now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)];
    }

    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    // Add 10% padding
    const range = max.getTime() - min.getTime();
    return [
      new Date(min.getTime() - range * 0.05),
      new Date(max.getTime() + range * 0.05),
    ];
  }, [activities]);

  // D3 scales
  const xScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([startChainage, endChainage || startChainage + 1000])
        .range([MARGIN.left, width - MARGIN.right]),
    [startChainage, endChainage, width]
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain(dateRange)
        .range([MARGIN.top, height - MARGIN.bottom]),
    [dateRange, height]
  );

  // Grid lines
  const xTicks = useMemo(() => xScale.ticks(10), [xScale]);
  const yTicks = useMemo(() => yScale.ticks(12), [yScale]);

  // Convert activity to canvas coordinates
  const getActivityPoints = useCallback(
    (activity: Activity): number[] | null => {
      if (!activity.planned_start || !activity.planned_finish) return null;

      const startDate = new Date(activity.planned_start);
      const endDate = new Date(activity.planned_finish);

      if (activity.activity_type === "linear" && activity.start_chainage != null && activity.end_chainage != null) {
        // Linear activity: diagonal line
        const x1 = xScale(activity.start_chainage);
        const y1 = yScale(startDate);
        const x2 = xScale(activity.end_chainage);
        const y2 = yScale(endDate);
        return [x1, y1, x2, y2];
      }

      if (activity.activity_type === "block" && activity.start_chainage != null && activity.end_chainage != null) {
        // Block activity: rectangle (returned as 4 corner points)
        const x1 = xScale(activity.start_chainage);
        const x2 = xScale(activity.end_chainage);
        const y1 = yScale(startDate);
        const y2 = yScale(endDate);
        return [x1, y1, x2, y2];
      }

      if (activity.activity_type === "milestone" && activity.start_chainage != null) {
        // Milestone: single point
        const x = xScale(activity.start_chainage);
        const y = yScale(startDate);
        return [x, y];
      }

      // CPM activity without chainage — show as horizontal line at midpoint
      const midChainage = (startChainage + (endChainage || startChainage + 1000)) / 2;
      const x = xScale(midChainage);
      const y1 = yScale(startDate);
      const y2 = yScale(endDate);
      return [x - 30, y1, x + 30, y1, x + 30, y2, x - 30, y2];
    },
    [xScale, yScale, startChainage, endChainage]
  );

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = viewport.scaleX;
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setViewport({
      scaleX: clampedScale,
      scaleY: clampedScale,
      x: pointer.x - (pointer.x - viewport.x) * (clampedScale / oldScale),
      y: pointer.y - (pointer.y - viewport.y) * (clampedScale / oldScale),
    });
  }, [viewport]);

  const handleDragEnd = useCallback((e: any) => {
    setViewport((v) => ({ ...v, x: e.target.x(), y: e.target.y() }));
  }, []);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      draggable
      x={viewport.x}
      y={viewport.y}
      scaleX={viewport.scaleX}
      scaleY={viewport.scaleY}
      onWheel={handleWheel}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        if (e.target === e.target.getStage()) onSelectActivity(null);
      }}
    >
      {/* Background */}
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={COLORS.background} />
      </Layer>

      {/* Grid */}
      <Layer>
        {/* Vertical grid (chainage) */}
        {xTicks.map((tick) => (
          <Group key={`xg-${tick}`}>
            <Line
              points={[xScale(tick), MARGIN.top, xScale(tick), height - MARGIN.bottom]}
              stroke={COLORS.grid}
              strokeWidth={tick % 500 === 0 ? 1 : 0.5}
            />
            <Text
              x={xScale(tick) - 20}
              y={MARGIN.top - 20}
              text={`${tick}${chainageUnit}`}
              fontSize={10}
              fill={COLORS.axis}
              align="center"
              width={40}
            />
          </Group>
        ))}

        {/* Horizontal grid (time) */}
        {yTicks.map((tick, i) => {
          const y = yScale(tick);
          const label = d3.timeFormat("%b %Y")(tick as Date);
          return (
            <Group key={`yg-${i}`}>
              <Line
                points={[MARGIN.left, y, width - MARGIN.right, y]}
                stroke={COLORS.grid}
                strokeWidth={0.5}
              />
              <Text
                x={5}
                y={y - 6}
                text={label}
                fontSize={10}
                fill={COLORS.axis}
              />
            </Group>
          );
        })}

        {/* Axes */}
        <Line
          points={[MARGIN.left, MARGIN.top, MARGIN.left, height - MARGIN.bottom]}
          stroke={COLORS.axis}
          strokeWidth={1.5}
        />
        <Line
          points={[MARGIN.left, MARGIN.top, width - MARGIN.right, MARGIN.top]}
          stroke={COLORS.axis}
          strokeWidth={1.5}
        />

        {/* Axis labels */}
        <Text
          x={width / 2 - 40}
          y={15}
          text={`Distance (${chainageUnit})`}
          fontSize={13}
          fontStyle="bold"
          fill={COLORS.axis}
        />
      </Layer>

      {/* Dependency lines */}
      <Layer>
        {dependencies.map((dep) => {
          const predAct = activities.find((a) => a.id === dep.predecessor_id);
          const succAct = activities.find((a) => a.id === dep.successor_id);
          if (!predAct || !succAct) return null;

          const predPoints = getActivityPoints(predAct);
          const succPoints = getActivityPoints(succAct);
          if (!predPoints || !succPoints || predPoints.length < 2 || succPoints.length < 2) return null;

          // Connect end of predecessor to start of successor
          const px = predPoints[predPoints.length - 2];
          const py = predPoints[predPoints.length - 1];
          const sx = succPoints[0];
          const sy = succPoints[1];

          return (
            <Line
              key={dep.id}
              points={[px, py, px, sy, sx, sy]}
              stroke="#9ca3af"
              strokeWidth={1}
              dash={[4, 4]}
            />
          );
        })}
      </Layer>

      {/* Activities */}
      <Layer>
        {activities.map((activity) => {
          const points = getActivityPoints(activity);
          if (!points) return null;

          const isSelected = activity.id === selectedActivityId;
          const isCritical = activity.total_float_hours === 0;
          const strokeColor = isSelected
            ? COLORS.selected
            : isCritical
              ? COLORS.critical
              : activity.color;

          if (activity.activity_type === "milestone" && points.length === 2) {
            return (
              <Group key={activity.id}>
                <Circle
                  x={points[0]}
                  y={points[1]}
                  radius={isSelected ? 8 : 6}
                  fill={COLORS.milestone}
                  stroke={isSelected ? COLORS.selected : "#d97706"}
                  strokeWidth={isSelected ? 3 : 1.5}
                  onClick={() => onSelectActivity(activity.id)}
                  onTap={() => onSelectActivity(activity.id)}
                  hitStrokeWidth={12}
                />
                <Text
                  x={points[0] + 10}
                  y={points[1] - 6}
                  text={activity.name}
                  fontSize={10}
                  fill={COLORS.axis}
                />
              </Group>
            );
          }

          if (activity.activity_type === "block" && points.length === 4) {
            const [x1, y1, x2, y2] = points;
            return (
              <Group key={activity.id}>
                <Rect
                  x={Math.min(x1, x2)}
                  y={Math.min(y1, y2)}
                  width={Math.abs(x2 - x1)}
                  height={Math.abs(y2 - y1)}
                  fill={activity.color + "33"}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : activity.line_width}
                  cornerRadius={2}
                  onClick={() => onSelectActivity(activity.id)}
                  onTap={() => onSelectActivity(activity.id)}
                  draggable
                />
                <Text
                  x={Math.min(x1, x2) + 4}
                  y={Math.min(y1, y2) + 4}
                  text={activity.name}
                  fontSize={10}
                  fill={COLORS.axis}
                  width={Math.abs(x2 - x1) - 8}
                  ellipsis
                />
              </Group>
            );
          }

          if (activity.activity_type === "linear" && points.length === 4) {
            return (
              <Group key={activity.id}>
                <Line
                  points={points}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 4 : activity.line_width}
                  hitStrokeWidth={14}
                  lineCap="round"
                  onClick={() => onSelectActivity(activity.id)}
                  onTap={() => onSelectActivity(activity.id)}
                  draggable
                  onDragEnd={(e) => {
                    const dx = e.target.x();
                    const dy = e.target.y();
                    if (dx === 0 && dy === 0) return;
                    // Convert pixel delta back to data coordinates
                    const chainageDelta = xScale.invert(dx + xScale(0)) - xScale.invert(xScale(0));
                    const newStart = (activity.start_chainage || 0) + chainageDelta;
                    const newEnd = (activity.end_chainage || 0) + chainageDelta;
                    onUpdateActivity(activity.id, {
                      start_chainage: Math.round(newStart),
                      end_chainage: Math.round(newEnd),
                    });
                    e.target.position({ x: 0, y: 0 });
                  }}
                />
                {/* Activity label */}
                <Text
                  x={(points[0] + points[2]) / 2 + 5}
                  y={(points[1] + points[3]) / 2 - 12}
                  text={activity.name}
                  fontSize={11}
                  fill={strokeColor}
                  fontStyle={isCritical ? "bold" : "normal"}
                />
                {/* Start/end handles */}
                <Circle
                  x={points[0]}
                  y={points[1]}
                  radius={4}
                  fill="white"
                  stroke={strokeColor}
                  strokeWidth={2}
                  visible={isSelected}
                />
                <Circle
                  x={points[2]}
                  y={points[3]}
                  radius={4}
                  fill="white"
                  stroke={strokeColor}
                  strokeWidth={2}
                  visible={isSelected}
                />
              </Group>
            );
          }

          // Default: CPM activity as small bar
          if (points.length >= 4) {
            return (
              <Group key={activity.id}>
                <Line
                  points={[points[0], points[1], points[2], points[3]]}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 4 : activity.line_width}
                  hitStrokeWidth={14}
                  onClick={() => onSelectActivity(activity.id)}
                  onTap={() => onSelectActivity(activity.id)}
                />
                <Text
                  x={points[0] + 5}
                  y={points[1] - 14}
                  text={activity.name}
                  fontSize={10}
                  fill={COLORS.axis}
                />
              </Group>
            );
          }

          return null;
        })}
      </Layer>
    </Stage>
  );
}
