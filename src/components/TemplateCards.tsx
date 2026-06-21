import { speciesTemplates } from '@/data/templates'
import { cn } from '@/lib/utils'

interface TemplateCardsProps {
  activeTemplateId?: string
  onApply: (templateId: string) => void
}

const jellyfishEmoji: Record<string, string> = {
  'moon-jelly': '🌙',
  'lion-mane': '🦁',
  'upside-down': '🔄',
  'flame-jelly': '🔥',
  'crystal-jelly': '💎',
}

export default function TemplateCards({ activeTemplateId, onApply }: TemplateCardsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {speciesTemplates.map(tmpl => {
        const startColor = `rgb(${Math.round(30 * tmpl.startBlue / 100 + 254 * tmpl.startWhite / 100 + 167 * tmpl.startPurple / 100)}, ${Math.round(64 * tmpl.startBlue / 100 + 249 * tmpl.startWhite / 100 + 139 * tmpl.startPurple / 100)}, ${Math.round(175 * tmpl.startBlue / 100 + 239 * tmpl.startWhite / 100 + 250 * tmpl.startPurple / 100)})`
        const endColor = `rgb(${Math.round(30 * tmpl.endBlue / 100 + 254 * tmpl.endWhite / 100 + 167 * tmpl.endPurple / 100)}, ${Math.round(64 * tmpl.endBlue / 100 + 249 * tmpl.endWhite / 100 + 139 * tmpl.endPurple / 100)}, ${Math.round(175 * tmpl.endBlue / 100 + 239 * tmpl.endWhite / 100 + 250 * tmpl.endPurple / 100)})`

        return (
          <button
            key={tmpl.id}
            onClick={() => onApply(tmpl.id)}
            className={cn(
              'flex-shrink-0 w-48 bg-gray-900 border rounded-xl p-4 text-left transition cursor-pointer',
              activeTemplateId === tmpl.id
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 ring-1 ring-cyan-400/30'
                : 'border-gray-700 hover:border-gray-500'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{jellyfishEmoji[tmpl.id] ?? '🪼'}</span>
              <span className="text-sm font-medium text-gray-200 truncate">{tmpl.name}</span>
            </div>

            <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[2rem]">
              {tmpl.description}
            </p>

            <div
              className="h-2 rounded-full"
              style={{
                background: `linear-gradient(to right, ${startColor}, ${endColor})`,
              }}
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-600">起始</span>
              <span className="text-[10px] text-gray-600">目标</span>
            </div>

            <p className="text-[10px] text-gray-500 mt-2">
              建议 {tmpl.defaultDays} 天
            </p>
          </button>
        )
      })}
    </div>
  )
}
