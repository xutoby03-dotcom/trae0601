import type { Plan, FamilyNeeds, MatchScore } from '@/types'

export function calculateMatchScore(plan: Plan, needs: FamilyNeeds): MatchScore {
  const scores: MatchScore = {
    gaming: 0,
    remoteWork: 0,
    elderlyTV: 0,
    multiVideo: 0,
    overall: 0,
  }

  if (needs.gaming) {
    scores.gaming = calcGamingScore(plan)
  }
  if (needs.remoteWork) {
    scores.remoteWork = calcRemoteWorkScore(plan)
  }
  if (needs.elderlyTV) {
    scores.elderlyTV = calcElderlyTVScore(plan)
  }
  if (needs.multiVideo) {
    scores.multiVideo = calcMultiVideoScore(plan)
  }

  const activeCount = Object.values(needs).filter(Boolean).length
  if (activeCount > 0) {
    let total = 0
    if (needs.gaming) total += scores.gaming
    if (needs.remoteWork) total += scores.remoteWork
    if (needs.elderlyTV) total += scores.elderlyTV
    if (needs.multiVideo) total += scores.multiVideo
    scores.overall = Math.round(total / activeCount)
  }

  return scores
}

function calcGamingScore(plan: Plan): number {
  let score = 0
  if (plan.speed >= 500) score += 40
  else if (plan.speed >= 200) score += 30
  else if (plan.speed >= 100) score += 20
  else score += 10

  if (plan.monthlyFee <= 100) score += 25
  else if (plan.monthlyFee <= 150) score += 20
  else if (plan.monthlyFee <= 200) score += 15
  else score += 10

  if (plan.discountedFee > 0 && plan.discountedFee < plan.monthlyFee) score += 15
  else score += 5

  if (plan.contractMonths <= 12) score += 20
  else if (plan.contractMonths <= 24) score += 10
  else score += 0

  return Math.min(score, 100)
}

function calcRemoteWorkScore(plan: Plan): number {
  let score = 0
  if (plan.speed >= 300) score += 35
  else if (plan.speed >= 100) score += 25
  else if (plan.speed >= 50) score += 15
  else score += 5

  if (plan.contractMonths <= 12) score += 25
  else if (plan.contractMonths <= 24) score += 15
  else score += 5

  if (plan.earlyTerminationFee <= 100) score += 20
  else if (plan.earlyTerminationFee <= 300) score += 10
  else score += 0

  if (plan.monthlyFee <= 120) score += 20
  else if (plan.monthlyFee <= 180) score += 10
  else score += 5

  return Math.min(score, 100)
}

function calcElderlyTVScore(plan: Plan): number {
  let score = 0
  if (plan.tvPackage && plan.tvPackage !== '无') score += 35
  else score += 5

  if (plan.speed >= 100) score += 20
  else if (plan.speed >= 50) score += 15
  else score += 5

  if (plan.monthlyFee <= 100) score += 25
  else if (plan.monthlyFee <= 150) score += 15
  else score += 5

  if (plan.installFee <= 0) score += 20
  else if (plan.installFee <= 100) score += 10
  else score += 0

  return Math.min(score, 100)
}

function calcMultiVideoScore(plan: Plan): number {
  let score = 0
  if (plan.speed >= 500) score += 35
  else if (plan.speed >= 200) score += 25
  else if (plan.speed >= 100) score += 15
  else score += 5

  if (plan.freeData && plan.freeData !== '无') score += 20
  else score += 5

  if (plan.monthlyFee <= 150) score += 25
  else if (plan.monthlyFee <= 200) score += 15
  else score += 5

  if (plan.routerFee <= 0) score += 20
  else if (plan.routerFee <= 100) score += 10
  else score += 0

  return Math.min(score, 100)
}
