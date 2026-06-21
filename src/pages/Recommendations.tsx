import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  ChefHat,
  Droplets,
  PanelLeft,
  Sun,
  Layers,
  Trophy,
  ArrowRight,
  ImageOff,
} from "lucide-react"
import { useStore } from "@/store/useStore"
import Navbar from "@/components/Navbar"
import RadarChart from "@/components/RadarChart"
import { getRecommendations, getRadarData } from "@/utils/recommendation"
import { hasAllThreeDays, getCompletedDays } from "@/utils/observation"
import type { ScenarioType, Observation, IndicatorLevel, AdhesionLevel } from "@/types"
import { SCENARIO_LABELS, INDICATOR_LABELS, INDICATOR_LEVEL_LABELS, ADHESION_LEVEL_LABELS } from "@/types"

const SCENARIO_ICON_MAP: Record<ScenarioType, React.ReactNode> = {
  kitchen: <ChefHat className="h-5 w-5" />,
  bathroom: <Droplets className="h-5 w-5" />,
  window: <PanelLeft className="h-5 w-5" />,
  balcony: <Sun className="h-5 w-5" />,
  general: <Layers className="h-5 w-5" />,
}

const SCENARIO_GRADIENTS: Record<ScenarioType, string> = {
  kitchen: "from-orange-500/20 to-red-500/10",
  bathroom: "from-blue-500/20 to-cyan-500/10",
  window: "from-sky-500/20 to-indigo-500/10",
  balcony: "from-amber-500/20 to-yellow-500/10",
  general: "from-zinc-500/20 to-slate-500/10",
}

export default function Recommendations() {
  const navigate = useNavigate()
  const { samples, observations } = useStore()

  const recommendations = useMemo(
    () => getRecommendations(samples, observations),
    [samples, observations]
  )

  const scenarios: ScenarioType[] = [
    "kitchen",
    "bathroom",
    "window",
    "balcony",
    "general",
  ]

  const hasData = samples.length > 0 && observations.length > 0

  const NEED_ALL_THREE_SCENARIOS: ScenarioType[] = ["kitchen", "bathroom", "window"]

  const hasAnySampleAllThreeDays = useMemo(() => {
    return samples.some((s) => {
      const obs = observations.filter((o) => o.sampleId === s.id)
      return hasAllThreeDays(obs)
    })
  }, [samples, observations])

  function getEmptyState(scenario: ScenarioType): { icon: React.ReactNode; text: string } {
    if (!hasData) {
      return {
        icon: <Layers className="h-5 w-5 text-[#555570]" />,
        text: "添加样品并记录观察后，即可获取推荐",
      }
    }

    if (NEED_ALL_THREE_SCENARIOS.includes(scenario)) {
      if (hasAnySampleAllThreeDays) {
        return {
          icon: <ImageOff className="h-5 w-5 text-[#555570]" />,
          text: "暂无适合该场景的样品",
        }
      } else {
        return {
          icon: <Layers className="h-5 w-5 text-[#555570]" />,
          text: "需完成第 1、3、7 天全部观察，才能参与该场景排名",
        }
      }
    }

    return {
      icon: <Layers className="h-5 w-5 text-[#555570]" />,
      text: "暂无符合条件的样品",
    }
  }

  return (
    <div className="min-h-screen bg-[#12122a]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#fafafa]">
            场景推荐
          </h1>
          <p className="mt-2 text-sm text-[#6b8f9e]">
            基于固化观察数据，为不同使用场景推荐最佳密封胶
          </p>
        </div>

        {!hasData && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e8a838]/10">
              <Trophy className="h-10 w-10 text-[#e8a838]/60" />
            </div>
            <h2 className="mt-6 font-serif text-xl font-semibold text-[#fafafa]">
              暂无推荐数据
            </h2>
            <p className="mt-2 text-sm text-[#6b8f9e]">
              添加样品并记录观察数据后，即可获取场景推荐
            </p>
            <button
              onClick={() => navigate("/sample/new")}
              className="mt-6 flex items-center gap-2 rounded-xl bg-[#e8a838] px-6 py-3 text-sm font-semibold text-[#1a1a2e] transition-all hover:bg-[#d49530]"
            >
              添加样品
            </button>
          </div>
        )}

        {hasData && (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((scenario) => {
              const items = recommendations[scenario]
              return (
                <div
                  key={scenario}
                  className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#22223a]/80"
                >
                  <div
                    className={`bg-gradient-to-r ${SCENARIO_GRADIENTS[scenario]} px-6 py-5`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#e8a838]">
                        {SCENARIO_ICON_MAP[scenario]}
                      </div>
                      <div>
                        <h2 className="font-serif text-lg font-semibold text-[#fafafa]">
                          {SCENARIO_LABELS[scenario]}
                        </h2>
                        <p className="text-xs text-[#a0a0b8]">
                          {scenario === "kitchen" && "耐油污、抗发黄优先"}
                          {scenario === "bathroom" && "防霉、耐潮湿优先"}
                          {scenario === "window" && "抗收缩、附着力优先"}
                          {scenario === "balcony" && "耐候、抗发黄优先"}
                          {scenario === "general" && "综合表现均衡"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center py-6 text-center">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                          {getEmptyState(scenario).icon}
                        </div>
                        <p className="text-xs text-[#6b8f9e]">
                          {getEmptyState(scenario).text}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.slice(0, 3).map((item, idx) => {
                          const sample = samples.find(
                            (s) => s.id === item.sampleId
                          )
                          if (!sample) return null
                          const sampleObs = observations.filter(
                            (o) => o.sampleId === sample.id
                          )
                          const radarData = getRadarData(sampleObs)
                          const completed = getCompletedDays(sampleObs)
                          const latestObs: Observation | undefined =
                            sampleObs.find((o) => o.day === 7) ??
                            (completed.length > 0
                              ? sampleObs.find((o) => o.day === Math.max(...completed))
                              : undefined)

                          const indicators: Array<{ key: string; label: string; value: string; levelColor: string }> =
                            []
                          if (latestObs) {
                            const levelColor = (v: IndicatorLevel) =>
                              v === "none"
                                ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25"
                                : v === "mild"
                                  ? "bg-amber-500/12 text-amber-400 border-amber-500/25"
                                  : "bg-red-500/12 text-red-400 border-red-500/25"
                            const adhesionColor = (v: AdhesionLevel) =>
                              v === "excellent"
                                ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25"
                                : v === "good"
                                  ? "bg-amber-500/12 text-amber-400 border-amber-500/25"
                                  : "bg-red-500/12 text-red-400 border-red-500/25"

                            indicators.push({
                              key: "shrinkage",
                              label: INDICATOR_LABELS.shrinkage,
                              value: INDICATOR_LEVEL_LABELS[latestObs.shrinkage],
                              levelColor: levelColor(latestObs.shrinkage),
                            })
                            indicators.push({
                              key: "bubbles",
                              label: INDICATOR_LABELS.bubbles,
                              value: INDICATOR_LEVEL_LABELS[latestObs.bubbles],
                              levelColor: levelColor(latestObs.bubbles),
                            })
                            indicators.push({
                              key: "yellowing",
                              label: INDICATOR_LABELS.yellowing,
                              value: INDICATOR_LEVEL_LABELS[latestObs.yellowing],
                              levelColor: levelColor(latestObs.yellowing),
                            })
                            indicators.push({
                              key: "moldSpots",
                              label: INDICATOR_LABELS.moldSpots,
                              value: INDICATOR_LEVEL_LABELS[latestObs.moldSpots],
                              levelColor: levelColor(latestObs.moldSpots),
                            })
                            indicators.push({
                              key: "adhesion",
                              label: INDICATOR_LABELS.adhesion,
                              value: ADHESION_LEVEL_LABELS[latestObs.adhesion],
                              levelColor: adhesionColor(latestObs.adhesion),
                            })
                          }

                          return (
                            <div
                              key={item.sampleId}
                              onClick={() => navigate(`/sample/${item.sampleId}`)}
                              className="group cursor-pointer flex flex-col gap-4 rounded-xl border border-white/[0.04] bg-[#1a1a30]/60 p-4 transition-all hover:border-[#e8a838]/30 hover:shadow-[0_6px_24px_rgba(232,168,56,0.08)]"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                      idx === 0
                                        ? "bg-[#e8a838]/20 text-[#e8a838]"
                                        : idx === 1
                                          ? "bg-white/10 text-[#a0a0b8]"
                                          : "bg-white/5 text-[#6b8f9e]"
                                    }`}
                                  >
                                    {idx + 1}
                                  </div>
                                  <RadarChart
                                    data={radarData}
                                    size={78}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h3 className="truncate font-serif text-sm font-semibold text-[#fafafa]">
                                      {sample.brand}
                                    </h3>
                                    <span className="shrink-0 text-lg font-bold text-[#e8a838]">
                                      {item.score}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {sample.model && (
                                      <p className="truncate text-xs text-[#6b8f9e]">
                                        {sample.model}
                                      </p>
                                    )}
                                    <span className="shrink-0 rounded-sm bg-white/5 px-1.5 py-0.5 text-[10px] text-[#a0a0b8]">
                                      第{latestObs?.day ?? 0}天
                                    </span>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    {item.reasons.map((reason, rIdx) => (
                                      <p
                                        key={rIdx}
                                        className="text-xs text-[#a0a0b8]"
                                      >
                                        · {reason}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {indicators.length > 0 && (
                                <div className="border-t border-white/5 pt-3">
                                  <p className="mb-2 text-[10px] text-[#6b8f9e]">
                                    指标快照
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {indicators.map((ind) => (
                                      <span
                                        key={ind.key}
                                        className={`inline-flex items-baseline gap-1 rounded-md border px-1.5 py-0.5 text-[10px] ${ind.levelColor}`}
                                      >
                                        <span className="opacity-70">{ind.label}</span>
                                        <span className="font-medium">{ind.value}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {hasData && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/sample/new")}
              className="flex items-center gap-2 rounded-xl border border-[#e8a838]/30 px-6 py-3 text-sm text-[#e8a838] transition-all hover:bg-[#e8a838]/10"
            >
              <ArrowRight className="h-4 w-4" />
              继续添加样品以完善推荐
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
