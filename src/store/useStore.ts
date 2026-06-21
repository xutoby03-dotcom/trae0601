import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Sample,
  Observation,
  ObservationDay,
  IndicatorLevel,
  AdhesionLevel,
} from "@/types"

interface SampleStore {
  samples: Sample[]
  observations: Observation[]
  addSample: (sample: Omit<Sample, "id" | "createdAt">) => string
  updateSample: (id: string, data: Partial<Sample>) => void
  deleteSample: (id: string) => void
  addObservation: (
    sampleId: string,
    day: ObservationDay,
    data: {
      photos: string[]
      shrinkage: IndicatorLevel
      bubbles: IndicatorLevel
      yellowing: IndicatorLevel
      moldSpots: IndicatorLevel
      adhesion: AdhesionLevel
      notes: string
    }
  ) => void
  updateObservation: (id: string, data: Partial<Observation>) => void
  getObservationsBySample: (sampleId: string) => Observation[]
  getObservation: (sampleId: string, day: ObservationDay) => Observation | undefined
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useStore = create<SampleStore>()(
  persist(
    (set, get) => ({
      samples: [],
      observations: [],

      addSample: (sampleData) => {
        const id = generateId()
        const sample: Sample = {
          ...sampleData,
          id,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ samples: [...state.samples, sample] }))
        return id
      },

      updateSample: (id, data) => {
        set((state) => ({
          samples: state.samples.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        }))
      },

      deleteSample: (id) => {
        set((state) => ({
          samples: state.samples.filter((s) => s.id !== id),
          observations: state.observations.filter((o) => o.sampleId !== id),
        }))
      },

      addObservation: (sampleId, day, data) => {
        const existing = get().observations.find(
          (o) => o.sampleId === sampleId && o.day === day
        )
        if (existing) {
          set((state) => ({
            observations: state.observations.map((o) =>
              o.id === existing.id
                ? { ...o, ...data, observedAt: new Date().toISOString() }
                : o
            ),
          }))
        } else {
          const observation: Observation = {
            id: generateId(),
            sampleId,
            day,
            ...data,
            observedAt: new Date().toISOString(),
          }
          set((state) => ({
            observations: [...state.observations, observation],
          }))
        }
      },

      updateObservation: (id, data) => {
        set((state) => ({
          observations: state.observations.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
        }))
      },

      getObservationsBySample: (sampleId) => {
        return get().observations.filter((o) => o.sampleId === sampleId)
      },

      getObservation: (sampleId, day) => {
        return get().observations.find(
          (o) => o.sampleId === sampleId && o.day === day
        )
      },
    }),
    {
      name: "sealant-observation-storage",
    }
  )
)
