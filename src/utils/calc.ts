import { getTimeSlotForHour, type Appliance, type ApplianceSchedule, type Bill, type Alert, type TimeSlotType } from "@/types"

export function calcDailyKwh(appliance: Appliance): number {
  return (appliance.powerW * appliance.dailyHours) / 1000
}

export function getHourlyBreakdown(startHour: number, dailyHours: number): { hour: number; fraction: number; slot: TimeSlotType }[] {
  const result: { hour: number; fraction: number; slot: TimeSlotType }[] = []
  let remaining = dailyHours
  let h = startHour

  while (remaining > 0) {
    const currentHour = ((h % 24) + 24) % 24
    const nextWholeHour = Math.ceil(h + 0.0001)
    const hourEnd = nextWholeHour > h ? Math.min(nextWholeHour, h + remaining) : h + Math.min(1, remaining)
    const fraction = Math.min(remaining, hourEnd - h)
    if (fraction > 0.0001) {
      result.push({
        hour: currentHour,
        fraction: Math.round(fraction * 1000) / 1000,
        slot: getTimeSlotForHour(currentHour),
      })
      remaining -= fraction
    }
    h = nextWholeHour > h ? nextWholeHour : h + 1
  }

  return result
}

export function calcDailyCost(appliance: Appliance, schedule: ApplianceSchedule, latestBill: Bill | null): number {
  if (!latestBill) return 0
  const rateKw = appliance.powerW / 1000
  const breakdown = getHourlyBreakdown(schedule.startHour, appliance.dailyHours)
  return breakdown.reduce((sum, seg) => {
    const price = getPriceForSlot(seg.slot, latestBill)
    return sum + rateKw * seg.fraction * price
  }, 0)
}

export function calcOptimalCost(appliance: Appliance, latestBill: Bill | null): { cost: number; slot: TimeSlotType; startHour: number } {
  if (!latestBill) return { cost: 0, slot: "valley", startHour: 23 }
  const rateKw = appliance.powerW / 1000

  if (appliance.mustDaytime) {
    let bestCost = Infinity
    let bestHour = 7
    let bestSlot: TimeSlotType = "flat"
    for (let h = 7; h < 21; h++) {
      const bd = getHourlyBreakdown(h, appliance.dailyHours)
      const allDaytime = bd.every(s => s.hour >= 6 && s.hour < 22)
      if (!allDaytime) continue
      const cost = bd.reduce((sum, seg) => sum + rateKw * seg.fraction * getPriceForSlot(seg.slot, latestBill), 0)
      if (cost < bestCost) {
        bestCost = cost
        bestHour = h
        bestSlot = bd[0].slot
      }
    }
    return { cost: bestCost === Infinity ? 0 : bestCost, slot: bestSlot, startHour: bestHour }
  }

  let bestCost = Infinity
  let bestHour = 23
  let bestSlot: TimeSlotType = "valley"
  for (let h = 0; h < 24; h++) {
    const bd = getHourlyBreakdown(h, appliance.dailyHours)
    const cost = bd.reduce((sum, seg) => sum + rateKw * seg.fraction * getPriceForSlot(seg.slot, latestBill), 0)
    if (cost < bestCost) {
      bestCost = cost
      bestHour = h
      bestSlot = bd[0].slot
    }
  }
  return { cost: bestCost, slot: bestSlot, startHour: bestHour }
}

export function getPriceForSlot(slot: TimeSlotType, bill: Bill | null): number {
  if (!bill) return 0
  switch (slot) {
    case "peak": return bill.peakPrice
    case "valley": return bill.valleyPrice
    case "flat": return bill.flatPrice
  }
}

export function calcSavings(appliance: Appliance, schedule: ApplianceSchedule, latestBill: Bill | null): number {
  const currentCost = calcDailyCost(appliance, schedule, latestBill)
  const optimal = calcOptimalCost(appliance, latestBill)
  return Math.max(0, currentCost - optimal.cost)
}

export function calcMonthlySavings(appliance: Appliance, schedule: ApplianceSchedule, latestBill: Bill | null): number {
  return calcSavings(appliance, schedule, latestBill) * 30
}

export function getDominantSlot(schedule: ApplianceSchedule, dailyHours: number): TimeSlotType {
  const breakdown = getHourlyBreakdown(schedule.startHour, dailyHours)
  const slotWeight: Record<TimeSlotType, number> = { peak: 0, valley: 0, flat: 0 }
  for (const seg of breakdown) {
    slotWeight[seg.slot] += seg.fraction
  }
  return (["valley", "flat", "peak"] as const).find(s => slotWeight[s] > 0) ?? "valley"
}

export function generateAlerts(appliances: Appliance[], schedules: ApplianceSchedule[], latestBill: Bill | null): Alert[] {
  const alerts: Alert[] = []

  for (const app of appliances) {
    const schedule = schedules.find(s => s.applianceId === app.id)
    if (!schedule) continue

    const breakdown = getHourlyBreakdown(schedule.startHour, app.dailyHours)
    const peakHours = breakdown.filter(s => s.slot === "peak")
    const peakFraction = peakHours.reduce((s, seg) => s + seg.fraction, 0)

    if (peakFraction > 0 && app.powerW >= 1500) {
      alerts.push({
        id: `peak-${app.id}`,
        type: "danger",
        message: `${app.name}（${app.powerW}W）有 ${peakFraction.toFixed(1)} 小时在峰电运行，建议移至谷电`,
        applianceId: app.id,
      })
    }

    if (schedule.startHour >= 22) {
      const noisyAppliances = ["washer", "dryer"]
      if (noisyAppliances.includes(app.icon) && app.canSchedule) {
        alerts.push({
          id: `noise-${app.id}`,
          type: "warning",
          message: `${app.name}预约在夜间运行可能影响邻居休息`,
          applianceId: app.id,
        })
      }
    }

    if (app.icon === "fridge") {
      alerts.push({
        id: `fridge-${app.id}`,
        type: "info",
        message: `${app.name}需要24小时运行，不可随意断电移时段`,
        applianceId: app.id,
      })
    }
  }

  return alerts
}

export function getOptimizationList(appliances: Appliance[], schedules: ApplianceSchedule[], latestBill: Bill | null): {
  appliance: Appliance
  currentSlot: TimeSlotType
  suggestedSlot: TimeSlotType
  currentStartHour: number
  suggestedStartHour: number
  monthlySaving: number
}[] {
  if (!latestBill) return []

  return appliances
    .map(app => {
      const schedule = schedules.find(s => s.applianceId === app.id)
      if (!schedule) return null
      const optimal = calcOptimalCost(app, latestBill)
      const saving = calcMonthlySavings(app, schedule, latestBill)
      if (saving <= 0.01) return null
      return {
        appliance: app,
        currentSlot: getDominantSlot(schedule, app.dailyHours),
        suggestedSlot: optimal.slot,
        currentStartHour: schedule.startHour,
        suggestedStartHour: optimal.startHour,
        monthlySaving: saving,
      }
    })
    .filter(Boolean) as {
    appliance: Appliance
    currentSlot: TimeSlotType
    suggestedSlot: TimeSlotType
    currentStartHour: number
    suggestedStartHour: number
    monthlySaving: number
  }[]
}
