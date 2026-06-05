import { useState } from 'react'
import { formulaTemplates } from '../data/templates'
import katex from 'katex'
import { useStore } from '../store'

export default function TemplatePanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { replacePlaceholder } = useStore()

  const categories = ['all', ...Array.from(new Set(formulaTemplates.map((t) => t.category)))]
  const filtered = selectedCategory === 'all'
    ? formulaTemplates
    : formulaTemplates.filter((t) => t.category === selectedCategory)

  const renderPreview = (latex: string): string => {
    try {
      const cleaned = latex.replace(/◆/g, '\\square')
      return katex.renderToString(cleaned, { throwOnError: false, displayMode: true })
    } catch {
      return latex
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex overflow-x-auto border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-2 text-xs whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === cat
                ? 'text-amber-400 border-b-2 border-amber-400 bg-[var(--bg-tertiary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-1 gap-2">
          {filtered.map((tmpl, i) => (
            <button
              key={`${tmpl.name}-${i}`}
              onClick={() => replacePlaceholder(tmpl.latex)}
              className="flex flex-col p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-amber-400/50 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-[var(--text-primary)]">{tmpl.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                  {tmpl.category}
                </span>
              </div>
              <div
                className="overflow-x-auto py-1"
                dangerouslySetInnerHTML={{ __html: renderPreview(tmpl.latex) }}
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {tmpl.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
