"use client";

import React from "react";
import type { Activity } from "@/types/schedule";

interface Props {
  activities: Activity[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string | null) => void;
  onUpdateActivity: (id: string, data: Partial<Activity>) => void;
}

export default function ActivityPanel({
  activities,
  selectedActivityId,
  onSelectActivity,
  onUpdateActivity,
}: Props) {
  const selected = activities.find((a) => a.id === selectedActivityId);

  return (
    <div className="w-80 bg-surface border-l border-border flex flex-col h-full overflow-hidden">
      {/* Activity list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 border-b border-border bg-surface-2">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Activities ({activities.length})
          </h3>
        </div>
        <div className="divide-y divide-border-subtle">
          {activities.map((act) => (
            <div
              key={act.id}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                act.id === selectedActivityId
                  ? "bg-accent/10 border-l-2 border-accent"
                  : "hover:bg-surface-2 border-l-2 border-transparent"
              }`}
              onClick={() => onSelectActivity(act.id)}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: act.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{act.name}</p>
                  <p className="text-[10px] text-muted">
                    {act.activity_code} | {act.activity_type}
                    {act.total_float_hours === 0 && (
                      <span className="ml-1 text-critical font-semibold">CRITICAL</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted">
              No activities yet. Use the toolbar to draw activities on the canvas.
            </div>
          )}
        </div>
      </div>

      {/* Selected activity properties */}
      {selected && (
        <div className="border-t border-border p-3 bg-surface-2 space-y-3 max-h-[50%] overflow-y-auto">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Properties</h4>

          <div className="space-y-2">
            <label className="block">
              <span className="text-[10px] text-muted uppercase">Name</span>
              <input
                className="w-full text-sm bg-background border border-border rounded px-2 py-1 mt-0.5 text-foreground focus:border-accent focus:outline-none"
                value={selected.name}
                onChange={(e) => onUpdateActivity(selected.id, { name: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-[10px] text-muted uppercase">Type</span>
              <select
                className="w-full text-sm bg-background border border-border rounded px-2 py-1 mt-0.5 text-foreground focus:border-accent focus:outline-none"
                value={selected.activity_type}
                onChange={(e) => onUpdateActivity(selected.id, { activity_type: e.target.value as Activity["activity_type"] })}
              >
                <option value="cpm">CPM</option>
                <option value="linear">Linear</option>
                <option value="block">Block</option>
                <option value="milestone">Milestone</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] text-muted uppercase">Start Ch.</span>
                <input type="number"
                  className="w-full text-sm bg-background border border-border rounded px-2 py-1 mt-0.5 text-foreground focus:border-accent focus:outline-none"
                  value={selected.start_chainage ?? ""}
                  onChange={(e) => onUpdateActivity(selected.id, { start_chainage: e.target.value ? Number(e.target.value) : null })}
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-muted uppercase">End Ch.</span>
                <input type="number"
                  className="w-full text-sm bg-background border border-border rounded px-2 py-1 mt-0.5 text-foreground focus:border-accent focus:outline-none"
                  value={selected.end_chainage ?? ""}
                  onChange={(e) => onUpdateActivity(selected.id, { end_chainage: e.target.value ? Number(e.target.value) : null })}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-[10px] text-muted uppercase">Production Rate</span>
              <input type="number"
                className="w-full text-sm bg-background border border-border rounded px-2 py-1 mt-0.5 text-foreground focus:border-accent focus:outline-none"
                value={selected.production_rate ?? ""} placeholder="m/day"
                onChange={(e) => onUpdateActivity(selected.id, { production_rate: e.target.value ? Number(e.target.value) : null })}
              />
            </label>

            <label className="block">
              <span className="text-[10px] text-muted uppercase">Color</span>
              <div className="flex gap-2 mt-0.5">
                <input type="color" className="w-8 h-8 border border-border rounded cursor-pointer bg-transparent"
                  value={selected.color}
                  onChange={(e) => onUpdateActivity(selected.id, { color: e.target.value })} />
                <input className="flex-1 text-sm bg-background border border-border rounded px-2 py-1 text-foreground font-mono"
                  value={selected.color}
                  onChange={(e) => onUpdateActivity(selected.id, { color: e.target.value })} />
              </div>
            </label>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-muted pt-1">
              <div>
                <span className="block uppercase">Duration</span>
                <span className="text-foreground text-xs">{selected.duration_hours ? `${(selected.duration_hours / 8).toFixed(1)}d` : "—"}</span>
              </div>
              <div>
                <span className="block uppercase">Float</span>
                <span className={`text-xs ${selected.total_float_hours === 0 ? "text-critical font-bold" : "text-foreground"}`}>
                  {selected.total_float_hours != null ? `${(selected.total_float_hours / 8).toFixed(1)}d` : "—"}
                </span>
              </div>
              <div>
                <span className="block uppercase">Start</span>
                <span className="text-foreground text-xs">
                  {selected.planned_start ? new Date(selected.planned_start).toLocaleDateString() : "—"}
                </span>
              </div>
              <div>
                <span className="block uppercase">Finish</span>
                <span className="text-foreground text-xs">
                  {selected.planned_finish ? new Date(selected.planned_finish).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
