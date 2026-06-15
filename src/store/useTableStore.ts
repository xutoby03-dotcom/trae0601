import { create } from 'zustand';
import type {
  FoldingTable,
  BorrowRecord,
  ReturnRecord,
  BorrowFormData,
  ReturnCheckData,
  IssueType,
} from '@/types';
import { mockTables, mockBorrowRecords, mockReturnRecords } from '@/data/mockData';
import { generateId, isOverdue } from '@/utils/helpers';

interface TableState {
  tables: FoldingTable[];
  borrowRecords: BorrowRecord[];
  returnRecords: ReturnRecord[];
  selectedTableId: string | null;
  isBorrowModalOpen: boolean;
  filterStatus: 'all' | 'available';

  setSelectedTableId: (id: string | null) => void;
  setBorrowModalOpen: (open: boolean) => void;
  setFilterStatus: (status: 'all' | 'available') => void;

  getAvailableCount: () => number;
  getOverdueRecords: () => BorrowRecord[];
  getMaintenanceTables: () => FoldingTable[];
  getActiveBorrowForTable: (tableId: string) => BorrowRecord | undefined;
  openBorrowModal: (tableId: string) => void;
  closeBorrowModal: () => void;

  borrowTable: (tableId: string, data: BorrowFormData) => void;
  returnTable: (borrowId: string, data: ReturnCheckData) => void;
}

const useTableStore = create<TableState>((set, get) => ({
  tables: mockTables,
  borrowRecords: mockBorrowRecords,
  returnRecords: mockReturnRecords,
  selectedTableId: null,
  isBorrowModalOpen: false,
  filterStatus: 'available',

  setSelectedTableId: (id) => set({ selectedTableId: id }),
  setBorrowModalOpen: (open) => set({ isBorrowModalOpen: open }),
  setFilterStatus: (status) => set({ filterStatus: status }),

  getAvailableCount: () => {
    const { tables } = get();
    return tables.filter((t) => t.status === 'available').length;
  },

  getOverdueRecords: () => {
    const { borrowRecords } = get();
    return borrowRecords.filter((r) => r.status === 'overdue' || isOverdue(r.expectedReturn));
  },

  getMaintenanceTables: () => {
    const { tables } = get();
    return tables.filter((t) => t.status === 'maintenance' || t.issueTags.length > 0);
  },

  getActiveBorrowForTable: (tableId) => {
    const { borrowRecords } = get();
    return borrowRecords.find(
      (r) => r.tableId === tableId && (r.status === 'active' || r.status === 'overdue')
    );
  },

  openBorrowModal: (tableId) => {
    set({ selectedTableId: tableId, isBorrowModalOpen: true });
  },

  closeBorrowModal: () => {
    set({ selectedTableId: null, isBorrowModalOpen: false });
  },

  borrowTable: (tableId, data) => {
    const borrowId = generateId('BR');
    const newRecord: BorrowRecord = {
      id: borrowId,
      tableId,
      residentName: data.residentName,
      residentRoom: data.residentRoom,
      purpose: data.purpose,
      moveTo: data.moveTo,
      expectedReturn: data.expectedReturn,
      withTablecloth: data.withTablecloth,
      borrowTime: new Date().toISOString(),
      status: 'active',
    };

    set((state) => ({
      borrowRecords: [...state.borrowRecords, newRecord],
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: 'borrowed' as const } : t
      ),
      isBorrowModalOpen: false,
      selectedTableId: null,
    }));
  },

  returnTable: (borrowId, data) => {
    const { borrowRecords, tables } = get();
    const borrowRecord = borrowRecords.find((r) => r.id === borrowId);
    if (!borrowRecord) return;

    const returnId = generateId('RR');
    let overallStatus: 'ok' | 'minor' | 'damaged' = 'ok';
    const newIssueTags: IssueType[] = [];

    if (!data.desktopOk) {
      overallStatus = 'damaged';
      newIssueTags.push('desktop_damaged');
    }
    if (!data.legsOk || !data.lockOk || !data.tableclothReturned) {
      if (overallStatus !== 'damaged') overallStatus = 'minor';
      newIssueTags.push('missing_parts');
    }
    if (!data.positionCorrect) {
      if (overallStatus === 'ok') overallStatus = 'minor';
      newIssueTags.push('position_mismatch');
    }

    const newReturnRecord: ReturnRecord = {
      id: returnId,
      borrowId,
      desktopOk: data.desktopOk,
      desktopNote: data.desktopNote,
      legsOk: data.legsOk,
      legsNote: data.legsNote,
      lockOk: data.lockOk,
      lockNote: data.lockNote,
      tableclothReturned: data.tableclothReturned,
      positionCorrect: data.positionCorrect,
      overallStatus,
      returnTime: new Date().toISOString(),
    };

    const parseNumberFromNote = (note: string): number | null => {
      const match = note.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    set((state) => ({
      returnRecords: [...state.returnRecords, newReturnRecord],
      borrowRecords: state.borrowRecords.map((r) =>
        r.id === borrowId ? { ...r, status: 'returned' as const } : r
      ),
      tables: state.tables.map((t) => {
        if (t.id === borrowRecord.tableId) {
          const hasIssues = newIssueTags.length > 0;
          let updatedTable = {
            ...t,
            status: hasIssues ? ('maintenance' as const) : ('available' as const),
            issueTags: [...new Set([...t.issueTags, ...newIssueTags])] as IssueType[],
          };

          if (!data.desktopOk) {
            const addScratches = parseNumberFromNote(data.desktopNote) || 1;
            updatedTable.scratchCount = t.scratchCount + addScratches;
          }

          if (!data.legsOk) {
            const missingPads = parseNumberFromNote(data.legsNote) || 1;
            updatedTable.footPadCount = Math.max(0, t.footPadCount - missingPads);
          }

          if (!data.tableclothReturned) {
            updatedTable.hasTablecloth = false;
          }

          return updatedTable;
        }
        return t;
      }),
    }));
  },
}));

export default useTableStore;
