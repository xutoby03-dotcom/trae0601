export type Language = "zh" | "en" | "ja" | "ko" | "other"

export type PassengerStatus = "waiting" | "delayed" | "picked_up"

export interface Passenger {
  id: string
  name: string
  flightNumber: string
  arrivalGate: string
  language: Language
  landingTime: string
  phone: string
  parkingNote: string
  status: PassengerStatus
  delayMinutes: number
  createdAt: string
}

export const WELCOME_MAP: Record<Language, string> = {
  zh: "欢迎",
  en: "Welcome",
  ja: "ようこそ",
  ko: "환영합니다",
  other: "Welcome",
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  other: "其他",
}
