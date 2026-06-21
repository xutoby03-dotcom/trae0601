import { useNavigate } from "react-router-dom"
import { Clock, Trash2, ChevronRight } from "lucide-react"
import type { Sample, Observation } from "@/types"
import { OBSERVATION_DAYS } from "@/types"
import { getCompletedDays } from "@/utils/observation"

interface SampleCardProps {
  sample: Sample
  observations: Observation[]
  onDelete: (id: string) => void
}

function getLatestCompleteDay(observations: Observation[]): number {
  const completed = getCompletedDays(observations)
  if (completed.length === 0) return 0
  return Math.max(...completed)
}

function getLatestValidObservation(
  observations: Observation[]
): Observation | null {
  const completed = getCompletedDays(observations)
  if (completed.length === 0) return null
  const latestDay = Math.max(...completed)
  return observations.find((o) => o.day === latestDay) ?? null
}

function getIndicatorSummary(observations: Observation[]): string[] {
  const latest = getLatestValidObservation(observations)
  if (!latest) return []

  const issues: string[] = []
  if (latest.shrinkage !== "none") issues.push("收缩")
  if (latest.bubbles !== "none") issues.push("气泡")
  if (latest.yellowing !== "none") issues.push("发黄")
  if (latest.moldSpots !== "none") issues.push("霉点")
  if (latest.adhesion === "poor") issues.push("附着力差")
  return issues
}

export default function SampleCard({
  sample,
  observations,
  onDelete,
}: SampleCardProps) {
  const navigate = useNavigate()
  const latestDay = getLatestCompleteDay(observations)
  const issues = getIndicatorSummary(observations)
  const completedDays = getCompletedDays(observations)
  const nextDay = OBSERVATION_DAYS.find((d) => !completedDays.includes(d))

  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(sample.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div
      onClick={() => navigate(`/sample/${sample.id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-[#22223a]/80 p-5 transition-all duration-300 hover:border-[#e8a838]/30 hover:shadow-[0_8px_32px_rgba(232,168,56,0.08)]"
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(sample.id)
        }}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-[#555570] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {sample.initialPhoto && (
        <div className="mb-4 h-32 overflow-hidden rounded-xl bg-[#16162a]">
          <img
            src={sample.initialPhoto}
            alt={sample.brand}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {!sample.initialPhoto && (
        <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-[#16162a]">
          <div className="h-12 w-12 rounded-full bg-[#2a2a44]" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-base font-semibold text-[#fafafa]">
            {sample.brand}
          </h3>
          {sample.model && (
            <p className="mt-0.5 truncate text-xs text-[#6b8f9e]">
              {sample.model}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            latestDay === 7
              ? "bg-emerald-500/15 text-emerald-400"
              : nextDay
                ? "bg-[#e8a838]/15 text-[#e8a838]"
                : "bg-white/5 text-[#6b8f9e]"
          }`}
        >
          {latestDay === 7
            ? "观察完成"
            : nextDay
              ? `待记录第${nextDay}天`
              : "待开始"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-[#a0a0b8]">
          {sample.color}
        </span>
        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-[#a0a0b8]">
          {sample.substrate}
        </span>
        <span className="flex items-center gap-1 text-xs text-[#6b8f9e]">
          <Clock className="h-3 w-3" />
          {daysSinceCreation}天
        </span>
      </div>

      {issues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {issues.map((issue) => (
            <span
              key={issue}
              className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs text-red-400"
            >
              {issue}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex gap-1">
          {OBSERVATION_DAYS.map((day) => (
            <div
              key={day}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                completedDays.includes(day)
                  ? "bg-[#e8a838]/20 text-[#e8a838]"
                  : "bg-white/5 text-[#555570]"
              }`}
            >
              {day}
            </div>
          ))}
          <span className="ml-1.5 flex items-center text-xs text-[#555570]">
            天
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-[#555570] transition-colors group-hover:text-[#e8a838]" />
      </div>
    </div>
  )
}
