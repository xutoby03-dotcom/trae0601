import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Candidate, PipelineStatus, BonusStatus, InterviewFeedback } from '@/types'
import { mockCandidates } from '@/data/mockData'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function getNextStatus(current: PipelineStatus): PipelineStatus | null {
  const order: PipelineStatus[] = ['pending', 'scheduling', 'technical', 'final', 'hired']
  const idx = order.indexOf(current)
  if (idx === -1 || idx >= order.length - 1) return null
  return order[idx + 1]
}

function deriveBonusStatus(
  status: PipelineStatus,
  onboarded?: boolean,
  confirmedPermanent?: boolean
): BonusStatus {
  if (status !== 'hired') return 'pending'
  if (confirmedPermanent) return 'paid'
  if (onboarded) return 'available'
  return 'pending'
}

interface ReferralState {
  candidates: Candidate[]
  filterPosition: string
  filterReferrer: string

  setFilterPosition: (pos: string) => void
  setFilterReferrer: (ref: string) => void

  advanceStatus: (
    candidateId: string,
    feedback: string,
    interviewer?: string
  ) => void

  markRejected: (
    candidateId: string,
    feedback: string,
    interviewer?: string
  ) => void

  markOnboarded: (candidateId: string) => void
  markConfirmedPermanent: (candidateId: string) => void

  addCandidate: (candidate: Omit<Candidate, 'id' | 'feedbacks' | 'status' | 'bonusStatus'>) => void
}

export const useReferralStore = create<ReferralState>()(
  persist(
    (set, get) => ({
      candidates: mockCandidates,
      filterPosition: '',
      filterReferrer: '',

      setFilterPosition: (pos) => set({ filterPosition: pos }),
      setFilterReferrer: (ref) => set({ filterReferrer: ref }),

      advanceStatus: (candidateId, feedback, interviewer) =>
        set((state) => {
          const candidates = state.candidates.map((c) => {
            if (c.id !== candidateId) return c
            const next = getNextStatus(c.status)
            if (!next) return c
            const newFeedback: InterviewFeedback = {
              id: generateId(),
              status: next,
              feedback,
              interviewer,
              createdAt: new Date().toISOString().slice(0, 10),
            }
            const updated: Candidate = {
              ...c,
              status: next,
              feedbacks: [...c.feedbacks, newFeedback],
            }
            updated.bonusStatus = deriveBonusStatus(
              updated.status,
              updated.onboarded,
              updated.confirmedPermanent
            )
            return updated
          })
          return { candidates }
        }),

      markRejected: (candidateId, feedback, interviewer) =>
        set((state) => {
          const candidates = state.candidates.map((c) => {
            if (c.id !== candidateId) return c
            const newFeedback: InterviewFeedback = {
              id: generateId(),
              status: 'rejected',
              feedback,
              interviewer,
              createdAt: new Date().toISOString().slice(0, 10),
            }
            const updated: Candidate = {
              ...c,
              status: 'rejected',
              feedbacks: [...c.feedbacks, newFeedback],
              bonusStatus: 'pending',
            }
            return updated
          })
          return { candidates }
        }),

      markOnboarded: (candidateId) =>
        set((state) => {
          const candidates = state.candidates.map((c) => {
            if (c.id !== candidateId) return c
            const updated: Candidate = { ...c, onboarded: true }
            updated.bonusStatus = deriveBonusStatus(
              updated.status,
              updated.onboarded,
              updated.confirmedPermanent
            )
            return updated
          })
          return { candidates }
        }),

      markConfirmedPermanent: (candidateId) =>
        set((state) => {
          const candidates = state.candidates.map((c) => {
            if (c.id !== candidateId) return c
            const updated: Candidate = { ...c, onboarded: true, confirmedPermanent: true }
            updated.bonusStatus = deriveBonusStatus(
              updated.status,
              updated.onboarded,
              updated.confirmedPermanent
            )
            return updated
          })
          return { candidates }
        }),

      addCandidate: (data) =>
        set((state) => {
          const newCandidate: Candidate = {
            id: generateId(),
            ...data,
            status: 'pending',
            bonusStatus: 'pending',
            feedbacks: [],
          }
          return { candidates: [...state.candidates, newCandidate] }
        }),
    }),
    {
      name: 'referral-storage',
    }
  )
)

export function getNextStatusLabel(current: PipelineStatus): string | null {
  const next = getNextStatus(current)
  if (!next) return null
  const labels: Record<PipelineStatus, string | null> = {
    pending: '约面',
    scheduling: '技术面',
    technical: '终面',
    final: '录用',
    hired: null,
    rejected: null,
  }
  return labels[current]
}
