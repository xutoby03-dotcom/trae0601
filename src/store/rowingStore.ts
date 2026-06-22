import { create } from "zustand"

export type WaterDirection = "顺流" | "逆流" | "侧流"
export type WindSpeed = "无风" | "微风" | "中风" | "强风"
export type WindDirection = "顺风" | "逆风" | "侧风" | "无风"
export type YawDirection = "左" | "右"

export interface TrainingConfig {
  boatId: string
  seat1Name: string
  seat2Name: string
  targetStrokeRate: number
  segments: number[]
  waterDirection: WaterDirection
  windSpeed: WindSpeed
  windDirection: WindDirection
}

export interface SegmentRecord {
  segmentIndex: number
  entryTimeDiff: number
  yawAngle: number
  yawDirection: YawDirection
  sprintSpeedDrop: number
  commandResponseTime: number
  desyncIndex: number
}

export interface TrainingSession {
  id: string
  config: TrainingConfig
  records: SegmentRecord[]
  reviewSegments: number[]
  createdAt: string
}

export function calcDesyncIndex(r: Omit<SegmentRecord, "desyncIndex">): number {
  return (
    (r.entryTimeDiff / 100) * 0.35 +
    (r.yawAngle / 5) * 0.25 +
    (r.sprintSpeedDrop / 5) * 0.25 +
    (r.commandResponseTime / 200) * 0.15
  )
}

export function getDesyncLevel(index: number): "good" | "caution" | "danger" {
  if (index < 0.4) return "good"
  if (index < 0.7) return "caution"
  return "danger"
}

const STORAGE_KEY = "rowing-sessions"

function loadSessions(): TrainingSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: TrainingSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

interface RowingStore {
  config: TrainingConfig
  currentSegment: number
  records: SegmentRecord[]
  sessions: TrainingSession[]
  currentSessionId: string | null

  setConfig: (config: Partial<TrainingConfig>) => void
  addSegment: () => void
  removeSegment: (index: number) => void
  updateSegment: (index: number, distance: number) => void
  setCurrentSegment: (index: number) => void
  saveRecord: (record: Omit<SegmentRecord, "desyncIndex">) => void
  startSession: () => void
  finishSession: () => void
  toggleReviewSegment: (segmentIndex: number) => void
  loadSession: (id: string) => void
  deleteSession: (id: string) => void
  resetConfig: () => void
}

const defaultConfig: TrainingConfig = {
  boatId: "",
  seat1Name: "",
  seat2Name: "",
  targetStrokeRate: 30,
  segments: [500],
  waterDirection: "顺流",
  windSpeed: "无风",
  windDirection: "无风",
}

export const useRowingStore = create<RowingStore>((set, get) => ({
  config: { ...defaultConfig },
  currentSegment: 0,
  records: [],
  sessions: loadSessions(),
  currentSessionId: null,

  setConfig: (partial) =>
    set((s) => ({ config: { ...s.config, ...partial } })),

  addSegment: () =>
    set((s) => ({ config: { ...s.config, segments: [...s.config.segments, 500] } })),

  removeSegment: (index) =>
    set((s) => ({
      config: {
        ...s.config,
        segments: s.config.segments.filter((_, i) => i !== index),
      },
    })),

  updateSegment: (index, distance) =>
    set((s) => ({
      config: {
        ...s.config,
        segments: s.config.segments.map((d, i) => (i === index ? distance : d)),
      },
    })),

  setCurrentSegment: (index) => set({ currentSegment: index }),

  saveRecord: (record) =>
    set((s) => {
      const desyncIndex = calcDesyncIndex(record)
      const newRecord: SegmentRecord = { ...record, desyncIndex }
      const records = [...s.records.filter((r) => r.segmentIndex !== record.segmentIndex), newRecord]
      return { records }
    }),

  startSession: () => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    set({ currentSessionId: id, currentSegment: 0, records: [] })
  },

  finishSession: () =>
    set((s) => {
      if (!s.currentSessionId) return s
      const reviewSegments = s.records
        .filter((r) => r.desyncIndex >= 0.7)
        .map((r) => r.segmentIndex)
      const session: TrainingSession = {
        id: s.currentSessionId,
        config: { ...s.config },
        records: [...s.records],
        reviewSegments,
        createdAt: new Date().toISOString(),
      }
      const sessions = [...s.sessions.filter((ses) => ses.id !== session.id), session]
      saveSessions(sessions)
      return { sessions, currentSessionId: null }
    }),

  toggleReviewSegment: (segmentIndex) =>
    set((s) => {
      if (!s.currentSessionId) return s
      const sessionIdx = s.sessions.findIndex((ses) => ses.id === s.currentSessionId)
      if (sessionIdx === -1) return s
      const session = s.sessions[sessionIdx]
      const reviewSegments = session.reviewSegments.includes(segmentIndex)
        ? session.reviewSegments.filter((i) => i !== segmentIndex)
        : [...session.reviewSegments, segmentIndex]
      const updated = { ...session, reviewSegments }
      const sessions = s.sessions.map((ses, i) => (i === sessionIdx ? updated : ses))
      saveSessions(sessions)
      return { sessions }
    }),

  loadSession: (id) =>
    set((s) => {
      const session = s.sessions.find((ses) => ses.id === id)
      if (!session) return s
      return {
        config: { ...session.config },
        records: [...session.records],
        currentSessionId: id,
        currentSegment: 0,
      }
    }),

  deleteSession: (id) =>
    set((s) => {
      const sessions = s.sessions.filter((ses) => ses.id !== id)
      saveSessions(sessions)
      return { sessions }
    }),

  resetConfig: () => set({ config: { ...defaultConfig }, records: [], currentSegment: 0 }),
}))
