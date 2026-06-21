import { Check } from "lucide-react"
import type { ObservationDay } from "@/types"
import { OBSERVATION_DAYS } from "@/types"

interface TimelineProps {
  completedDays: number[]
  activeDay: ObservationDay
  onDaySelect: (day: ObservationDay) => void
}

export default function Timeline({
  completedDays,
  activeDay,
  onDaySelect,
}: TimelineProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {OBSERVATION_DAYS.map((day, idx) => {
        const isCompleted = completedDays.includes(day)
        const isActive = activeDay === day
        const isLast = idx === OBSERVATION_DAYS.length - 1

        return (
          <div key={day} className="flex items-center">
            <button
              onClick={() => onDaySelect(day)}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                isActive
                  ? "border-[#e8a838] bg-[#e8a838]/20 shadow-[0_0_20px_rgba(232,168,56,0.3)]"
                  : isCompleted
                    ? "border-[#e8a838]/60 bg-[#e8a838]/10"
                    : "border-[#3a3a55] bg-[#22223a]"
              }`}
            >
              {isCompleted && !isActive ? (
                <Check className="h-5 w-5 text-[#e8a838]" />
              ) : (
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-[#e8a838]" : isCompleted ? "text-[#e8a838]/70" : "text-[#6b8f9e]"
                  }`}
                >
                  {day}
                </span>
              )}
              <span
                className={`absolute -bottom-6 text-xs whitespace-nowrap ${
                  isActive ? "text-[#e8a838]" : "text-[#6b8f9e]"
                }`}
              >
                第{day}天
              </span>
            </button>

            {!isLast && (
              <div
                className={`mx-2 h-0.5 w-12 transition-colors duration-300 ${
                  completedDays.includes(day) ? "bg-[#e8a838]/40" : "bg-[#3a3a55]"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
