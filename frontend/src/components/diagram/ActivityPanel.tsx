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
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Activity list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">
            Activities ({activities.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {activities.map((act) => (
            <div
              key={act.id}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                act.id === selectedActivityId ? "bg-blue-100 border-l-2 border-blue-500" : ""
              }`}
              onClick={() => onSelectActivity(act.id)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: act.color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{act.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {act.activity_code} | {act.activity_type}
                    {act.total_float_hours === 0 && (
                      <span className="ml-1 text-red-500 font-semibold">CRITICAL</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected activity properties */}
      {selected && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3 max-h-[50%] overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-700">Properties</h4>

          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-gray-500">Name</span>
              <input
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 mt-0.5"
                value={selected.name}
                onChange={(e) => onUpdateActivity(selected.id, { name: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">Type</span>
              <select
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 mt-0.5"
                value={selected.activity_type}
                onChange={(e) =>
                  onUpdateActivity(selected.id, { activity_type: e.target.value as Activity["activity_type"] })
                }
              >
                <option value="cpm">CPM</option>
                <option value="linear">Linear</option>
                <option value="block">Block</option>
                <option value="milestone">Milestone</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs text-gray-500">Start Chainage</span>
                <input
                  type="number"
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 mt-0.5"
                  value={selected.start_chainage ?? ""}
                  onChange={(e) =>
                    onUpdateActivity(selected.id, {
                      start_chainage: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">End Chainage</span>
                <input
                  type="number"
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 mt-0.5"
                  value={selected.end_chainage ?? ""}
                  onChange={(e) =>
                    onUpdateActivity(selected.id, {
                      end_chainage: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-gray-500">Production Rate</span>
              <input
                type="number"
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 mt-0.5"
                value={selected.production_rate ?? ""}
                placeholder="m/day"
                onChange={(e) =>
                  onUpdateActivity(selected.id, {
                    production_rate: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">Color</span>
              <input
                type="color"
                className="w-full h-8 border border-gray-300 rounded mt-0.5 cursor-pointer"
                value={selected.color}
                onChange={(e) => onUpdateActivity(selected.id, { color: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <span className="block">Duration</span>
                <span className="text-gray-900">{selected.duration_hours ? `${(selected.duration_hours / 8).toFixed(1)}d` : "-"}</span>
              </div>
              <div>
                <span className="block">Float</span>
                <span className={selected.total_float_hours === 0 ? "text-red-600 font-bold" : "text-gray-900"}>
                  {selected.total_float_hours != null ? `${(selected.total_float_hours / 8).toFixed(1)}d` : "-"}
                </span>
              </div>
              <div>
                <span className="block">Start</span>
                <span className="text-gray-900">
                  {selected.planned_start ? new Date(selected.planned_start).toLocaleDateString() : "-"}
                </span>
              </div>
              <div>
                <span className="block">Finish</span>
                <span className="text-gray-900">
                  {selected.planned_finish ? new Date(selected.planned_finish).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
