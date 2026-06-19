import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameSession,
  Registration,
  RegistrationStatus,
  CapacityInfo,
  HorrorConflict,
  RegistrationCheck,
} from "@/types";
import { mockSessions, mockRegistrations } from "@/data/mock";
import { usePlayerStore } from "./playerStore";

interface SessionStore {
  sessions: GameSession[];
  registrations: Registration[];

  addSession: (
    session: Omit<GameSession, "id" | "createdAt" | "status">
  ) => void;
  updateSession: (id: string, updates: Partial<GameSession>) => void;
  deleteSession: (id: string) => void;
  getSessionById: (id: string) => GameSession | undefined;

  addRegistration: (sessionId: string, playerId: string) => void;
  removeRegistration: (registrationId: string) => void;
  markPaid: (registrationId: string) => void;
  markCheckedIn: (registrationId: string) => void;
  markWithdrew: (registrationId: string) => void;
  assignSubstitute: (
    sessionId: string,
    withdrewRegistrationId: string,
    substitutePlayerId: string
  ) => void;
  updateRegistrationStatus: (
    registrationId: string,
    status: RegistrationStatus
  ) => void;

  getRegistrationsBySession: (sessionId: string) => Registration[];
  getActiveRegistrationsBySession: (sessionId: string) => Registration[];
  getCapacityInfo: (sessionId: string) => CapacityInfo;
  checkRegistration: (
    sessionId: string,
    playerIds: string[]
  ) => RegistrationCheck;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: mockSessions,
      registrations: mockRegistrations,

      addSession: (session) =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            {
              ...session,
              id: `s_${Date.now()}`,
              createdAt: new Date().toISOString().split("T")[0],
              status: "pending",
            },
          ],
        })),

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          registrations: state.registrations.filter((r) => r.sessionId !== id),
        })),

      getSessionById: (id) => get().sessions.find((s) => s.id === id),

      addRegistration: (sessionId, playerId) =>
        set((state) => {
          if (
            state.registrations.some(
              (r) =>
                r.sessionId === sessionId &&
                r.playerId === playerId &&
                r.status !== "withdrew"
            )
          )
            return state;
          return {
            registrations: [
              ...state.registrations,
              {
                id: `r_${Date.now()}`,
                sessionId,
                playerId,
                status: "registered",
                isPaid: false,
                isSubstitute: false,
                registeredAt: new Date().toISOString().split("T")[0],
              },
            ],
          };
        }),

      removeRegistration: (registrationId) =>
        set((state) => ({
          registrations: state.registrations.filter(
            (r) => r.id !== registrationId
          ),
        })),

      markPaid: (registrationId) =>
        set((state) => ({
          registrations: state.registrations.map((r) =>
            r.id === registrationId
              ? {
                  ...r,
                  isPaid: true,
                  paidAt: new Date().toISOString().split("T")[0],
                }
              : r
          ),
        })),

      markCheckedIn: (registrationId) =>
        set((state) => ({
          registrations: state.registrations.map((r) =>
            r.id === registrationId
              ? {
                  ...r,
                  status: "checkedIn",
                  checkedInAt: new Date().toISOString().split("T")[0],
                }
              : r
          ),
        })),

      markWithdrew: (registrationId) =>
        set((state) => ({
          registrations: state.registrations.map((r) =>
            r.id === registrationId
              ? { ...r, status: "withdrew", isSubstitute: false }
              : r
          ),
        })),

      assignSubstitute: (sessionId, withdrewRegistrationId, substitutePlayerId) =>
        set((state) => {
          const withdrew = state.registrations.find(
            (r) => r.id === withdrewRegistrationId
          );
          if (!withdrew) return state;
          const updatedRegistrations = state.registrations.map((r) =>
            r.id === withdrewRegistrationId
              ? { ...r, status: "withdrew" as RegistrationStatus }
              : r
          );
          return {
            registrations: [
              ...updatedRegistrations,
              {
                id: `r_${Date.now()}`,
                sessionId,
                playerId: substitutePlayerId,
                status: "substitute",
                isPaid: false,
                isSubstitute: true,
                substituteOfId: withdrew.playerId,
                registeredAt: new Date().toISOString().split("T")[0],
              },
            ],
          };
        }),

      updateRegistrationStatus: (registrationId, status) =>
        set((state) => ({
          registrations: state.registrations.map((r) =>
            r.id === registrationId ? { ...r, status } : r
          ),
        })),

      getRegistrationsBySession: (sessionId) =>
        get().registrations.filter((r) => r.sessionId === sessionId),

      getActiveRegistrationsBySession: (sessionId) =>
        get().registrations.filter(
          (r) => r.sessionId === sessionId && r.status !== "withdrew"
        ),

      getCapacityInfo: (sessionId) => {
        const session = get().getSessionById(sessionId);
        if (!session) {
          return { currentCount: 0, enough: false, gap: 0, overflow: 0 };
        }
        const currentCount = get().getActiveRegistrationsBySession(sessionId)
          .length;
        return {
          currentCount,
          enough: currentCount >= session.minPlayers,
          gap: Math.max(0, session.minPlayers - currentCount),
          overflow: Math.max(0, currentCount - session.maxPlayers),
        };
      },

      checkRegistration: (sessionId, playerIds) => {
        const session = get().getSessionById(sessionId);
        const players = usePlayerStore.getState().players;
        const existing = get().getActiveRegistrationsBySession(sessionId);
        const existingPlayerIds = existing.map((r) => r.playerId);
        const allPlayerIds = [...new Set([...existingPlayerIds, ...playerIds])];
        const currentCount = allPlayerIds.length;

        let capacity: CapacityInfo = {
          currentCount: 0,
          enough: false,
          gap: 0,
          overflow: 0,
        };
        if (session) {
          capacity = {
            currentCount,
            enough: currentCount >= session.minPlayers,
            gap: Math.max(0, session.minPlayers - currentCount),
            overflow: Math.max(0, currentCount - session.maxPlayers),
          };
        }

        const horrorConflicts: HorrorConflict[] = [];
        if (session?.isHorror) {
          allPlayerIds.forEach((pid) => {
            const p = players.find((pl) => pl.id === pid);
            if (!p) return;
            if (p.courageLevel <= 2) {
              horrorConflicts.push({
                playerId: pid,
                playerName: p.nickname,
                reason: `胆量等级${p.courageLevel}级，恐怖本压力较大`,
                severity: "danger",
              });
            } else if (p.courageLevel === 3) {
              horrorConflicts.push({
                playerId: pid,
                playerName: p.nickname,
                reason: `胆量等级普通，恐怖本可能需要心理建设`,
                severity: "warning",
              });
            }
            const matchTaboo = p.tabooThemes.filter((t) =>
              session.theme.includes(t)
            );
            if (matchTaboo.length > 0) {
              horrorConflicts.push({
                playerId: pid,
                playerName: p.nickname,
                reason: `忌讳主题冲突: ${matchTaboo.join("、")}`,
                severity: "danger",
              });
            }
          });
        }

        const conflictRatio =
          allPlayerIds.length > 0
            ? horrorConflicts.filter((c) => c.severity === "danger").length /
              allPlayerIds.length
            : 0;
        let npcReductionSuggestion:
          | "none"
          | "mild"
          | "moderate"
          | "strong" = "none";
        if (session?.isHorror) {
          if (conflictRatio >= 0.5) npcReductionSuggestion = "strong";
          else if (conflictRatio >= 0.3) npcReductionSuggestion = "moderate";
          else if (conflictRatio > 0) npcReductionSuggestion = "mild";
        }

        return {
          capacity,
          horrorConflicts,
          npcReductionSuggestion,
          needCarpool: !capacity.enough,
        };
      },
    }),
    { name: "escape-room-sessions" }
  )
);
