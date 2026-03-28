import { create } from "zustand";

export type CanvasTool =
  | "select"
  | "draw-linear"
  | "draw-block"
  | "draw-milestone"
  | "link"
  | "pan";

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  // Data coordinates (converted from pixel via D3 scales)
  startChainage: number;
  startDate: Date | null;
  currentChainage: number;
  currentDate: Date | null;
}

interface LinkingState {
  isLinking: boolean;
  sourceActivityId: string | null;
  sourceX: number;
  sourceY: number;
  currentX: number;
  currentY: number;
}

interface CanvasStore {
  tool: CanvasTool;
  setTool: (tool: CanvasTool) => void;

  drawing: DrawingState;
  startDrawing: (x: number, y: number, chainage: number, date: Date) => void;
  updateDrawing: (x: number, y: number, chainage: number, date: Date) => void;
  finishDrawing: () => DrawingState;
  cancelDrawing: () => void;

  linking: LinkingState;
  startLinking: (activityId: string, x: number, y: number) => void;
  updateLinking: (x: number, y: number) => void;
  finishLinking: () => LinkingState;
  cancelLinking: () => void;

  // Cursor position for coordinate readout
  cursorChainage: number | null;
  cursorDate: Date | null;
  setCursorPosition: (chainage: number | null, date: Date | null) => void;
}

const defaultDrawing: DrawingState = {
  isDrawing: false,
  startX: 0, startY: 0, currentX: 0, currentY: 0,
  startChainage: 0, startDate: null, currentChainage: 0, currentDate: null,
};

const defaultLinking: LinkingState = {
  isLinking: false,
  sourceActivityId: null,
  sourceX: 0, sourceY: 0, currentX: 0, currentY: 0,
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  tool: "select",
  setTool: (tool) => {
    set({ tool });
    get().cancelDrawing();
    get().cancelLinking();
  },

  drawing: defaultDrawing,
  startDrawing: (x, y, chainage, date) =>
    set({
      drawing: {
        isDrawing: true,
        startX: x, startY: y, currentX: x, currentY: y,
        startChainage: chainage, startDate: date,
        currentChainage: chainage, currentDate: date,
      },
    }),
  updateDrawing: (x, y, chainage, date) =>
    set((s) => ({
      drawing: { ...s.drawing, currentX: x, currentY: y, currentChainage: chainage, currentDate: date },
    })),
  finishDrawing: () => {
    const state = get().drawing;
    set({ drawing: defaultDrawing });
    return state;
  },
  cancelDrawing: () => set({ drawing: defaultDrawing }),

  linking: defaultLinking,
  startLinking: (activityId, x, y) =>
    set({
      linking: { isLinking: true, sourceActivityId: activityId, sourceX: x, sourceY: y, currentX: x, currentY: y },
    }),
  updateLinking: (x, y) =>
    set((s) => ({ linking: { ...s.linking, currentX: x, currentY: y } })),
  finishLinking: () => {
    const state = get().linking;
    set({ linking: defaultLinking });
    return state;
  },
  cancelLinking: () => set({ linking: defaultLinking }),

  cursorChainage: null,
  cursorDate: null,
  setCursorPosition: (chainage, date) => set({ cursorChainage: chainage, cursorDate: date }),
}));
