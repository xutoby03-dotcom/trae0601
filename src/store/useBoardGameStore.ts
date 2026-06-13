import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Game,
  GameComponent,
  LendingRecord,
  ComponentCheck,
  RepairRecord,
  ComponentType,
  BoxCondition,
  LendingStatus,
  RepairStatus,
} from "@/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

interface BoardGameStore {
  games: Game[];
  components: GameComponent[];
  lendingRecords: LendingRecord[];
  componentChecks: ComponentCheck[];
  repairRecords: RepairRecord[];

  addGame: (game: Omit<Game, "id" | "createdAt" | "wantToPlayAt">) => string;
  updateGame: (id: string, data: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  toggleWantToPlay: (id: string) => void;

  addComponent: (component: Omit<GameComponent, "id">) => string;
  updateComponent: (id: string, data: Partial<GameComponent>) => void;
  deleteComponent: (id: string) => void;
  getComponentsByGameId: (gameId: string) => GameComponent[];

  createLending: (
    lending: Omit<LendingRecord, "id" | "lentAt" | "returnedAt" | "status">,
    componentChecks: Omit<ComponentCheck, "id" | "isComplete">[]
  ) => string;
  returnLending: (
    lendingId: string,
    checks: { componentId: string; returnedQuantity: number }[]
  ) => void;
  getLendingsByGameId: (gameId: string) => LendingRecord[];
  getActiveLendings: () => LendingRecord[];
  getOverdueLendings: () => LendingRecord[];

  updateRepairStatus: (id: string, status: RepairStatus) => void;
  getRepairsByGameId: (gameId: string) => RepairRecord[];

  getIncompleteGames: () => { game: Game; missingCount: number }[];
  getTopBorrowers: () => { name: string; count: number }[];
  getMostMissingGames: () => { game: Game; missingCount: number }[];
}

export const useBoardGameStore = create<BoardGameStore>()(
  persist(
    (set, get) => ({
      games: [],
      components: [],
      lendingRecords: [],
      componentChecks: [],
      repairRecords: [],

      addGame: (gameData) => {
        const id = generateId();
        const game: Game = {
          ...gameData,
          wantToPlayAt: null,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ games: [...state.games, game] }));
        return id;
      },

      updateGame: (id, data) => {
        set((state) => ({
          games: state.games.map((g) => (g.id === id ? { ...g, ...data } : g)),
        }));
      },

      deleteGame: (id) => {
        set((state) => ({
          games: state.games.filter((g) => g.id !== id),
          components: state.components.filter((c) => c.gameId !== id),
          lendingRecords: state.lendingRecords.filter((l) => l.gameId !== id),
          componentChecks: state.componentChecks.filter(
            (cc) =>
              !state.lendingRecords
                .filter((l) => l.gameId === id)
                .some((l) => l.id === cc.lendingRecordId)
          ),
          repairRecords: state.repairRecords.filter((r) => r.gameId !== id),
        }));
      },

      toggleWantToPlay: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id
              ? {
                  ...g,
                  wantToPlay: !g.wantToPlay,
                  wantToPlayAt: !g.wantToPlay ? now : null,
                }
              : g
          ),
        }));
      },

      addComponent: (componentData) => {
        const id = generateId();
        const component: GameComponent = { ...componentData, id };
        set((state) => ({
          components: [...state.components, component],
        }));
        return id;
      },

      updateComponent: (id, data) => {
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteComponent: (id) => {
        set((state) => ({
          components: state.components.filter((c) => c.id !== id),
        }));
      },

      getComponentsByGameId: (gameId) => {
        return get().components.filter((c) => c.gameId === gameId);
      },

      createLending: (lendingData, checkData) => {
        const lendingId = generateId();
        const lending: LendingRecord = {
          ...lendingData,
          id: lendingId,
          lentAt: new Date().toISOString(),
          returnedAt: null,
          status: "借出中",
        };
        const checks: ComponentCheck[] = checkData.map((cd) => ({
          ...cd,
          id: generateId(),
          lendingRecordId: lendingId,
          isComplete: true,
        }));
        set((state) => ({
          lendingRecords: [...state.lendingRecords, lending],
          componentChecks: [...state.componentChecks, ...checks],
        }));
        return lendingId;
      },

      returnLending: (lendingId, checks) => {
        const now = new Date().toISOString();
        const state = get();
        const lending = state.lendingRecords.find((l) => l.id === lendingId);
        if (!lending) return;

        const repairRecordsToAdd: RepairRecord[] = [];
        const updatedChecks: ComponentCheck[] = [];

        for (const check of checks) {
          const component = state.components.find(
            (c) => c.id === check.componentId
          );
          const originalCheck = state.componentChecks.find(
            (cc) =>
              cc.lendingRecordId === lendingId &&
              cc.componentId === check.componentId
          );
          const lentQty = originalCheck?.lentQuantity ?? component?.quantity ?? 0;
          const missingQty = lentQty - check.returnedQuantity;

          updatedChecks.push({
            id: originalCheck?.id ?? generateId(),
            lendingRecordId: lendingId,
            componentId: check.componentId,
            lentQuantity: lentQty,
            returnedQuantity: check.returnedQuantity,
            isComplete: missingQty === 0,
          });

          if (missingQty > 0) {
            repairRecordsToAdd.push({
              id: generateId(),
              gameId: lending.gameId,
              lendingRecordId: lendingId,
              componentName: component?.name ?? "未知配件",
              missingQuantity: missingQty,
              status: "待采购",
              createdAt: now,
            });
          }
        }

        set((state) => ({
          lendingRecords: state.lendingRecords.map((l) =>
            l.id === lendingId
              ? { ...l, returnedAt: now, status: "已归还" as LendingStatus }
              : l
          ),
          componentChecks: state.componentChecks
            .filter((cc) => cc.lendingRecordId !== lendingId)
            .concat(updatedChecks),
          repairRecords: [...state.repairRecords, ...repairRecordsToAdd],
        }));
      },

      getLendingsByGameId: (gameId) => {
        return get().lendingRecords.filter((l) => l.gameId === gameId);
      },

      getActiveLendings: () => {
        const now = new Date();
        return get().lendingRecords.filter((l) => {
          if (l.status === "已归还") return false;
          const dueDate = new Date(l.dueDate);
          if (dueDate < now) {
            set((state) => ({
              lendingRecords: state.lendingRecords.map((lr) =>
                lr.id === l.id ? { ...lr, status: "逾期" as LendingStatus } : lr
              ),
            }));
            return true;
          }
          return true;
        });
      },

      getOverdueLendings: () => {
        const now = new Date();
        return get().lendingRecords.filter((l) => {
          if (l.status === "已归还") return false;
          return new Date(l.dueDate) < now;
        });
      },

      updateRepairStatus: (id, status) => {
        set((state) => ({
          repairRecords: state.repairRecords.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        }));
      },

      getRepairsByGameId: (gameId) => {
        return get().repairRecords.filter((r) => r.gameId === gameId);
      },

      getIncompleteGames: () => {
        const state = get();
        const gameMissingMap = new Map<string, number>();
        state.repairRecords
          .filter((r) => r.status !== "已补齐")
          .forEach((r) => {
            gameMissingMap.set(
              r.gameId,
              (gameMissingMap.get(r.gameId) ?? 0) + r.missingQuantity
            );
          });
        const result: { game: Game; missingCount: number }[] = [];
        Array.from(gameMissingMap.entries()).forEach(([gameId, missingCount]) => {
          const game = state.games.find((g) => g.id === gameId);
          if (game) result.push({ game, missingCount });
        });
        return result;
      },

      getTopBorrowers: () => {
        const state = get();
        const borrowerMap = new Map<string, number>();
        state.lendingRecords.forEach((l) => {
          borrowerMap.set(
            l.borrowerName,
            (borrowerMap.get(l.borrowerName) ?? 0) + 1
          );
        });
        return Array.from(borrowerMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      },

      getMostMissingGames: () => {
        const state = get();
        const gameMissingMap = new Map<string, number>();
        state.repairRecords.forEach((r) => {
          gameMissingMap.set(
            r.gameId,
            (gameMissingMap.get(r.gameId) ?? 0) + r.missingQuantity
          );
        });
        const result: { game: Game; missingCount: number }[] = [];
        Array.from(gameMissingMap.entries()).forEach(([gameId, missingCount]) => {
          const game = state.games.find((g) => g.id === gameId);
          if (game) result.push({ game, missingCount });
        });
        return result.sort((a, b) => b.missingCount - a.missingCount).slice(0, 5);
      },
    }),
    {
      name: "boardgame-lending-storage",
    }
  )
);
