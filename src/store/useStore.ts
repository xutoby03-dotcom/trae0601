import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Relative, Gift, Visit, VisitGift, Alert } from '@/types'

interface AppState {
  relatives: Relative[]
  gifts: Gift[]
  visits: Visit[]
  visitGifts: VisitGift[]

  addRelative: (r: Relative) => void
  updateRelative: (r: Relative) => void
  deleteRelative: (id: string) => void

  addGift: (g: Gift) => void
  updateGift: (g: Gift) => void
  deleteGift: (id: string) => void

  addVisit: (v: Visit) => void
  updateVisit: (v: Visit) => void
  deleteVisit: (id: string) => void

  addVisitGift: (vg: VisitGift) => void
  updateVisitGift: (vg: VisitGift) => void
  deleteVisitGift: (id: string) => void
  deleteVisitGiftsByVisitId: (visitId: string) => void

  getAlerts: () => Alert[]
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      relatives: [],
      gifts: [],
      visits: [],
      visitGifts: [],

      addRelative: (r) => set((s) => ({ relatives: [...s.relatives, r] })),
      updateRelative: (r) => set((s) => ({ relatives: s.relatives.map((x) => (x.id === r.id ? r : x)) })),
      deleteRelative: (id) => set((s) => ({ relatives: s.relatives.filter((x) => x.id !== id) })),

      addGift: (g) => set((s) => ({ gifts: [...s.gifts, g] })),
      updateGift: (g) => set((s) => ({ gifts: s.gifts.map((x) => (x.id === g.id ? g : x)) })),
      deleteGift: (id) => set((s) => ({ gifts: s.gifts.filter((x) => x.id !== id) })),

      addVisit: (v) => set((s) => ({ visits: [...s.visits, v] })),
      updateVisit: (v) => set((s) => ({ visits: s.visits.map((x) => (x.id === v.id ? v : x)) })),
      deleteVisit: (id) =>
        set((s) => ({
          visits: s.visits.filter((x) => x.id !== id),
          visitGifts: s.visitGifts.filter((x) => x.visitId !== id),
        })),

      addVisitGift: (vg) => set((s) => ({ visitGifts: [...s.visitGifts, vg] })),
      updateVisitGift: (vg) => set((s) => ({ visitGifts: s.visitGifts.map((x) => (x.id === vg.id ? vg : x)) })),
      deleteVisitGift: (id) => set((s) => ({ visitGifts: s.visitGifts.filter((x) => x.id !== id) })),
      deleteVisitGiftsByVisitId: (visitId) => set((s) => ({ visitGifts: s.visitGifts.filter((x) => x.visitId !== visitId) })),

      getAlerts: () => {
        const { relatives, gifts, visits, visitGifts } = get()
        const alerts: Alert[] = []
        const today = new Date().toISOString().slice(0, 10)

        visits.forEach((visit) => {
          const relative = relatives.find((r) => r.id === visit.relativeId)
          if (!relative) return

          const vGifts = visitGifts.filter((vg) => vg.visitId === visit.id)

          vGifts.forEach((vg) => {
            const gift = gifts.find((g) => g.id === vg.giftId)
            if (!gift) return

            if (relative.lastYearGift && gift.name && relative.lastYearGift.includes(gift.name)) {
              alerts.push({
                id: `dup-${visit.id}-${gift.id}`,
                type: 'duplicate',
                message: `给${relative.title}送的${gift.name}和去年重复了`,
                relativeId: relative.id,
                giftId: gift.id,
                visitId: visit.id,
              })
            }

            if (gift.shelfLife && visit.visitDate) {
              const shelfDate = new Date(gift.shelfLife)
              const visitDate = new Date(visit.visitDate)
              const diffDays = Math.ceil((shelfDate.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24))
              if (diffDays >= 0 && diffDays <= 7) {
                alerts.push({
                  id: `shelf-${visit.id}-${gift.id}`,
                  type: 'shelf_life',
                  message: `给${relative.title}的${gift.name}保质期只剩${diffDays}天`,
                  relativeId: relative.id,
                  giftId: gift.id,
                  visitId: visit.id,
                })
              }
              if (diffDays < 0) {
                alerts.push({
                  id: `shelf-exp-${visit.id}-${gift.id}`,
                  type: 'shelf_life',
                  message: `给${relative.title}的${gift.name}已过期`,
                  relativeId: relative.id,
                  giftId: gift.id,
                  visitId: visit.id,
                })
              }
            }
          })

          if (relative.budget > 0) {
            const totalCost = vGifts.reduce((sum, vg) => {
              const gift = gifts.find((g) => g.id === vg.giftId)
              return sum + (gift ? gift.unitPrice * vg.quantity : 0)
            }, 0)
            if (totalCost > relative.budget) {
              alerts.push({
                id: `budget-${visit.id}`,
                type: 'budget',
                message: `给${relative.title}的礼品花费${totalCost}元，超出预算${relative.budget}元`,
                relativeId: relative.id,
                visitId: visit.id,
              })
            }
          }
        })

        gifts.forEach((gift) => {
          if (!gift.purchased) {
            const relatedVisits = visitGifts.filter((vg) => vg.giftId === gift.id)
            if (relatedVisits.length > 0) {
              const upcomingVisit = relatedVisits
                .map((vg) => visits.find((v) => v.id === vg.visitId))
                .filter((v) => v && v.status === 'pending' && v.visitDate >= today)
                .sort((a, b) => a!.visitDate.localeCompare(b!.visitDate))[0]
              if (upcomingVisit) {
                const rel = relatives.find((r) => r.id === upcomingVisit.relativeId)
                alerts.push({
                  id: `unpurchased-${gift.id}-${upcomingVisit.id}`,
                  type: 'shelf_life',
                  message: `${gift.name}还未购买，${rel ? rel.title : ''}的拜访快到了`,
                  giftId: gift.id,
                  visitId: upcomingVisit.id,
                })
              }
            }
          }
        })

        return alerts
      },
    }),
    { name: 'cny-gift-tracker' }
  )
)
