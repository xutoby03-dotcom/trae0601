import { getTimeSlotForHour, type Appliance, type ApplianceSchedule, type Bill, type Alert } from "@/types"

export function calcDailyKwh(appliance: Appliance): number {
  return (appliance.powerW * appliance.dailyHours) / 1000
}

export function calcDailyCost(appliance: Appliance, schedule: ApplianceSchedule, latestBill: Bill | null): number {
  const kwh = calcDailyKwh(appliance)
  const price = getPriceForSlot(schedule.timeSlot, latestBill)
  return kwh * price
}

export function calcOptimalCost(appliance: Appliance, latestBill: Bill | null): { cost: number; slot: "peak" | "valley" | "flat" } {
  const kwh = calcDailyKwh(appliance)
  if (!latestBill) return { cost: 0, slot: "valley" }
  if (appliance.mustDaytime) {
    const flatPrice = latestBill.flatPrice
    const peakPrice = latestBill.peakPrice
    if (flatPrice <= peakPrice) return { cost: kwh * flatPrice, slot: "flat" }
    return { cost: kwh * peakPrice, slot: "peak" }
  }
  return { cost: kwh * latestBill.valleyPrice, slot: "valley" }
}

export function getPriceForSlot(slot: "peak" | "valley" | "flat", bill: Bill | null): number {
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

export function generateAlerts(appliances: Appliance[], schedules: ApplianceSchedule[], latestBill: Bill | null): Alert[] {
  const alerts: Alert[] = []

  for (const app of appliances) {
    const schedule = schedules.find(s => s.applianceId === app.id)
    if (!schedule) continue

    if (schedule.timeSlot === "peak" && app.powerW >= 1500) {
      alerts.push({
        id: `peak-${app.id}`,
        type: "danger",
        message: `${app.name}（${app.powerW}W）正在峰电时段运行，建议移至谷电`,
        applianceId: app.id,
      })
    }

    if (schedule.timeSlot === "valley" && schedule.startHour >= 22) {
      const noisyAppliances = ["washer", "dryer"]
      const icon = app.icon
      if (noisyAppliances.includes(icon) && app.canSchedule) {
        alerts.push({
          id: `noise-${app.id}`,
          type: "warning",
          message: `${app.name}预约在夜间运行可能影响邻居休息`,
          applianceId: app.id,
        })
      }
    }

    if (app.icon === "fridge") {
      if (schedule.timeSlot === "valley" && !app.mustDaytime) {
        alerts.push({
          id: `fridge-${app.id}`,
          type: "info",
          message: `${app.name}需要24小时运行，不可随意断电移时段`,
          applianceId: app.id,
        })
      }
    }
  }

  return alerts
}

export function getOptimizationList(appliances: Appliance[], schedules: ApplianceSchedule[], latestBill: Bill | null): {
  appliance: Appliance
  currentSlot: "peak" | "valley" | "flat"
  suggestedSlot: "peak" | "valley" | "flat"
  monthlySaving: number
}[] {
  if (!latestBill) return []

  return appliances
    .map(app => {
      const schedule = schedules.find(s => s.applianceId === app.id)
      if (!schedule) return null
      const optimal = calcOptimalCost(app, latestBill)
      const saving = calcMonthlySavings(app, schedule, latestBill)
      if (saving <= 0) return null
      return {
        appliance: app,
        currentSlot: schedule.timeSlot,
        suggestedSlot: optimal.slot,
        monthlySaving: saving,
      }
    })
    .filter(Boolean) as {
    appliance: Appliance
    currentSlot: "peak" | "valley" | "flat"
    suggestedSlot: "peak" | "valley" | "flat"
    monthlySaving: number
  }[]
}

export function suggestStartHour(appliance: Appliance, targetSlot: "peak" | "valley" | "flat"): number {
  if (targetSlot === "valley") return 23
  if (targetSlot === "flat") return 11
  return 8
}

export function getNextSlotForHour(hour: number): "peak" | "valley" | "flat" {
  return getTimeSlotForHour(hour)
}
