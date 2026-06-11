import { create } from "zustand";
import {
  Card,
  BorrowRecord,
  CardType,
  RecordStatus,
  BorrowFormData,
  LostFormData,
  DepartmentStats,
  DailyStats,
  DailyStatsFilter,
  DepartmentRankingFilter,
  RecordFilter,
} from "@/types";
import {
  generateId,
  formatDateTime,
  addHours,
  addDays,
  isOverdue,
  isSoonOverdue,
  formatDate,
  getDateDaysAgo,
} from "@/utils/dateUtils";

const STORAGE_KEY_CARDS = "temporary-card-cards";
const STORAGE_KEY_RECORDS = "temporary-card-records";

interface CardStore {
  cards: Card[];
  records: BorrowRecord[];
  addBorrowRecord: (data: BorrowFormData) => boolean;
  returnCard: (recordId: string) => void;
  reportLost: (recordId: string, data: LostFormData) => void;
  getActiveRecordByCardNumber: (cardNumber: string) => BorrowRecord | undefined;
  getCardByNumber: (cardNumber: string) => Card | undefined;
  getStatsByStatus: () => {
    available: { total: number; visitor: number; employee: number };
    inUse: { total: number; visitor: number; employee: number };
    soonOverdue: { total: number; visitor: number; employee: number };
    lost: { total: number; visitor: number; employee: number };
  };
  getRecentRecords: (limit?: number) => BorrowRecord[];
  getDailyStats: (filter?: DailyStatsFilter) => DailyStats[];
  getDepartmentRanking: (filter?: DepartmentRankingFilter) => DepartmentStats[];
  getOverdueRecords: (filter?: { startDate?: string; endDate?: string }) => BorrowRecord[];
  getOverdueCount: () => number;
  getRecordsByFilter: (filter: RecordFilter, limit?: number) => BorrowRecord[];
  resetToInitialData: () => void;
}

const now = new Date();

const initialCards: Card[] = [
  { id: "c1", cardNumber: "V001", cardType: "visitor", accessArea: "1-3层办公区", deposit: 50, status: "available" },
  { id: "c2", cardNumber: "V002", cardType: "visitor", accessArea: "全楼层", deposit: 100, status: "available" },
  { id: "c3", cardNumber: "V003", cardType: "visitor", accessArea: "1-3层办公区", deposit: 50, status: "available" },
  { id: "c4", cardNumber: "V004", cardType: "visitor", accessArea: "1-3层办公区", deposit: 50, status: "available" },
  { id: "c5", cardNumber: "V005", cardType: "visitor", accessArea: "全楼层", deposit: 100, status: "available" },
  { id: "c6", cardNumber: "E001", cardType: "employee", accessArea: "全楼层", deposit: 0, status: "available" },
  { id: "c7", cardNumber: "E002", cardType: "employee", accessArea: "全楼层", deposit: 0, status: "available" },
  { id: "c8", cardNumber: "E003", cardType: "employee", accessArea: "全楼层", deposit: 0, status: "available" },
  { id: "c9", cardNumber: "E004", cardType: "employee", accessArea: "1-5层办公区", deposit: 0, status: "lost" },
  { id: "c10", cardNumber: "E005", cardType: "employee", accessArea: "全楼层", deposit: 0, status: "available" },
];

const initialRecords: BorrowRecord[] = [
  {
    id: "r1",
    cardId: "c6",
    cardNumber: "E001",
    cardType: "employee",
    borrowerName: "张三",
    department: "技术部",
    contact: "13800000001",
    accessArea: "全楼层",
    deposit: 0,
    borrowTime: formatDateTime(addHours(now, -2)),
    expectedReturnTime: formatDateTime(addHours(now, 2)),
    status: "active",
  },
  {
    id: "r2",
    cardId: "c1",
    cardNumber: "V001",
    cardType: "visitor",
    borrowerName: "李四（访客）",
    department: "市场部（来访）",
    contact: "13800000002",
    accessArea: "1-3层办公区",
    deposit: 50,
    borrowTime: formatDateTime(addHours(now, -5)),
    expectedReturnTime: formatDateTime(addHours(now, 1)),
    status: "active",
  },
  {
    id: "r3",
    cardId: "c7",
    cardNumber: "E002",
    cardType: "employee",
    borrowerName: "王五",
    department: "人事部",
    contact: "13800000003",
    accessArea: "全楼层",
    deposit: 0,
    borrowTime: formatDateTime(addDays(now, -2)),
    expectedReturnTime: formatDateTime(addDays(now, -1)),
    status: "active",
  },
  {
    id: "r4",
    cardId: "c2",
    cardNumber: "V002",
    cardType: "visitor",
    borrowerName: "赵六（访客）",
    department: "财务部（来访）",
    contact: "13800000004",
    accessArea: "全楼层",
    deposit: 100,
    borrowTime: formatDateTime(addDays(now, -3)),
    expectedReturnTime: formatDateTime(addDays(now, -3, 4)),
    actualReturnTime: formatDateTime(addDays(now, -3, 3.5)),
    status: "returned",
  },
  {
    id: "r5",
    cardId: "c8",
    cardNumber: "E003",
    cardType: "employee",
    borrowerName: "孙七",
    department: "技术部",
    contact: "13800000005",
    accessArea: "全楼层",
    deposit: 0,
    borrowTime: formatDateTime(addDays(now, -5)),
    expectedReturnTime: formatDateTime(addDays(now, -5, 8)),
    actualReturnTime: formatDateTime(addDays(now, -5, 7)),
    status: "returned",
  },
  {
    id: "r6",
    cardId: "c3",
    cardNumber: "V003",
    cardType: "visitor",
    borrowerName: "周八（访客）",
    department: "运营部（来访）",
    contact: "13800000006",
    accessArea: "1-3层办公区",
    deposit: 50,
    borrowTime: formatDateTime(addDays(now, -6)),
    expectedReturnTime: formatDateTime(addDays(now, -6, 5)),
    actualReturnTime: formatDateTime(addDays(now, -6, 4)),
    status: "returned",
  },
  {
    id: "r7",
    cardId: "c10",
    cardNumber: "E005",
    cardType: "employee",
    borrowerName: "吴九",
    department: "市场部",
    contact: "13800000007",
    accessArea: "全楼层",
    deposit: 0,
    borrowTime: formatDateTime(addDays(now, -8)),
    expectedReturnTime: formatDateTime(addDays(now, -8, 6)),
    actualReturnTime: formatDateTime(addDays(now, -8, 5)),
    status: "returned",
  },
  {
    id: "r8",
    cardId: "c4",
    cardNumber: "V004",
    cardType: "visitor",
    borrowerName: "郑十（访客）",
    department: "产品部（来访）",
    contact: "13800000008",
    accessArea: "1-3层办公区",
    deposit: 50,
    borrowTime: formatDateTime(addDays(now, -10)),
    expectedReturnTime: formatDateTime(addDays(now, -10, 3)),
    actualReturnTime: formatDateTime(addDays(now, -10, 2.5)),
    status: "returned",
  },
  {
    id: "r9",
    cardId: "c9",
    cardNumber: "E004",
    cardType: "employee",
    borrowerName: "冯十一",
    department: "技术部",
    contact: "13800000009",
    accessArea: "1-5层办公区",
    deposit: 0,
    borrowTime: formatDateTime(addDays(now, -12)),
    expectedReturnTime: formatDateTime(addDays(now, -12, 8)),
    status: "lost",
    lostReason: "借用人不慎遗失",
    depositRefundType: "none",
  },
];

function loadCardsFromStorage(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load cards from localStorage", e);
  }
  return initialCards;
}

function loadRecordsFromStorage(): BorrowRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load records from localStorage", e);
  }
  return initialRecords;
}

function saveCardsToStorage(cards: Card[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.warn("Failed to save cards to localStorage", e);
  }
}

function saveRecordsToStorage(records: BorrowRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.warn("Failed to save records to localStorage", e);
  }
}

function filterByType<T extends { cardType: CardType }>(items: T[]) {
  return {
    total: items.length,
    visitor: items.filter((i) => i.cardType === "visitor").length,
    employee: items.filter((i) => i.cardType === "employee").length,
  };
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: loadCardsFromStorage(),
  records: loadRecordsFromStorage(),

  addBorrowRecord: (data) => {
    const { cards, records } = get();
    const cardNumber = data.cardNumber.trim().toUpperCase();

    const existingCard = cards.find((c) => c.cardNumber === cardNumber);

    if (existingCard && existingCard.status === "lost") {
      return false;
    }
    if (existingCard && existingCard.status !== "available") {
      return false;
    }

    const newRecord: BorrowRecord = {
      id: generateId(),
      cardId: existingCard ? existingCard.id : generateId(),
      cardNumber,
      cardType: data.cardType,
      borrowerName: data.borrowerName,
      department: data.department,
      contact: data.contact,
      accessArea: data.accessArea,
      deposit: data.deposit,
      borrowTime: data.borrowTime,
      expectedReturnTime: data.expectedReturnTime,
      status: "active",
    };

    let updatedCards = cards;
    if (existingCard) {
      updatedCards = cards.map((c) =>
        c.id === existingCard.id ? { ...c, status: "in_use" as const } : c
      );
    } else {
      const newCard: Card = {
        id: newRecord.cardId,
        cardNumber,
        cardType: data.cardType,
        accessArea: data.accessArea,
        deposit: data.deposit,
        status: "in_use",
      };
      updatedCards = [...cards, newCard];
    }

    const updatedRecords = [newRecord, ...records];
    saveCardsToStorage(updatedCards);
    saveRecordsToStorage(updatedRecords);
    set({ cards: updatedCards, records: updatedRecords });
    return true;
  },

  returnCard: (recordId) => {
    const { cards, records } = get();
    const record = records.find((r) => r.id === recordId);
    if (!record) return;

    const updatedRecords = records.map((r) =>
      r.id === recordId
        ? { ...r, status: "returned" as const, actualReturnTime: formatDateTime(new Date()) }
        : r
    );

    const updatedCards = cards.map((c) =>
      c.cardNumber === record.cardNumber ? { ...c, status: "available" as const } : c
    );

    saveCardsToStorage(updatedCards);
    saveRecordsToStorage(updatedRecords);
    set({ cards: updatedCards, records: updatedRecords });
  },

  reportLost: (recordId, data) => {
    const { cards, records } = get();
    const record = records.find((r) => r.id === recordId);
    if (!record) return;

    const updatedRecords = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            status: "lost" as const,
            lostReason: data.lostReason,
            depositRefundType: data.depositRefundType,
            partialRefundAmount: data.partialRefundAmount,
          }
        : r
    );

    const updatedCards = cards.map((c) =>
      c.cardNumber === record.cardNumber ? { ...c, status: "lost" as const } : c
    );

    saveCardsToStorage(updatedCards);
    saveRecordsToStorage(updatedRecords);
    set({ cards: updatedCards, records: updatedRecords });
  },

  getActiveRecordByCardNumber: (cardNumber) => {
    return get().records.find(
      (r) => r.cardNumber === cardNumber && r.status === "active"
    );
  },

  getCardByNumber: (cardNumber) => {
    return get().cards.find((c) => c.cardNumber === cardNumber);
  },

  getStatsByStatus: () => {
    const { cards, records } = get();
    const activeRecords = records.filter((r) => r.status === "active");

    const inUseCards = activeRecords.map((r) => ({
      cardType: r.cardType,
    }));
    const soonOverdueCards = activeRecords
      .filter((r) => isSoonOverdue(r.expectedReturnTime))
      .map((r) => ({ cardType: r.cardType }));
    const availableCards = cards.filter((c) => c.status === "available");
    const lostCards = cards.filter((c) => c.status === "lost");

    return {
      available: filterByType(availableCards),
      inUse: filterByType(inUseCards),
      soonOverdue: filterByType(soonOverdueCards),
      lost: filterByType(lostCards),
    };
  },

  getRecentRecords: (limit = 10) => {
    return [...get().records]
      .sort((a, b) => new Date(b.borrowTime).getTime() - new Date(a.borrowTime).getTime())
      .slice(0, limit);
  },

  getDailyStats: (filter) => {
    const { records } = get();
    const stats: DailyStats[] = [];

    let startDate: Date;
    let endDate: Date;
    const cardType = filter?.cardType;

    if (filter?.startDate && filter?.endDate) {
      startDate = new Date(filter.startDate);
      endDate = new Date(filter.endDate);
    } else {
      endDate = new Date();
      startDate = getDateDaysAgo(13);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = formatDate(current);
      let dayRecords = records.filter(
        (r) => formatDate(new Date(r.borrowTime)) === dateStr
      );
      if (cardType) {
        dayRecords = dayRecords.filter((r) => r.cardType === cardType);
      }
      stats.push({
        date: dateStr.slice(5),
        visitorCount: dayRecords.filter((r) => r.cardType === "visitor").length,
        employeeCount: dayRecords.filter((r) => r.cardType === "employee").length,
      });
      current.setDate(current.getDate() + 1);
    }

    return stats;
  },

  getDepartmentRanking: (filter) => {
    const { records } = get();
    const deptMap = new Map<string, number>();

    let filtered = records.filter((r) => r.cardType === "employee");
    if (filter?.startDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((r) => new Date(r.borrowTime) >= start);
    }
    if (filter?.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.borrowTime) <= end);
    }

    filtered.forEach((r) => {
      const count = deptMap.get(r.department) || 0;
      deptMap.set(r.department, count + 1);
    });

    return Array.from(deptMap.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  },

  getOverdueRecords: (filter) => {
    let result = get().records.filter(
      (r) => r.status === "active" && isOverdue(r.expectedReturnTime)
    );
    if (filter?.startDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((r) => new Date(r.expectedReturnTime) >= start);
    }
    if (filter?.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.expectedReturnTime) <= end);
    }
    return result;
  },

  getOverdueCount: () => {
    return get().records.filter(
      (r) => r.status === "active" && isOverdue(r.expectedReturnTime)
    ).length;
  },

  getRecordsByFilter: (filter, limit) => {
    let result = [...get().records];

    if (filter.cardType) {
      result = result.filter((r) => r.cardType === filter.cardType);
    }

    if (filter.status) {
      if (filter.status === "overdue") {
        result = result.filter(
          (r) => r.status === "active" && isOverdue(r.expectedReturnTime)
        );
      } else {
        result = result.filter((r) => r.status === filter.status);
      }
    }

    if (filter.startDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((r) => new Date(r.borrowTime) >= start);
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.borrowTime) <= end);
    }

    result.sort(
      (a, b) => new Date(b.borrowTime).getTime() - new Date(a.borrowTime).getTime()
    );

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  },

  resetToInitialData: () => {
    saveCardsToStorage(initialCards);
    saveRecordsToStorage(initialRecords);
    set({ cards: initialCards, records: initialRecords });
  },
}));
