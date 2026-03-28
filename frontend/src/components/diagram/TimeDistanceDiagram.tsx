"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Stage, Layer, Line, Rect, Text, Group, Circle } from "react-konva";
import * as d3 from "d3";
import type { Activity, Dependency, DiagramViewport } from "@/types/schedule";
import { useCanvasStore } from "@/store/useCanvasStore";

interface Props {
  activities: Activity[];
  dependencies: Dependency[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string | null) => void;
  onUpdateActivity: (id: string, data: Partial<Activity>) => void;
  onCreateActivity: (data: {
    activity_type: string;
    start_chainage: number;
    end_chainage: number;
    planned_start: string;
    planned_finish: string;
  }) => void;
  onCreateDependency: (predecessorId: string, successorId: string) => void;
  onDeleteActivity: (id: string) => void;
  onDeleteDependency: (id: string) => void;
  startChainage: number;
  endChainage: number;
  chainageUnit: string;
  width: number;
  height: number;
}

const MARGIN = { top: 60, right: 40, bottom: 60, left: 100 };

// Dark mode colors
const COLORS = {
  background: "#0a0a0a",
  surface: "#18181b",
  grid: "#27272a",
  gridMajor: "#3f3f46",
  axis: "#a1a1aa",
  axisLabel: "#d4d4d8",
  critical: "#ef4444",
  selected: "#3b82f6",
  milestone: "#f59e0b",
  link: "#52525b",
  linkHover: "#a1a1aa",
  drawPreview: "#3b82f6",
  linkPreview: "#22c55e",
  weekend: "rgba(255,255,255,0.02)",
  handleFill: "#0a0a0a",
};

export default function TimeDistanceDiagram({
  activities,
  dependencies,
  selectedActivityId,
  onSelectActivity,
  onUpdateActivity,
  onCreateActivity,
  onCreateDependency,
  onDeleteActivity,
  onDeleteDependency,
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
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; type: "activity" | "dependency" | "canvas"; targetId?: string;
  } | null>(null);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

  const { tool, drawing, linking, startDrawing, updateDrawing, finishDrawing, cancelDrawing,
    startLinking, updateLinking, finishLinking, cancelLinking, setCursorPosition } = useCanvasStore();

  // Date range from activities
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
    const range = max.getTime() - min.getTime() || 30 * 24 * 60 * 60 * 1000;
    return [new Date(min.getTime() - range * 0.05), new Date(max.getTime() + range * 0.05)];
  }, [activities]);

  // D3 scales
  const xScale = useMemo(
    () => d3.scaleLinear().domain([startChainage, endChainage || startChainage + 1000]).range([MARGIN.left, width - MARGIN.right]),
    [startChainage, endChainage, width]
  );
  const yScale = useMemo(
    () => d3.scaleTime().domain(dateRange).range([MARGIN.top, height - MARGIN.bottom]),
    [dateRange, height]
  );

  const xTicks = useMemo(() => xScale.ticks(10), [xScale]);
  const yTicks = useMemo(() => yScale.ticks(12), [yScale]);

  // Convert activity to canvas coordinates
  const getActivityPoints = useCallback(
    (activity: Activity): { type: string; points: number[] } | null => {
      if (!activity.planned_start || !activity.planned_finish) return null;
      const startDate = new Date(activity.planned_start);
      const endDate = new Date(activity.planned_finish);

      if (activity.activity_type === "linear" && activity.start_chainage != null && activity.end_chainage != null) {
        return { type: "linear", points: [xScale(activity.start_chainage), yScale(startDate), xScale(activity.end_chainage), yScale(endDate)] };
      }
      if (activity.activity_type === "block" && activity.start_chainage != null && activity.end_chainage != null) {
        return { type: "block", points: [xScale(activity.start_chainage), yScale(startDate), xScale(activity.end_chainage), yScale(endDate)] };
      }
      if (activity.activity_type === "milestone" && activity.start_chainage != null) {
        return { type: "milestone", points: [xScale(activity.start_chainage), yScale(startDate)] };
      }
      // CPM without chainage
      const midX = (MARGIN.left + width - MARGIN.right) / 2;
      return { type: "cpm", points: [midX - 40, yScale(startDate), midX + 40, yScale(endDate)] };
    },
    [xScale, yScale, width]
  );

  // Find activity near a point (for linking)
  const findActivityAtPoint = useCallback(
    (px: number, py: number, threshold = 20): Activity | null => {
      for (const act of activities) {
        const geo = getActivityPoints(act);
        if (!geo) continue;
        if (geo.type === "linear" && geo.points.length === 4) {
          const [x1, y1, x2, y2] = geo.points;
          // Distance from point to line segment
          const dx = x2 - x1, dy = y2 - y1;
          const len2 = dx * dx + dy * dy;
          let t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
          const projX = x1 + t * dx, projY = y1 + t * dy;
          const dist = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
          if (dist < threshold) return act;
        }
        if (geo.type === "block" && geo.points.length === 4) {
          const [x1, y1, x2, y2] = geo.points;
          if (px >= Math.min(x1, x2) - 5 && px <= Math.max(x1, x2) + 5 &&
              py >= Math.min(y1, y2) - 5 && py <= Math.max(y1, y2) + 5) return act;
        }
        if (geo.type === "milestone" && geo.points.length === 2) {
          const dist = Math.sqrt((px - geo.points[0]) ** 2 + (py - geo.points[1]) ** 2);
          if (dist < threshold) return act;
        }
      }
      return null;
    },
    [activities, getActivityPoints]
  );

  // Mouse handlers
  const getPointerDataCoords = useCallback(
    (stage: any) => {
      const pos = stage.getPointerPosition();
      if (!pos) return null;
      // Adjust for viewport transform
      const x = (pos.x - viewport.x) / viewport.scaleX;
      const y = (pos.y - viewport.y) / viewport.scaleY;
      return {
        px: x, py: y,
        chainage: xScale.invert(x),
        date: yScale.invert(y),
      };
    },
    [viewport, xScale, yScale]
  );

  const handleMouseDown = useCallback(
    (e: any) => {
      const coords = getPointerDataCoords(e.target.getStage());
      if (!coords) return;

      if (tool === "select") {
        if (e.target === e.target.getStage()) onSelectActivity(null);
        return;
      }

      if (tool.startsWith("draw-")) {
        startDrawing(coords.px, coords.py, coords.chainage, coords.date);
        return;
      }

      if (tool === "link") {
        const act = findActivityAtPoint(coords.px, coords.py);
        if (act) {
          startLinking(act.id, coords.px, coords.py);
        }
        return;
      }
    },
    [tool, getPointerDataCoords, onSelectActivity, startDrawing, startLinking, findActivityAtPoint]
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      const coords = getPointerDataCoords(e.target.getStage());
      if (!coords) return;

      setCursorPosition(coords.chainage, coords.date);

      if (drawing.isDrawing) {
        updateDrawing(coords.px, coords.py, coords.chainage, coords.date);
        return;
      }
      if (linking.isLinking) {
        updateLinking(coords.px, coords.py);
        return;
      }

      // Hover detection
      const act = findActivityAtPoint(coords.px, coords.py);
      setHoveredActivityId(act?.id || null);
    },
    [drawing.isDrawing, linking.isLinking, getPointerDataCoords, setCursorPosition, updateDrawing, updateLinking, findActivityAtPoint]
  );

  const handleMouseUp = useCallback(
    (e: any) => {
      if (drawing.isDrawing) {
        const state = finishDrawing();
        if (!state.startDate || !state.currentDate) return;

        // Ensure start is before end in time
        const [dateA, dateB] = state.startDate < state.currentDate
          ? [state.startDate, state.currentDate]
          : [state.currentDate, state.startDate];

        const actType = tool === "draw-linear" ? "linear" : tool === "draw-block" ? "block" : "milestone";

        onCreateActivity({
          activity_type: actType,
          start_chainage: Math.round(Math.min(state.startChainage, state.currentChainage)),
          end_chainage: Math.round(Math.max(state.startChainage, state.currentChainage)),
          planned_start: dateA.toISOString(),
          planned_finish: actType === "milestone" ? dateA.toISOString() : dateB.toISOString(),
        });
        return;
      }

      if (linking.isLinking) {
        const coords = getPointerDataCoords(e.target.getStage());
        if (coords) {
          const targetAct = findActivityAtPoint(coords.px, coords.py);
          if (targetAct && targetAct.id !== linking.sourceActivityId && linking.sourceActivityId) {
            onCreateDependency(linking.sourceActivityId, targetAct.id);
          }
        }
        finishLinking();
        return;
      }
    },
    [drawing.isDrawing, linking.isLinking, tool, finishDrawing, finishLinking, getPointerDataCoords, findActivityAtPoint, onCreateActivity, onCreateDependency]
  );

  const handleWheel = useCallback(
    (e: any) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const oldScale = viewport.scaleX;
      const pointer = stage.getPointerPosition();
      const scaleBy = 1.05;
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));
      setViewport({
        scaleX: clampedScale, scaleY: clampedScale,
        x: pointer.x - (pointer.x - viewport.x) * (clampedScale / oldScale),
        y: pointer.y - (pointer.y - viewport.y) * (clampedScale / oldScale),
      });
    },
    [viewport]
  );

  const handleContextMenu = useCallback(
    (e: any) => {
      e.evt.preventDefault();
      const coords = getPointerDataCoords(e.target.getStage());
      if (!coords) return;
      const act = findActivityAtPoint(coords.px, coords.py);
      if (act) {
        setContextMenu({ x: e.evt.clientX, y: e.evt.clientY, type: "activity", targetId: act.id });
      } else {
        setContextMenu({ x: e.evt.clientX, y: e.evt.clientY, type: "canvas" });
      }
    },
    [getPointerDataCoords, findActivityAtPoint]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape") { cancelDrawing(); cancelLinking(); onSelectActivity(null); }
      if (e.key === "v" || e.key === "V") useCanvasStore.getState().setTool("select");
      if (e.key === "l" || e.key === "L") useCanvasStore.getState().setTool("draw-linear");
      if (e.key === "b" || e.key === "B") useCanvasStore.getState().setTool("draw-block");
      if (e.key === "m" && !e.metaKey) useCanvasStore.getState().setTool("draw-milestone");
      if (e.key === "k" || e.key === "K") useCanvasStore.getState().setTool("link");
      if (e.key === "h" || e.key === "H") useCanvasStore.getState().setTool("pan");
      if ((e.key === "Delete" || e.key === "Backspace") && selectedActivityId) {
        onDeleteActivity(selectedActivityId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cancelDrawing, cancelLinking, onSelectActivity, selectedActivityId, onDeleteActivity]);

  // Close context menu on click elsewhere
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  const isDraggable = tool === "pan" || tool === "select";

  return (
    <div className="relative">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        draggable={isDraggable && !drawing.isDrawing && !linking.isLinking}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scaleX}
        scaleY={viewport.scaleY}
        onWheel={handleWheel}
        onDragEnd={(e) => setViewport((v) => ({ ...v, x: e.target.x(), y: e.target.y() }))}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{ cursor: tool === "pan" ? "grab" : tool.startsWith("draw-") ? "crosshair" : tool === "link" ? "pointer" : "default" }}
      >
        {/* Background */}
        <Layer listening={false}>
          <Rect x={-width} y={-height} width={width * 3} height={height * 3} fill={COLORS.background} />
        </Layer>

        {/* Grid */}
        <Layer listening={false}>
          {xTicks.map((tick) => (
            <Group key={`xg-${tick}`}>
              <Line
                points={[xScale(tick), MARGIN.top, xScale(tick), height - MARGIN.bottom]}
                stroke={tick % 1000 === 0 ? COLORS.gridMajor : COLORS.grid}
                strokeWidth={tick % 1000 === 0 ? 0.8 : 0.4}
              />
              <Text x={xScale(tick) - 25} y={MARGIN.top - 22} text={`${tick}${chainageUnit}`}
                fontSize={10} fill={COLORS.axis} align="center" width={50} />
            </Group>
          ))}
          {yTicks.map((tick, i) => {
            const y = yScale(tick);
            const label = d3.timeFormat("%b %Y")(tick as Date);
            return (
              <Group key={`yg-${i}`}>
                <Line points={[MARGIN.left, y, width - MARGIN.right, y]}
                  stroke={COLORS.grid} strokeWidth={0.4} />
                <Text x={8} y={y - 6} text={label} fontSize={10} fill={COLORS.axis} />
              </Group>
            );
          })}
          {/* Axes */}
          <Line points={[MARGIN.left, MARGIN.top, MARGIN.left, height - MARGIN.bottom]}
            stroke={COLORS.gridMajor} strokeWidth={1} />
          <Line points={[MARGIN.left, MARGIN.top, width - MARGIN.right, MARGIN.top]}
            stroke={COLORS.gridMajor} strokeWidth={1} />
          <Text x={width / 2 - 50} y={12} text={`Distance (${chainageUnit})`}
            fontSize={12} fontStyle="600" fill={COLORS.axisLabel} />
        </Layer>

        {/* Dependencies */}
        <Layer listening={false}>
          {dependencies.map((dep) => {
            const predAct = activities.find((a) => a.id === dep.predecessor_id);
            const succAct = activities.find((a) => a.id === dep.successor_id);
            if (!predAct || !succAct) return null;
            const predGeo = getActivityPoints(predAct);
            const succGeo = getActivityPoints(succAct);
            if (!predGeo || !succGeo || predGeo.points.length < 2 || succGeo.points.length < 2) return null;
            const px = predGeo.points[predGeo.points.length - 2];
            const py = predGeo.points[predGeo.points.length - 1];
            const sx = succGeo.points[0];
            const sy = succGeo.points[1];
            return (
              <Line key={dep.id} points={[px, py, px, sy, sx, sy]}
                stroke={COLORS.link} strokeWidth={1} dash={[6, 4]} />
            );
          })}
        </Layer>

        {/* Activities */}
        <Layer>
          {activities.map((activity) => {
            const geo = getActivityPoints(activity);
            if (!geo) return null;
            const isSelected = activity.id === selectedActivityId;
            const isHovered = activity.id === hoveredActivityId;
            const isCritical = activity.total_float_hours === 0;
            const strokeColor = isSelected ? COLORS.selected : isCritical ? COLORS.critical : activity.color;
            const strokeW = isSelected ? 3.5 : isHovered ? 3 : activity.line_width;

            if (geo.type === "milestone") {
              return (
                <Group key={activity.id}>
                  <Circle x={geo.points[0]} y={geo.points[1]} radius={isSelected ? 8 : 6}
                    fill={COLORS.milestone} stroke={isSelected ? COLORS.selected : "#d97706"} strokeWidth={2}
                    onClick={() => onSelectActivity(activity.id)} hitStrokeWidth={14} />
                  <Text x={geo.points[0] + 12} y={geo.points[1] - 6} text={activity.name}
                    fontSize={10} fill={COLORS.axisLabel} />
                </Group>
              );
            }

            if (geo.type === "block") {
              const [x1, y1, x2, y2] = geo.points;
              return (
                <Group key={activity.id}>
                  <Rect x={Math.min(x1, x2)} y={Math.min(y1, y2)}
                    width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)}
                    fill={activity.color + "20"} stroke={strokeColor} strokeWidth={strokeW}
                    cornerRadius={3} onClick={() => onSelectActivity(activity.id)} hitStrokeWidth={10} />
                  <Text x={Math.min(x1, x2) + 4} y={Math.min(y1, y2) + 4} text={activity.name}
                    fontSize={10} fill={COLORS.axisLabel} width={Math.abs(x2 - x1) - 8} ellipsis />
                </Group>
              );
            }

            if (geo.type === "linear") {
              const [x1, y1, x2, y2] = geo.points;
              // Annotation angle
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
              return (
                <Group key={activity.id}>
                  <Line points={geo.points} stroke={strokeColor} strokeWidth={strokeW}
                    hitStrokeWidth={16} lineCap="round"
                    onClick={() => onSelectActivity(activity.id)}
                    draggable={tool === "select"}
                    onDragEnd={(e) => {
                      const dx = e.target.x();
                      if (dx === 0 && e.target.y() === 0) return;
                      const chainageDelta = xScale.invert(dx + xScale(0)) - xScale.invert(xScale(0));
                      onUpdateActivity(activity.id, {
                        start_chainage: Math.round((activity.start_chainage || 0) + chainageDelta),
                        end_chainage: Math.round((activity.end_chainage || 0) + chainageDelta),
                      });
                      e.target.position({ x: 0, y: 0 });
                    }}
                  />
                  {/* Annotation */}
                  <Text
                    x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 14}
                    text={activity.name}
                    fontSize={11} fill={strokeColor} fontStyle={isCritical ? "bold" : "normal"}
                    rotation={angle} offsetX={0} offsetY={0}
                  />
                  {/* Endpoints when selected */}
                  {isSelected && (
                    <>
                      <Circle x={x1} y={y1} radius={5} fill={COLORS.handleFill}
                        stroke={COLORS.selected} strokeWidth={2} />
                      <Circle x={x2} y={y2} radius={5} fill={COLORS.handleFill}
                        stroke={COLORS.selected} strokeWidth={2} />
                    </>
                  )}
                </Group>
              );
            }

            // CPM default
            return (
              <Group key={activity.id}>
                <Line points={[geo.points[0], geo.points[1], geo.points[2], geo.points[3]]}
                  stroke={strokeColor} strokeWidth={strokeW} hitStrokeWidth={14}
                  onClick={() => onSelectActivity(activity.id)} />
                <Text x={geo.points[0] + 5} y={geo.points[1] - 14} text={activity.name}
                  fontSize={10} fill={COLORS.axisLabel} />
              </Group>
            );
          })}
        </Layer>

        {/* Drawing preview layer */}
        <Layer listening={false}>
          {drawing.isDrawing && (
            <>
              {tool === "draw-linear" && (
                <Line
                  points={[drawing.startX, drawing.startY, drawing.currentX, drawing.currentY]}
                  stroke={COLORS.drawPreview} strokeWidth={2.5} dash={[8, 4]} lineCap="round"
                />
              )}
              {tool === "draw-block" && (
                <Rect
                  x={Math.min(drawing.startX, drawing.currentX)}
                  y={Math.min(drawing.startY, drawing.currentY)}
                  width={Math.abs(drawing.currentX - drawing.startX)}
                  height={Math.abs(drawing.currentY - drawing.startY)}
                  fill={COLORS.drawPreview + "15"} stroke={COLORS.drawPreview}
                  strokeWidth={2} dash={[8, 4]} cornerRadius={3}
                />
              )}
              {tool === "draw-milestone" && (
                <Circle x={drawing.startX} y={drawing.startY} radius={7}
                  fill={COLORS.milestone + "80"} stroke={COLORS.milestone} strokeWidth={2} />
              )}
            </>
          )}
          {/* Link preview */}
          {linking.isLinking && (
            <Line
              points={[linking.sourceX, linking.sourceY, linking.currentX, linking.currentY]}
              stroke={COLORS.linkPreview} strokeWidth={2} dash={[6, 4]}
            />
          )}
        </Layer>
      </Stage>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-surface border border-border rounded-lg shadow-2xl py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === "activity" && contextMenu.targetId && (
            <>
              <button className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-surface-2"
                onClick={() => { onSelectActivity(contextMenu.targetId!); setContextMenu(null); }}>
                Select
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-critical hover:bg-surface-2"
                onClick={() => { onDeleteActivity(contextMenu.targetId!); setContextMenu(null); }}>
                Delete Activity
              </button>
            </>
          )}
          {contextMenu.type === "canvas" && (
            <div className="px-3 py-1.5 text-sm text-muted">
              Use toolbar to draw activities
            </div>
          )}
        </div>
      )}
    </div>
  );
}
