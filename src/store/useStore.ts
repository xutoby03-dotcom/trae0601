import { create } from 'zustand';
import { Session, Envelope, FlowEvent, EnvelopeStatus, FlowEventType, EnvelopeFormData } from '@/types';
import { mockSessions, mockEnvelopes, mockFlowEvents } from '@/data/mockData';

export type StatusFilter = EnvelopeStatus | 'wrongly_taken' | null;

interface StoreState {
  sessions: Session[];
  envelopes: Envelope[];
  flowEvents: FlowEvent[];
  currentSessionId: string | null;
  selectedEnvelopeId: string | null;
  statusFilter: StatusFilter;

  setCurrentSession: (id: string | null) => void;
  setSelectedEnvelope: (id: string | null) => void;
  setStatusFilter: (filter: StatusFilter) => void;

  addSession: (session: Omit<Session, 'id'>) => void;
  addEnvelope: (data: EnvelopeFormData) => void;
  updateEnvelope: (id: string, data: Partial<EnvelopeFormData>) => void;
  deleteEnvelope: (id: string) => void;

  addFlowEvent: (envelopeId: string, eventType: FlowEventType, triggeredBy: string, note?: string) => void;
  updateEnvelopeStatus: (envelopeId: string, status: EnvelopeStatus) => void;

  getEnvelopeEvents: (envelopeId: string) => FlowEvent[];
  getSessionEnvelopes: (sessionId: string) => Envelope[];
  getFilteredEnvelopes: (sessionId: string) => Envelope[];
  envelopeMatchesFilter: (envelopeId: string) => boolean;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useStore = create<StoreState>((set, get) => ({
  sessions: mockSessions,
  envelopes: mockEnvelopes,
  flowEvents: mockFlowEvents,
  currentSessionId: mockSessions[0]?.id ?? null,
  selectedEnvelopeId: null,
  statusFilter: null,

  setCurrentSession: (id) => set({ currentSessionId: id, selectedEnvelopeId: null, statusFilter: null }),
  setSelectedEnvelope: (id) => set({ selectedEnvelopeId: id }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  envelopeMatchesFilter: (envelopeId) => {
    const state = get();
    const env = state.envelopes.find((e) => e.id === envelopeId);
    if (!env) return false;
    const f = state.statusFilter;
    if (!f) return true;
    if (f === 'wrongly_taken') {
      return state.flowEvents.some((fe) => fe.envelopeId === envelopeId && fe.eventType === 'wrongly_taken');
    }
    return env.status === f;
  },

  getFilteredEnvelopes: (sessionId) =>
    get()
      .getSessionEnvelopes(sessionId)
      .filter((env) => get().envelopeMatchesFilter(env.id)),

  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, { ...session, id: generateId('sess') }],
    })),

  addEnvelope: (data) => {
    const state = get();
    if (!state.currentSessionId) return;
    const newEnvelope: Envelope = {
      id: generateId('env'),
      sessionId: state.currentSessionId,
      ...data,
      status: 'pending',
    };
    set((s) => ({ envelopes: [...s.envelopes, newEnvelope] }));
    get().addFlowEvent(newEnvelope.id, 'created', 'DM', '新建封套');
  },

  updateEnvelope: (id, data) =>
    set((state) => ({
      envelopes: state.envelopes.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  deleteEnvelope: (id) =>
    set((state) => ({
      envelopes: state.envelopes.filter((e) => e.id !== id),
      flowEvents: state.flowEvents.filter((f) => f.envelopeId !== id),
      selectedEnvelopeId: state.selectedEnvelopeId === id ? null : state.selectedEnvelopeId,
    })),

  addFlowEvent: (envelopeId, eventType, triggeredBy, note) => {
    const event: FlowEvent = {
      id: generateId('fe'),
      envelopeId,
      eventType,
      triggeredBy,
      timestamp: new Date().toISOString(),
      note,
    };
    set((state) => ({ flowEvents: [...state.flowEvents, event] }));
  },

  updateEnvelopeStatus: (envelopeId, status) =>
    set((state) => ({
      envelopes: state.envelopes.map((e) => (e.id === envelopeId ? { ...e, status } : e)),
    })),

  getEnvelopeEvents: (envelopeId) =>
    get()
      .flowEvents.filter((e) => e.envelopeId === envelopeId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),

  getSessionEnvelopes: (sessionId) =>
    get().envelopes.filter((e) => e.sessionId === sessionId),
}));
