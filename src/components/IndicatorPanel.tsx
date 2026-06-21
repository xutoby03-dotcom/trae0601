import type { IndicatorLevel, AdhesionLevel } from "@/types"
import {
  INDICATOR_LABELS,
  INDICATOR_LEVEL_LABELS,
  ADHESION_LEVEL_LABELS,
} from "@/types"

interface IndicatorPanelProps {
  shrinkage: IndicatorLevel
  bubbles: IndicatorLevel
  yellowing: IndicatorLevel
  moldSpots: IndicatorLevel
  adhesion: AdhesionLevel
  onChange: (field: string, value: string) => void
}

const INDICATOR_COLORS: Record<string, string> = {
  none: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  mild: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  severe: "bg-red-500/15 text-red-400 border-red-500/30",
}

const ADHESION_COLORS: Record<string, string> = {
  excellent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  good: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  poor: "bg-red-500/15 text-red-400 border-red-500/30",
}

function IndicatorGroup({
  label,
  field,
  value,
  options,
  colorMap,
  onChange,
}: {
  label: string
  field: string
  value: string
  options: { key: string; label: string }[]
  colorMap: Record<string, string>
  onChange: (field: string, value: string) => void
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-[#a0a0b8]">{label}</span>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(field, opt.key)}
            className={`min-w-[3.5rem] rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
              value === opt.key
                ? colorMap[opt.key]
                : "border-transparent bg-white/5 text-[#555570] hover:bg-white/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function IndicatorPanel({
  shrinkage,
  bubbles,
  yellowing,
  moldSpots,
  adhesion,
  onChange,
}: IndicatorPanelProps) {
  const indicatorOptions = [
    { key: "none", label: INDICATOR_LEVEL_LABELS.none },
    { key: "mild", label: INDICATOR_LEVEL_LABELS.mild },
    { key: "severe", label: INDICATOR_LEVEL_LABELS.severe },
  ]

  const adhesionOptions = [
    { key: "excellent", label: ADHESION_LEVEL_LABELS.excellent },
    { key: "good", label: ADHESION_LEVEL_LABELS.good },
    { key: "poor", label: ADHESION_LEVEL_LABELS.poor },
  ]

  const indicators = [
    { field: "shrinkage", label: INDICATOR_LABELS.shrinkage, value: shrinkage, options: indicatorOptions, colorMap: INDICATOR_COLORS },
    { field: "bubbles", label: INDICATOR_LABELS.bubbles, value: bubbles, options: indicatorOptions, colorMap: INDICATOR_COLORS },
    { field: "yellowing", label: INDICATOR_LABELS.yellowing, value: yellowing, options: indicatorOptions, colorMap: INDICATOR_COLORS },
    { field: "moldSpots", label: INDICATOR_LABELS.moldSpots, value: moldSpots, options: indicatorOptions, colorMap: INDICATOR_COLORS },
    { field: "adhesion", label: INDICATOR_LABELS.adhesion, value: adhesion, options: adhesionOptions, colorMap: ADHESION_COLORS },
  ]

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#22223a]/80 p-5">
      <h3 className="mb-4 font-serif text-sm font-semibold text-[#fafafa]">
        质量指标标记
      </h3>
      <div className="flex flex-wrap justify-between gap-4">
        {indicators.map((ind) => (
          <IndicatorGroup
            key={ind.field}
            label={ind.label}
            field={ind.field}
            value={ind.value}
            options={ind.options}
            colorMap={ind.colorMap}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}
