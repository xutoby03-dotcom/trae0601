import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Game, GameHistory, Player, Round, ScoreEntry, ScoringRule, Avatar, PlayerStats } from "@/types";

interface SetScorePayload {
  roundNumber: number;
  playerId: string;
  oldScore: number;
  newScore: number;
}

interface LockRoundPayload {
  roundNumber: number;
  previousBonuses: { playerId: string; bonusPoints: number }[];
  calculatedBonuses: { playerId: string; bonusPoints: number }[];
}

interface UnlockRoundPayload {
  roundNumber: number;
  previousBonuses: { playerId: string; bonusPoints: number }[];
}

interface EliminatePayload {
  playerId: string;
}

type UndoAction =
  | { type: "SET_SCORE"; payload: SetScorePayload }
  | { type: "LOCK_ROUND"; payload: LockRoundPayload }
  | { type: "UNLOCK_ROUND"; payload: UnlockRoundPayload }
  | { type: "ELIMINATE_PLAYER"; payload: EliminatePayload };

interface GameState {
  game: Game | null;
  undoStack: UndoAction[];
  redoStack: UndoAction[];

  createGame: (name: string, scoringRule: ScoringRule, teamMode: boolean, totalRounds: number, players: Player[], eliminationThreshold: number, bonusPointsAmount: number) => void;
  setScore: (roundNumber: number, playerId: string, score: number) => void;
  lockRound: (roundNumber: number) => void;
  unlockRound: (roundNumber: number) => void;
  advanceRound: () => void;
  eliminatePlayer: (playerId: string) => void;
  revivePlayer: (playerId: string) => void;
  finishGame: () => void;
  undo: () => void;
  redo: () => void;
  resetGame: () => void;
  getPlayerTotal: (playerId: string) => number;
  getPlayerRanking: () => { playerId: string; rank: number; total: number; gap: number }[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function createEmptyRounds(totalRounds: number, players: Player[]): Round[] {
  return Array.from({ length: totalRounds }, (_, i) => ({
    roundNumber: i + 1,
    scores: players.map((p) => ({ playerId: p.id, score: 0, bonusPoints: 0 })),
    isLocked: false,
  }));
}

function applyBonusToRound(round: Round, bonusPointsAmount: number): { playerId: string; bonusPoints: number }[] {
  const maxScore = Math.max(...round.scores.map((s) => s.score));
  if (maxScore <= 0) return round.scores.map((s) => ({ playerId: s.playerId, bonusPoints: 0 }));
  return round.scores.map((s) => ({
    playerId: s.playerId,
    bonusPoints: s.score === maxScore ? bonusPointsAmount : 0,
  }));
}

function syncElimination(game: Game): Game {
  if (game.scoringRule !== "elimination" || game.eliminationThreshold <= 0) return game;
  return {
    ...game,
    players: game.players.map((p) => {
      const total = game.rounds.reduce((sum, round) => {
        const entry = round.scores.find((s) => s.playerId === p.id);
        return sum + (entry ? entry.score + entry.bonusPoints : 0);
      }, 0);
      return { ...p, isEliminated: total >= game.eliminationThreshold };
    }),
  };
}

function updateRoundScores(game: Game, roundNumber: number, updater: (scores: ScoreEntry[]) => ScoreEntry[]): Game {
  return {
    ...game,
    rounds: game.rounds.map((r) =>
      r.roundNumber === roundNumber ? { ...r, scores: updater(r.scores) } : r
    ),
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      game: null,
      undoStack: [],
      redoStack: [],

      createGame: (name, scoringRule, teamMode, totalRounds, players, eliminationThreshold, bonusPointsAmount) => {
        const game: Game = {
          id: generateId(),
          name,
          scoringRule,
          teamMode,
          totalRounds,
          currentRound: 1,
          players,
          rounds: createEmptyRounds(totalRounds, players),
          isFinished: false,
          createdAt: new Date().toISOString(),
          eliminationThreshold,
          bonusPointsAmount,
        };
        set({ game, undoStack: [], redoStack: [] });
      },

      setScore: (roundNumber, playerId, score) => {
        const { game, undoStack } = get();
        if (!game) return;
        const round = game.rounds.find((r) => r.roundNumber === roundNumber);
        if (!round || round.isLocked) return;
        const oldEntry = round.scores.find((s) => s.playerId === playerId);
        const oldScore = oldEntry ? oldEntry.score : 0;

        set({
          undoStack: [...undoStack, { type: "SET_SCORE", payload: { roundNumber, playerId, oldScore, newScore: score } }],
          redoStack: [],
          game: syncElimination(updateRoundScores(game, roundNumber, (scores) =>
            scores.map((s) => (s.playerId === playerId ? { ...s, score } : s))
          )),
        });
      },

      lockRound: (roundNumber) => {
        const { game, undoStack } = get();
        if (!game) return;
        const round = game.rounds.find((r) => r.roundNumber === roundNumber);
        if (!round || round.isLocked) return;

        const previousBonuses = round.scores.map((s) => ({ playerId: s.playerId, bonusPoints: s.bonusPoints }));
        let calculatedBonuses = previousBonuses;

        if (game.scoringRule === "bonus_per_round" && game.bonusPointsAmount > 0) {
          calculatedBonuses = applyBonusToRound(round, game.bonusPointsAmount);
        }

        const finalCalculatedBonuses = calculatedBonuses;
        set({
          undoStack: [...undoStack, { type: "LOCK_ROUND", payload: { roundNumber, previousBonuses, calculatedBonuses: finalCalculatedBonuses } }],
          redoStack: [],
          game: syncElimination({
            ...game,
            rounds: game.rounds.map((r) =>
              r.roundNumber === roundNumber
                ? {
                    ...r,
                    isLocked: true,
                    scores: r.scores.map((s) => {
                      const bonus = finalCalculatedBonuses.find((b) => b.playerId === s.playerId);
                      return { ...s, bonusPoints: bonus ? bonus.bonusPoints : s.bonusPoints };
                    }),
                  }
                : r
            ),
          }),
        });
      },

      unlockRound: (roundNumber) => {
        const { game, undoStack } = get();
        if (!game) return;
        const round = game.rounds.find((r) => r.roundNumber === roundNumber);
        if (!round || !round.isLocked) return;

        const previousBonuses = round.scores.map((s) => ({ playerId: s.playerId, bonusPoints: s.bonusPoints }));
        const shouldClearBonus = game.scoringRule === "bonus_per_round";

        set({
          undoStack: [...undoStack, { type: "UNLOCK_ROUND", payload: { roundNumber, previousBonuses } }],
          redoStack: [],
          game: syncElimination({
            ...game,
            rounds: game.rounds.map((r) =>
              r.roundNumber === roundNumber
                ? {
                    ...r,
                    isLocked: false,
                    scores: shouldClearBonus
                      ? r.scores.map((s) => ({ ...s, bonusPoints: 0 }))
                      : r.scores,
                  }
                : r
            ),
          }),
        });
      },

      advanceRound: () => {
        const { game } = get();
        if (!game) return;
        const nextRound = Math.min(game.currentRound + 1, game.totalRounds);
        set({ game: { ...game, currentRound: nextRound } });
      },

      eliminatePlayer: (playerId) => {
        const { game, undoStack } = get();
        if (!game) return;
        set({
          undoStack: [...undoStack, { type: "ELIMINATE_PLAYER", payload: { playerId } }],
          redoStack: [],
          game: {
            ...game,
            players: game.players.map((p) => (p.id === playerId ? { ...p, isEliminated: true } : p)),
          },
        });
      },

      revivePlayer: (playerId) => {
        const { game } = get();
        if (!game) return;
        set({
          game: {
            ...game,
            players: game.players.map((p) => (p.id === playerId ? { ...p, isEliminated: false } : p)),
          },
        });
      },

      finishGame: () => {
        const { game } = get();
        if (!game) return;
        set({ game: { ...game, isFinished: true } });
      },

      undo: () => {
        const { game, undoStack, redoStack } = get();
        if (!game || undoStack.length === 0) return;
        const action = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);
        const newRedoStack = [...redoStack, action];

        if (action.type === "SET_SCORE") {
          const { roundNumber, playerId, oldScore } = action.payload;
          set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            game: syncElimination(updateRoundScores(game, roundNumber, (scores) =>
              scores.map((s) => (s.playerId === playerId ? { ...s, score: oldScore } : s))
            )),
          });
        } else if (action.type === "LOCK_ROUND") {
          const { roundNumber, previousBonuses } = action.payload;
          set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            game: syncElimination({
              ...game,
              rounds: game.rounds.map((r) =>
                r.roundNumber === roundNumber
                  ? {
                      ...r,
                      isLocked: false,
                      scores: r.scores.map((s) => {
                        const prev = previousBonuses.find((b) => b.playerId === s.playerId);
                        return { ...s, bonusPoints: prev ? prev.bonusPoints : 0 };
                      }),
                    }
                  : r
              ),
            }),
          });
        } else if (action.type === "UNLOCK_ROUND") {
          const { roundNumber, previousBonuses } = action.payload;
          set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            game: syncElimination({
              ...game,
              rounds: game.rounds.map((r) =>
                r.roundNumber === roundNumber
                  ? {
                      ...r,
                      isLocked: true,
                      scores: r.scores.map((s) => {
                        const prev = previousBonuses.find((b) => b.playerId === s.playerId);
                        return { ...s, bonusPoints: prev ? prev.bonusPoints : 0 };
                      }),
                    }
                  : r
              ),
            }),
          });
        } else if (action.type === "ELIMINATE_PLAYER") {
          const { playerId } = action.payload;
          set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            game: {
              ...game,
              players: game.players.map((p) => (p.id === playerId ? { ...p, isEliminated: false } : p)),
            },
          });
        }
      },

      redo: () => {
        const { game, undoStack, redoStack } = get();
        if (!game || redoStack.length === 0) return;
        const action = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);
        const newUndoStack = [...undoStack, action];

        if (action.type === "SET_SCORE") {
          const { roundNumber, playerId, newScore } = action.payload;
          set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            game: syncElimination(updateRoundScores(game, roundNumber, (scores) =>
              scores.map((s) => (s.playerId === playerId ? { ...s, score: newScore } : s))
            )),
          });
        } else if (action.type === "LOCK_ROUND") {
          const { roundNumber, calculatedBonuses } = action.payload;
          set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            game: syncElimination({
              ...game,
              rounds: game.rounds.map((r) =>
                r.roundNumber === roundNumber
                  ? {
                      ...r,
                      isLocked: true,
                      scores: r.scores.map((s) => {
                        const bonus = calculatedBonuses.find((b) => b.playerId === s.playerId);
                        return { ...s, bonusPoints: bonus ? bonus.bonusPoints : 0 };
                      }),
                    }
                  : r
              ),
            }),
          });
        } else if (action.type === "UNLOCK_ROUND") {
          const { roundNumber } = action.payload;
          set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            game: syncElimination({
              ...game,
              rounds: game.rounds.map((r) =>
                r.roundNumber === roundNumber
                  ? {
                      ...r,
                      isLocked: false,
                      scores: r.scores.map((s) => ({ ...s, bonusPoints: 0 })),
                    }
                  : r
              ),
            }),
          });
        } else if (action.type === "ELIMINATE_PLAYER") {
          const { playerId } = action.payload;
          set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            game: {
              ...game,
              players: game.players.map((p) => (p.id === playerId ? { ...p, isEliminated: true } : p)),
            },
          });
        }
      },

      resetGame: () => set({ game: null, undoStack: [], redoStack: [] }),

      getPlayerTotal: (playerId: string) => {
        const { game } = get();
        if (!game) return 0;
        return game.rounds.reduce((total, round) => {
          const entry = round.scores.find((s) => s.playerId === playerId);
          return total + (entry ? entry.score + entry.bonusPoints : 0);
        }, 0);
      },

      getPlayerRanking: () => {
        const { game, getPlayerTotal } = get();
        if (!game) return [];
        const totals = game.players.map((p) => ({
          playerId: p.id,
          total: getPlayerTotal(p.id),
          isEliminated: p.isEliminated,
        }));

        const sorted = [...totals].sort((a, b) => {
          if (game.scoringRule === "elimination") {
            if (a.isEliminated && !b.isEliminated) return 1;
            if (!a.isEliminated && b.isEliminated) return -1;
            return b.total - a.total;
          }
          if (game.scoringRule === "lowest_wins") {
            return a.total - b.total;
          }
          return b.total - a.total;
        });

        const topScore = sorted.length > 0 ? sorted[0].total : 0;

        return sorted.map((item, index) => ({
          playerId: item.playerId,
          rank: index + 1,
          total: item.total,
          gap: item.total - topScore,
        }));
      },
    }),
    {
      name: "game-store",
    }
  )
);

interface HistoryState {
  histories: GameHistory[];
  addHistory: (game: Game) => void;
  deleteHistory: (id: string) => void;
  getStats: () => PlayerStats[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      histories: [],

      addHistory: (game: Game) => {
        const ranking = useGameStore.getState().getPlayerRanking();
        const winnerId = ranking.length > 0 ? ranking[0].playerId : "";
        const winner = game.players.find((p) => p.id === winnerId);
        const history: GameHistory = {
          id: game.id,
          name: game.name,
          scoringRule: game.scoringRule,
          players: game.players,
          rounds: game.rounds,
          totalRounds: game.totalRounds,
          winner: winner ? winner.name : "",
          createdAt: game.createdAt,
          finishedAt: new Date().toISOString(),
        };
        set({ histories: [history, ...get().histories] });
      },

      deleteHistory: (id: string) => {
        set({ histories: get().histories.filter((h) => h.id !== id) });
      },

      getStats: () => {
        const { histories } = get();
        const statsMap = new Map<string, PlayerStats>();

        histories.forEach((game) => {
          const ranking = computeRanking(game.rounds, game.players, game.scoringRule);
          const winnerId = ranking.length > 0 ? ranking[0].playerId : "";

          game.players.forEach((player) => {
            if (!statsMap.has(player.name)) {
              statsMap.set(player.name, { playerName: player.name, wins: 0, comebacks: 0, totalGames: 0 });
            }
            const stats = statsMap.get(player.name)!;
            stats.totalGames += 1;
            if (player.id === winnerId) {
              stats.wins += 1;
            }
          });

          let wasLeading: string | null = null;
          if (game.rounds.length >= 2) {
            const firstRoundScores = game.rounds[0].scores;
            const firstRoundRanking = [...firstRoundScores].sort((a, b) =>
              game.scoringRule === "lowest_wins" ? a.score - b.score : b.score - a.score
            );
            wasLeading = firstRoundRanking.length > 0 ? firstRoundRanking[0].playerId : null;
          }

          if (wasLeading && wasLeading !== winnerId) {
            const comebackPlayer = game.players.find((p) => p.id === winnerId);
            if (comebackPlayer && statsMap.has(comebackPlayer.name)) {
              statsMap.get(comebackPlayer.name)!.comebacks += 1;
            }
          }
        });

        return Array.from(statsMap.values()).sort((a, b) => b.wins - a.wins);
      },
    }),
    {
      name: "history-store",
    }
  )
);

function computeRanking(rounds: Round[], players: Player[], scoringRule: ScoringRule) {
  const totals = players.map((p) => {
    const total = rounds.reduce((sum, round) => {
      const entry = round.scores.find((s) => s.playerId === p.id);
      return sum + (entry ? entry.score + entry.bonusPoints : 0);
    }, 0);
    return { playerId: p.id, total, isEliminated: p.isEliminated };
  });

  return [...totals].sort((a, b) => {
    if (scoringRule === "elimination") {
      if (a.isEliminated && !b.isEliminated) return 1;
      if (!a.isEliminated && b.isEliminated) return -1;
      return b.total - a.total;
    }
    if (scoringRule === "lowest_wins") return a.total - b.total;
    return b.total - a.total;
  });
}
