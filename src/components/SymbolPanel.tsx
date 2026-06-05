import { useState } from 'react'
import { symbolCategories } from '../data/symbols'
import katex from 'katex'
import { useStore } from '../store'

export default function SymbolPanel() {
  const [activeTab, setActiveTab] = useState(0)
  const { insertAtCursor } = useStore()
  const category = symbolCategories[activeTab]

  const renderSymbol = (latex: string): string => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false })
    } catch {
      return latex
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex overflow-x-auto border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        {symbolCategories.map((cat, i) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-2 text-xs whitespace-nowrap transition-all shrink-0 ${
              activeTab === i
                ? 'text-amber-400 border-b-2 border-amber-400 bg-[var(--bg-tertiary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {category.symbols.map((sym, i) => (
            <button
              key={`${sym.latex}-${i}`}
              onClick={() => insertAtCursor(sym.latex)}
              className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-amber-400/50 hover:shadow-md hover:scale-105 transition-all group"
              title={`${sym.desc || sym.latex}\n点击插入: ${sym.latex}`}
            >
              <span
                className="text-base leading-tight"
                dangerouslySetInnerHTML={{ __html: renderSymbol(sym.latex) }}
              />
              <span className="text-[9px] text-[var(--text-muted)] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate w-full text-center">
                {sym.latex.replace(/\\/g, '')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
