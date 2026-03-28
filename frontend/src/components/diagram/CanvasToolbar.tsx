"use client";

import React from "react";
import { useCanvasStore, type CanvasTool } from "@/store/useCanvasStore";
import { useHistoryStore } from "@/store/useHistoryStore";

const tools: { id: CanvasTool; label: string; shortcut: string; icon: string }[] = [
  { id: "select", label: "Select", shortcut: "V", icon: "↖" },
  { id: "draw-linear", label: "Linear", shortcut: "L", icon: "╱" },
  { id: "draw-block", label: "Block", shortcut: "B", icon: "▭" },
  { id: "draw-milestone", label: "Milestone", shortcut: "M", icon: "◆" },
  { id: "link", label: "Link", shortcut: "K", icon: "⟶" },
  { id: "pan", label: "Pan", shortcut: "H", icon: "✋" },
];

export default function CanvasToolbar() {
  const { tool, setTool, cursorChainage, cursorDate } = useCanvasStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-surface border border-border rounded-xl px-2 py-1.5 shadow-2xl">
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={`${t.label} (${t.shortcut})`}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            tool === t.id
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <span className="mr-1">{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="px-2 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ↩
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className="px-2 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ↪
      </button>

      {/* Coordinate readout */}
      {cursorChainage != null && cursorDate != null && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <div className="text-[10px] font-mono text-muted px-2 min-w-[160px]">
            <span>{Math.round(cursorChainage)}m</span>
            <span className="mx-1">|</span>
            <span>{cursorDate.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </>
      )}
    </div>
  );
}
