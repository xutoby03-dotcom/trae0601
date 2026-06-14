import { create } from "zustand";
import type {
  Basket,
  BasketStatus,
  LendRecord,
  LendStatus,
  ReturnCheck,
  ItemEntry,
  ReminderRecord,
  ReminderChannel,
} from "@/types";
import { mockBaskets, mockLendRecords, mockReturnChecks, mockReminders } from "@/data/mockData";
import { overdueDays } from "@/utils/format";

interface AppState {
  baskets: Basket[];
  lendRecords: LendRecord[];
  returnChecks: ReturnCheck[];
  reminderRecords: ReminderRecord[];

  addBasket: (b: Omit<Basket, "id" | "createdAt">) => void;
  updateBasket: (id: string, b: Partial<Basket>) => void;
  deleteBasket: (id: string) => void;
  setBasketStatus: (id: string, status: BasketStatus) => void;

  createLendRecord: (record: {
    basketIds: string[];
    borrowerName: string;
    borrowerPhone: string;
    department: string;
    purpose: string;
    destination: string;
    expectedReturnTime: string;
    items: ItemEntry[];
    hasValuable: boolean;
  }) => void;

  returnBasket: (check: {
    lendRecordId: string;
    basketDamaged: boolean;
    damageNote?: string;
    itemsCleared: boolean;
    returnedToLocation: boolean;
    actualLocation?: string;
    checker: string;
  }) => void;

  refreshOverdueStatus: () => void;
  sendReminder: (payload: {
    lendRecordId: string;
    channel: ReminderChannel;
    note?: string;
    operator?: string;
  }) => ReminderRecord | null;
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const nowISO = () => new Date().toISOString();

const computeLendStatus = (r: LendRecord): LendStatus => {
  if (r.actualReturnTime) return "returned";
  const expected = new Date(r.expectedReturnTime).getTime();
  if (Date.now() > expected) return "overdue";
  return "active";
};

const initialRecords: LendRecord[] = mockLendRecords.map((r) => ({
  ...r,
  status: computeLendStatus(r),
}));

export const useStore = create<AppState>((set, get) => ({
  baskets: [...mockBaskets],
  lendRecords: initialRecords,
  returnChecks: [...mockReturnChecks],
  reminderRecords: [...mockReminders],

  addBasket: (b) =>
    set((s) => ({
      baskets: [
        ...s.baskets,
        { ...b, id: genId("b"), createdAt: nowISO() } as Basket,
      ],
    })),

  updateBasket: (id, b) =>
    set((s) => ({
      baskets: s.baskets.map((x) => (x.id === id ? { ...x, ...b } : x)),
    })),

  deleteBasket: (id) =>
    set((s) => ({ baskets: s.baskets.filter((x) => x.id !== id) })),

  setBasketStatus: (id, status) => {
    get().updateBasket(id, { status });
  },

  createLendRecord: ({
    basketIds,
    borrowerName,
    borrowerPhone,
    department,
    purpose,
    destination,
    expectedReturnTime,
    items,
    hasValuable,
  }) => {
    const { baskets } = get();
    const newRecords: LendRecord[] = basketIds.map((bid) => {
      const b = baskets.find((x) => x.id === bid);
      return {
        id: genId("l"),
        basketId: bid,
        basketCode: b?.code,
        borrowerName,
        borrowerPhone,
        department,
        purpose,
        destination,
        lendTime: nowISO(),
        expectedReturnTime,
        hasValuable,
        items: items.map((i) => ({ ...i, id: genId("i") })),
        status: "active",
      };
    });
    set((s) => ({
      lendRecords: [...newRecords, ...s.lendRecords],
      baskets: s.baskets.map((b) =>
        basketIds.includes(b.id)
          ? { ...b, status: "lent", hasValuableTag: b.hasValuableTag || hasValuable }
          : b
      ),
    }));
  },

  returnBasket: ({
    lendRecordId,
    basketDamaged,
    damageNote,
    itemsCleared,
    returnedToLocation,
    actualLocation,
    checker,
  }) => {
    const record = get().lendRecords.find((r) => r.id === lendRecordId);
    if (!record) return;
    const check: ReturnCheck = {
      id: genId("r"),
      lendRecordId,
      basketDamaged,
      damageNote,
      itemsCleared,
      returnedToLocation,
      actualLocation,
      checker,
      checkTime: nowISO(),
    };
    set((s) => ({
      lendRecords: s.lendRecords.map((r) =>
        r.id === lendRecordId
          ? { ...r, status: "returned", actualReturnTime: nowISO() }
          : r
      ),
      returnChecks: [check, ...s.returnChecks],
      baskets: s.baskets.map((b) =>
        b.id === record.basketId
          ? { ...b, status: basketDamaged ? "repair" : "available" }
          : b
      ),
    }));
  },

  refreshOverdueStatus: () =>
    set((s) => ({
      lendRecords: s.lendRecords.map((r) => ({
        ...r,
        status: computeLendStatus(r),
      })),
    })),

  sendReminder: ({ lendRecordId, channel, note, operator = "行政管理员" }) => {
    const record = get().lendRecords.find((r) => r.id === lendRecordId);
    if (!record) return null;
    const newReminder: ReminderRecord = {
      id: genId("rm"),
      lendRecordId: record.id,
      basketCode: record.basketCode || "",
      borrowerName: record.borrowerName,
      borrowerPhone: record.borrowerPhone,
      department: record.department,
      expectedReturnTime: record.expectedReturnTime,
      destination: record.destination,
      overdueDays: overdueDays(record.expectedReturnTime),
      channel,
      note,
      operator,
      remindTime: nowISO(),
    };
    set((s) => ({
      reminderRecords: [newReminder, ...s.reminderRecords],
    }));
    return newReminder;
  },
}));
