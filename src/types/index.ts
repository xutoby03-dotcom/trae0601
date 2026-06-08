export type TimeSlotType = "peak" | "valley" | "flat"

export interface Appliance {
  id: string
  name: string
  powerW: number
  dailyHours: number
  canSchedule: boolean
  mustDaytime: boolean
  icon: string
}

export interface ApplianceSchedule {
  id: string
  applianceId: string
  startHour: number
  timeSlot: TimeSlotType
}

export interface Bill {
  id: string
  month: string
  peakPrice: number
  valleyPrice: number
  flatPrice: number
  peakKwh: number
  valleyKwh: number
  flatKwh: number
}

export interface Alert {
  id: string
  type: "danger" | "warning" | "info"
  message: string
  applianceId?: string
}

export const TIME_SLOT_RANGES: { type: TimeSlotType; ranges: [number, number][] }[] = [
  { type: "peak", ranges: [[8, 11], [18, 21]] },
  { type: "flat", ranges: [[7, 8], [11, 18], [21, 23]] },
  { type: "valley", ranges: [[23, 24], [0, 7]] },
]

export const APPLIANCE_ICONS = [
  { value: "washer", label: "洗衣机", emoji: "🧺" },
  { value: "heater", label: "热水器", emoji: "🚿" },
  { value: "dryer", label: "烘干机", emoji: "🌡️" },
  { value: "charger", label: "充电桩", emoji: "🔌" },
  { value: "fridge", label: "冰箱", emoji: "🧊" },
  { value: "ac", label: "空调", emoji: "❄️" },
  { value: "oven", label: "烤箱", emoji: "🍞" },
  { value: "tv", label: "电视", emoji: "📺" },
  { value: "computer", label: "电脑", emoji: "💻" },
  { value: "light", label: "照明", emoji: "💡" },
  { value: "microwave", label: "微波炉", emoji: "📦" },
  { value: "other", label: "其他", emoji: "⚙️" },
]

export function getTimeSlotForHour(hour: number): TimeSlotType {
  for (const slot of TIME_SLOT_RANGES) {
    for (const [start, end] of slot.ranges) {
      if (hour >= start && hour < end) return slot.type
    }
  }
  return "valley"
}

export function getSlotLabel(type: TimeSlotType): string {
  switch (type) {
    case "peak": return "峰电"
    case "valley": return "谷电"
    case "flat": return "平电"
  }
}

export function getSlotColor(type: TimeSlotType): string {
  switch (type) {
    case "peak": return "text-red-400"
    case "valley": return "text-green-400"
    case "flat": return "text-blue-400"
  }
}

export function getSlotBg(type: TimeSlotType): string {
  switch (type) {
    case "peak": return "bg-red-500/20 border-red-500/30"
    case "valley": return "bg-green-500/20 border-green-500/30"
    case "flat": return "bg-blue-500/20 border-blue-500/30"
  }
}
