import { create } from "zustand";

export interface HistoryAction {
  type: string;
  description: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

interface HistoryStore {
  past: HistoryAction[];
  future: HistoryAction[];
  push: (action: HistoryAction) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  push: (action) =>
    set((s) => ({
      past: [...s.past.slice(-MAX_HISTORY + 1), action],
      future: [],
      canUndo: true,
      canRedo: false,
    })),

  undo: async () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const action = past[past.length - 1];
    await action.undo();

    set({
      past: past.slice(0, -1),
      future: [action, ...future],
      canUndo: past.length > 1,
      canRedo: true,
    });
  },

  redo: async () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const action = future[0];
    await action.redo();

    set({
      past: [...past, action],
      future: future.slice(1),
      canUndo: true,
      canRedo: future.length > 1,
    });
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));
