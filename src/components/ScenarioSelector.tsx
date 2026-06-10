import type { Scenario } from '@/types'
import { SCENARIO_CONFIG } from '@/types'

interface ScenarioSelectorProps {
  value: Scenario[]
  onChange: (scenarios: Scenario[]) => void
}

export default function ScenarioSelector({ value, onChange }: ScenarioSelectorProps) {
  const toggle = (scenario: Scenario) => {
    if (scenario === 'normal') {
      onChange(['normal'])
      return
    }
    const filtered = value.filter((s) => s !== 'normal')
    if (filtered.includes(scenario)) {
      const next = filtered.filter((s) => s !== scenario)
      onChange(next.length === 0 ? ['normal'] : next)
    } else {
      onChange([...filtered, scenario])
    }
  }

  const scenarios: Scenario[] = ['exercise', 'bedtime', 'cold']

  return (
    <div className="flex gap-2 flex-wrap">
      {scenarios.map((scenario) => {
        const config = SCENARIO_CONFIG[scenario]
        const isActive = value.includes(scenario)
        return (
          <button
            key={scenario}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-lavender-400/20 text-lavender-500 border-2 border-lavender-400/40 shadow-sm'
                : 'bg-white/50 text-gray-400 border-2 border-transparent hover:bg-white/80'
            }`}
            onClick={() => toggle(scenario)}
          >
            <span>{config.emoji}</span>
            <span className="font-display">{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
