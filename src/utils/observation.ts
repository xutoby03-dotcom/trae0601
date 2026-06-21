import type { Observation, ObservationDay } from "@/types"
import { OBSERVATION_DAYS } from "@/types"

export function isObservationComplete(obs: Observation | undefined): boolean {
  return !!obs && obs.photos.length > 0
}

export function getCompletedDays(observations: Observation[]): ObservationDay[] {
  return OBSERVATION_DAYS.filter((day) => {
    const obs = observations.find((o) => o.day === day)
    return isObservationComplete(obs)
  })
}

export function hasAllThreeDays(observations: Observation[]): boolean {
  return getCompletedDays(observations).length === 3
}

export function hasDay7(observations: Observation[]): boolean {
  return observations.some(
    (o) => o.day === 7 && o.photos.length > 0
  )
}
