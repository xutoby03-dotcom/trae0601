import { create } from 'zustand';
import type { Board, BoardItem } from '@/types';
import { storage, generateId } from '@/utils/storage';
import { MOCK_BOARDS, generateMockBoardItems } from '@/utils/mockData';

interface BoardState {
  boards: Board[];
  boardItems: BoardItem[];
  loading: boolean;
  init: (fabrics: unknown[]) => void;
  addBoard: (board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => Board;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  addFabricToBoard: (fabricId: string, boardId: string, notes?: string) => void;
  removeFabricFromBoard: (boardItemId: string) => void;
  reorderBoardItems: (boardId: string, itemIds: string[]) => void;
  getBoardById: (id: string) => Board | undefined;
  getBoardItemsByBoardId: (boardId: string) => BoardItem[];
  isFabricInBoard: (fabricId: string, boardId: string) => boolean;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  boardItems: [],
  loading: false,

  init: (fabrics) => {
    let boards = storage.getBoards() as Board[];
    let boardItems = storage.getBoardItems() as BoardItem[];
    
    if (boards.length === 0) {
      boards = MOCK_BOARDS;
      boardItems = generateMockBoardItems(fabrics as never[], boards);
      storage.setBoards(boards);
      storage.setBoardItems(boardItems);
    }
    
    set({ boards, boardItems });
  },

  addBoard: (boardData) => {
    const now = new Date().toISOString();
    const newBoard: Board = {
      ...boardData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    const boards = [...get().boards, newBoard];
    set({ boards });
    storage.setBoards(boards);
    
    return newBoard;
  },

  updateBoard: (id, updates) => {
    const boards = get().boards.map((b) =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    set({ boards });
    storage.setBoards(boards);
  },

  deleteBoard: (id) => {
    const boards = get().boards.filter((b) => b.id !== id);
    const boardItems = get().boardItems.filter((bi) => bi.boardId !== id);
    set({ boards, boardItems });
    storage.setBoards(boards);
    storage.setBoardItems(boardItems);
  },

  addFabricToBoard: (fabricId, boardId, notes) => {
    const existingItems = get().getBoardItemsByBoardId(boardId);
    const now = new Date().toISOString();
    const newItem: BoardItem = {
      id: generateId(),
      fabricId,
      boardId,
      order: existingItems.length,
      addedAt: now,
      notes,
    };
    
    const boardItems = [...get().boardItems, newItem];
    set({ boardItems });
    storage.setBoardItems(boardItems);
  },

  removeFabricFromBoard: (boardItemId) => {
    const boardItems = get().boardItems.filter((bi) => bi.id !== boardItemId);
    set({ boardItems });
    storage.setBoardItems(boardItems);
  },

  reorderBoardItems: (boardId, itemIds) => {
    const boardItems = get().boardItems.map((bi) => {
      if (bi.boardId !== boardId) return bi;
      const index = itemIds.indexOf(bi.id);
      return index === -1 ? bi : { ...bi, order: index };
    });
    set({ boardItems });
    storage.setBoardItems(boardItems);
  },

  getBoardById: (id) => {
    return get().boards.find((b) => b.id === id);
  },

  getBoardItemsByBoardId: (boardId) => {
    return get().boardItems
      .filter((bi) => bi.boardId === boardId)
      .sort((a, b) => a.order - b.order);
  },

  isFabricInBoard: (fabricId, boardId) => {
    return get().boardItems.some(
      (bi) => bi.fabricId === fabricId && bi.boardId === boardId
    );
  },
}));
