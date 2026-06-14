import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LendRecord, ReturnRecord, DepositStatus, UmbrellaStatus } from '../types';
import { initialLendRecords, initialReturnRecords } from './mockData';
import { useUmbrellaStore } from './umbrellaStore';
import { addHours } from '../utils/dateUtils';

interface LendState {
  lendRecords: LendRecord[];
  returnRecords: ReturnRecord[];
  lendUmbrella: (data: {
    umbrellaId: string;
    phoneLast4: string;
    expectedStoreId: string;
    depositStatus: DepositStatus;
  }) => { ok: boolean; message?: string };
  returnUmbrella: (params: {
    lendRecordId: string;
    umbrellaId: string;
    frameOk: boolean;
    surfaceOk: boolean;
    coverOk: boolean;
    isWet: boolean;
    damageNote: string;
  }) => { ok: boolean; finalStatus: UmbrellaStatus };
  markReminded: (lendRecordId: string) => void;
  batchMarkReminded: (ids: string[]) => void;
  getActiveLendByUmbrella: (umbrellaId: string) => LendRecord | undefined;
  getHistoryByUmbrella: (umbrellaId: string) => Array<{
    lend: LendRecord;
    ret?: ReturnRecord;
  }>;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useLendStore = create<LendState>()(
  persist(
    (set, get) => ({
      lendRecords: initialLendRecords,
      returnRecords: initialReturnRecords,

      lendUmbrella: ({ umbrellaId, phoneLast4, expectedStoreId, depositStatus }) => {
        const { getUmbrella, setUmbrellaStatus } = useUmbrellaStore.getState();
        const umb = getUmbrella(umbrellaId);
        if (!umb) return { ok: false, message: '雨伞不存在' };
        if (umb.status !== 'available') return { ok: false, message: '雨伞当前不可借' };
        if (!/^\d{4}$/.test(phoneLast4)) return { ok: false, message: '请输入四位手机号后四位' };

        const lendTime = new Date().toISOString();
        const record: LendRecord = {
          id: uid(),
          umbrellaId,
          phoneLast4,
          lendTime,
          expectedStoreId,
          depositStatus,
          dueTime: addHours(lendTime, 48),
          reminded: false,
        };
        set((state) => ({ lendRecords: [record, ...state.lendRecords] }));
        setUmbrellaStatus(umbrellaId, 'lent');
        return { ok: true };
      },

      returnUmbrella: ({
        lendRecordId,
        umbrellaId,
        frameOk,
        surfaceOk,
        coverOk,
        isWet,
        damageNote,
      }) => {
        const { setUmbrellaStatus } = useUmbrellaStore.getState();
        const allOk = frameOk && surfaceOk && coverOk;
        const finalStatus: UmbrellaStatus = allOk ? 'available' : 'damaged';
        const finalNote = allOk ? '' : damageNote || '归还时检测到破损';

        const record: ReturnRecord = {
          id: uid(),
          lendRecordId,
          returnTime: new Date().toISOString(),
          frameOk,
          surfaceOk,
          coverOk,
          isWet,
          damageNote: finalNote,
          finalStatus,
        };
        set((state) => ({ returnRecords: [record, ...state.returnRecords] }));
        setUmbrellaStatus(umbrellaId, finalStatus, finalNote);
        return { ok: true, finalStatus };
      },

      markReminded: (lendRecordId) =>
        set((state) => ({
          lendRecords: state.lendRecords.map((r) =>
            r.id === lendRecordId ? { ...r, reminded: true } : r
          ),
        })),

      batchMarkReminded: (ids) =>
        set((state) => ({
          lendRecords: state.lendRecords.map((r) =>
            ids.includes(r.id) ? { ...r, reminded: true } : r
          ),
        })),

      getActiveLendByUmbrella: (umbrellaId) => {
        const returnedIds = new Set(get().returnRecords.map((r) => r.lendRecordId));
        return get()
          .lendRecords.filter((r) => r.umbrellaId === umbrellaId && !returnedIds.has(r.id))
          .sort((a, b) => new Date(b.lendTime).getTime() - new Date(a.lendTime).getTime())[0];
      },

      getHistoryByUmbrella: (umbrellaId) => {
        const { lendRecords, returnRecords } = get();
        const returnedMap = new Map(returnRecords.map((r) => [r.lendRecordId, r]));
        return lendRecords
          .filter((r) => r.umbrellaId === umbrellaId)
          .sort((a, b) => new Date(b.lendTime).getTime() - new Date(a.lendTime).getTime())
          .map((lend) => ({ lend, ret: returnedMap.get(lend.id) }));
      },
    }),
    { name: 'lend-store' }
  )
);
