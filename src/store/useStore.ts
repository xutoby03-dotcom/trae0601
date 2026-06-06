import { create } from 'zustand';
import { floodFill } from '../utils/floodFill';

export type Tool = 'pixel' | 'column' | 'row' | 'bucket';

const GRID_SIZE = 32;

const createEmptyGrid = (): string[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
};

interface CanvasState {
  grid: string[][];
  currentEmoji: string;
  currentTool: Tool;
  history: string[][][];
  historyIndex: number;
  
  setCurrentEmoji: (emoji: string) => void;
  setCurrentTool: (tool: Tool) => void;
  setPixel: (x: number, y: number) => void;
  setColumn: (x: number) => void;
  setRow: (y: number) => void;
  applyBucket: (x: number, y: number) => void;
  loadGrid: (grid: string[][]) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  grid: createEmptyGrid(),
  currentEmoji: '❤️',
  currentTool: 'pixel',
  history: [createEmptyGrid()],
  historyIndex: 0,

  setCurrentEmoji: (emoji) => set({ currentEmoji: emoji }),
  
  setCurrentTool: (tool) => set({ currentTool: tool }),

  saveToHistory: () => {
    const { grid, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(grid.map(row => [...row]));
    set({ 
      history: newHistory, 
      historyIndex: newHistory.length - 1 
    });
  },

  setPixel: (x, y) => {
    const { grid, currentEmoji } = get();
    if (grid[y]?.[x] === currentEmoji) return;
    
    const newGrid = grid.map(row => [...row]);
    newGrid[y][x] = currentEmoji;
    set({ grid: newGrid });
  },

  setColumn: (x) => {
    const { grid, currentEmoji } = get();
    const newGrid = grid.map(row => [...row]);
    for (let y = 0; y < GRID_SIZE; y++) {
      newGrid[y][x] = currentEmoji;
    }
    set({ grid: newGrid });
  },

  setRow: (y) => {
    const { grid, currentEmoji } = get();
    const newGrid = grid.map(row => [...row]);
    for (let x = 0; x < GRID_SIZE; x++) {
      newGrid[y][x] = currentEmoji;
    }
    set({ grid: newGrid });
  },

  applyBucket: (x, y) => {
    const { grid, currentEmoji } = get();
    const newGrid = floodFill(grid, x, y, currentEmoji);
    set({ grid: newGrid });
  },

  loadGrid: (grid) => {
    set({ 
      grid: grid.map(row => [...row]),
      history: [grid.map(row => [...row])],
      historyIndex: 0
    });
  },

  clearCanvas: () => {
    const emptyGrid = createEmptyGrid();
    set({ 
      grid: emptyGrid,
      history: [emptyGrid],
      historyIndex: 0
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({ 
        grid: history[historyIndex - 1].map(row => [...row]),
        historyIndex: historyIndex - 1 
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ 
        grid: history[historyIndex + 1].map(row => [...row]),
        historyIndex: historyIndex + 1 
      });
    }
  },
}));
