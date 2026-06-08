import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MediaItem, ConsumptionRecord, BlindDrawRecord, Mood, TimeSlot, MediaType } from '@/lib/types'
import { TIMESLOT_CONFIG, MOOD_REASONS } from '@/lib/types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface AppState {
  mediaItems: MediaItem[]
  consumptionRecords: ConsumptionRecord[]
  blindDrawRecords: BlindDrawRecord[]

  addMediaItem: (item: Omit<MediaItem, 'id' | 'createdAt'>) => void
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void
  deleteMediaItem: (id: string) => void

  getRecommendations: (mood: Mood, timeSlot: TimeSlot) => { item: MediaItem; reason: string }[]
  blindDraw: (mood: Mood, timeSlot: TimeSlot) => MediaItem | null
  recordBlindDraw: (record: Omit<BlindDrawRecord, 'id' | 'drawnAt'>) => void

  consumeItem: (mediaId: string, mood: Mood) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mediaItems: [],
      consumptionRecords: [],
      blindDrawRecords: [],

      addMediaItem: (item) => {
        const newItem: MediaItem = {
          ...item,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ mediaItems: [...state.mediaItems, newItem] }))
      },

      updateMediaItem: (id, updates) => {
        set((state) => ({
          mediaItems: state.mediaItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }))
      },

      deleteMediaItem: (id) => {
        set((state) => ({
          mediaItems: state.mediaItems.filter((item) => item.id !== id),
          consumptionRecords: state.consumptionRecords.filter((r) => r.mediaId !== id),
          blindDrawRecords: state.blindDrawRecords.filter((r) => r.mediaId !== id),
        }))
      },

      getRecommendations: (mood, timeSlot) => {
        const { mediaItems } = get()
        const maxMinutes = TIMESLOT_CONFIG[timeSlot].maxMinutes

        const candidates = mediaItems.filter(
          (item) => item.moods.includes(mood) && item.duration <= maxMinutes
        )

        const scored = candidates.map((item) => {
          let score = 0
          if (!item.consumed) score += 3
          score += item.rating
          if (item.moods.length === 1) score += 1
          return { item, score }
        })

        scored.sort((a, b) => b.score - a.score)

        const top = scored.slice(0, 3)

        return top.map(({ item }) => {
          const reasons = MOOD_REASONS[mood]
          const reason = reasons[Math.floor(Math.random() * reasons.length)]
          return { item, reason }
        })
      },

      blindDraw: (mood, timeSlot) => {
        const { mediaItems } = get()
        const maxMinutes = TIMESLOT_CONFIG[timeSlot].maxMinutes

        const candidates = mediaItems.filter(
          (item) => item.moods.includes(mood) && item.duration <= maxMinutes
        )

        if (candidates.length === 0) return null

        return candidates[Math.floor(Math.random() * candidates.length)]
      },

      recordBlindDraw: (record) => {
        const newRecord: BlindDrawRecord = {
          ...record,
          id: generateId(),
          drawnAt: new Date().toISOString(),
        }
        set((state) => ({
          blindDrawRecords: [...state.blindDrawRecords, newRecord],
        }))
      },

      consumeItem: (mediaId, mood) => {
        set((state) => ({
          mediaItems: state.mediaItems.map((item) =>
            item.id === mediaId ? { ...item, consumed: true } : item
          ),
          consumptionRecords: [
            ...state.consumptionRecords,
            {
              id: generateId(),
              mediaId,
              mood,
              consumedAt: new Date().toISOString(),
            },
          ],
        }))
      },
    }),
    {
      name: 'mood-matcher-storage',
      version: 1,
      migrate: (persisted: any) => {
        if (persisted?.mediaItems) {
          const seen = new Set<string>()
          persisted.mediaItems = persisted.mediaItems.filter((item: MediaItem) => {
            if (seen.has(item.title)) return false
            seen.add(item.title)
            return true
          })
        }
        return persisted
      },
    }
  )
)
