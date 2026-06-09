import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionProps {
  title: React.ReactNode
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function Accordion({ title, count, defaultOpen = true, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-xs text-stone-400 bg-stone-200 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  )
}
