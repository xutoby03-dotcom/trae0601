import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Plan, GiftCandidate, Participant, AvoidanceNote, OrderInfo, BlessingAssignment, RefundRecord, BudgetAdjustment, PlanStatus, PackagingStatus } from '@/types'

const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

interface PlansState {
  plans: Plan[]
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt' | 'giftCandidates' | 'participants' | 'avoidanceNotes' | 'orderInfo' | 'blessingAssignments' | 'refundRecords' | 'budgetAdjustments'> & { giftCandidates: GiftCandidate[]; participants: Participant[] }) => string
  updatePlan: (id: string, updates: Partial<Plan>) => void
  deletePlan: (id: string) => void
  addGiftCandidate: (planId: string, candidate: Omit<GiftCandidate, 'id' | 'votes'>) => void
  removeGiftCandidate: (planId: string, candidateId: string) => void
  voteForCandidate: (planId: string, candidateId: string, participantId: string) => void
  removeVote: (planId: string, candidateId: string, participantId: string) => void
  addParticipant: (planId: string, name: string) => void
  removeParticipant: (planId: string, participantId: string) => void
  updatePledge: (planId: string, participantId: string, amount: number) => void
  togglePaid: (planId: string, participantId: string) => void
  setAdvancedAmount: (planId: string, participantId: string, amount: number) => void
  addAvoidanceNote: (planId: string, note: Omit<AvoidanceNote, 'id' | 'createdAt'>) => void
  removeAvoidanceNote: (planId: string, noteId: string) => void
  updateOrderInfo: (planId: string, info: Partial<OrderInfo>) => void
  addBlessingAssignment: (planId: string, assignment: Omit<BlessingAssignment, 'id'>) => void
  updateBlessingAssignment: (planId: string, assignmentId: string, updates: Partial<BlessingAssignment>) => void
  removeBlessingAssignment: (planId: string, assignmentId: string) => void
  addRefundRecord: (planId: string, record: Omit<RefundRecord, 'id' | 'createdAt'>) => void
  addBudgetAdjustment: (planId: string, adjustment: Omit<BudgetAdjustment, 'id' | 'createdAt'>) => void
  updatePlanStatus: (planId: string, status: PlanStatus) => void
  updatePackagingStatus: (planId: string, status: PackagingStatus) => void
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set) => ({
      plans: [],

      addPlan: (planData) => {
        const id = genId()
        const newPlan: Plan = {
          ...planData,
          id,
          createdAt: new Date().toISOString(),
          giftCandidates: planData.giftCandidates.map(c => ({ ...c, id: genId(), votes: [] })),
          participants: planData.participants.map(p => ({ ...p, id: genId() })),
          avoidanceNotes: [],
          orderInfo: null,
          blessingAssignments: [],
          refundRecords: [],
          budgetAdjustments: [],
        }
        set((s) => ({ plans: [newPlan, ...s.plans] }))
        return id
      },

      updatePlan: (id, updates) =>
        set((s) => ({
          plans: s.plans.map(p => p.id === id ? { ...p, ...updates } : p),
        })),

      deletePlan: (id) =>
        set((s) => ({ plans: s.plans.filter(p => p.id !== id) })),

      addGiftCandidate: (planId, candidate) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, giftCandidates: [...p.giftCandidates, { ...candidate, id: genId(), votes: [] }] }
              : p
          ),
        })),

      removeGiftCandidate: (planId, candidateId) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, giftCandidates: p.giftCandidates.filter(c => c.id !== candidateId) }
              : p
          ),
        })),

      voteForCandidate: (planId, candidateId, participantId) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? {
                  ...p,
                  giftCandidates: p.giftCandidates.map(c =>
                    c.id === candidateId
                      ? { ...c, votes: c.votes.includes(participantId) ? c.votes : [...c.votes, participantId] }
                      : { ...c, votes: c.votes.filter(v => v !== participantId) }
                  ),
                }
              : p
          ),
        })),

      removeVote: (planId, candidateId, participantId) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? {
                  ...p,
                  giftCandidates: p.giftCandidates.map(c =>
                    c.id === candidateId
                      ? { ...c, votes: c.votes.filter(v => v !== participantId) }
                      : c
                  ),
                }
              : p
          ),
        })),

      addParticipant: (planId, name) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, participants: [...p.participants, { id: genId(), name, pledgedAmount: 0, hasPaid: false, advancedAmount: 0 }] }
              : p
          ),
        })),

      removeParticipant: (planId, participantId) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? {
                  ...p,
                  participants: p.participants.filter(pt => pt.id !== participantId),
                  giftCandidates: p.giftCandidates.map(c => ({
                    ...c,
                    votes: c.votes.filter(v => v !== participantId),
                  })),
                }
              : p
          ),
        })),

      updatePledge: (planId, participantId, amount) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, participants: p.participants.map(pt => pt.id === participantId ? { ...pt, pledgedAmount: amount } : pt) }
              : p
          ),
        })),

      togglePaid: (planId, participantId) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, participants: p.participants.map(pt => pt.id === participantId ? { ...pt, hasPaid: !pt.hasPaid } : pt) }
              : p
          ),
        })),

      setAdvancedAmount: (planId, participantId, amount) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, participants: p.participants.map(pt => pt.id === participantId ? { ...pt, advancedAmount: amount } : pt) }
              : p
          ),
        })),

      addAvoidanceNote: (planId, note) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, avoidanceNotes: [...p.avoidanceNotes, { ...note, id: genId(), createdAt: new Date().toISOString() }] }
              : p
          ),
        })),

      removeAvoidanceNote: (planId, noteId) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, avoidanceNotes: p.avoidanceNotes.filter(n => n.id !== noteId) }
              : p
          ),
        })),

      updateOrderInfo: (planId, info) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, orderInfo: { ...p.orderInfo ?? { orderNumber: '', courier: '', estimatedArrival: '', packagingStatus: 'none', actualArrival: '' }, ...info } }
              : p
          ),
        })),

      addBlessingAssignment: (planId, assignment) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, blessingAssignments: [...p.blessingAssignments, { ...assignment, id: genId() }] }
              : p
          ),
        })),

      updateBlessingAssignment: (planId, assignmentId, updates) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, blessingAssignments: p.blessingAssignments.map(b => b.id === assignmentId ? { ...b, ...updates } : b) }
              : p
          ),
        })),

      removeBlessingAssignment: (planId, assignmentId) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, blessingAssignments: p.blessingAssignments.filter(b => b.id !== assignmentId) }
              : p
          ),
        })),

      addRefundRecord: (planId, record) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, refundRecords: [...p.refundRecords, { ...record, id: genId(), createdAt: new Date().toISOString() }] }
              : p
          ),
        })),

      addBudgetAdjustment: (planId, adjustment) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? {
                  ...p,
                  totalBudget: p.totalBudget + adjustment.additionalAmount,
                  budgetAdjustments: [...p.budgetAdjustments, { ...adjustment, id: genId(), createdAt: new Date().toISOString() }],
                }
              : p
          ),
        })),

      updatePlanStatus: (planId, status) =>
        set((s) => ({
          plans: s.plans.map(p => p.id === planId ? { ...p, status } : p),
        })),

      updatePackagingStatus: (planId, status) =>
        set((s) => ({
          plans: s.plans.map(p =>
            p.id === planId
              ? { ...p, orderInfo: { ...p.orderInfo ?? { orderNumber: '', courier: '', estimatedArrival: '', packagingStatus: 'none', actualArrival: '' }, packagingStatus: status } }
              : p
          ),
        })),
    }),
    { name: 'birthday-gift-planner' }
  )
)
