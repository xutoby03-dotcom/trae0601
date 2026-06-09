import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, AlertTriangle, Layers, Minus, CheckCircle2 } from 'lucide-react'
import type { Loan } from '@/types'
import LoanCard from './LoanCard'

interface GroupSectionProps {
  title: string
  icon: React.ReactNode
  loans: Loan[]
  variant: 'overdue' | 'expiring' | 'installment' | 'active' | 'settled'
  defaultOpen?: boolean
  accentColor: string
}

export default function GroupSection({ title, icon, loans, variant, defaultOpen = true, accentColor }: GroupSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (loans.length === 0) return null

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full py-2 group"
      >
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${accentColor}`}>
          {icon}
        </div>
        <span className="font-display font-bold text-apricot-900 text-sm flex-1 text-left">
          {title}
        </span>
        <span className="text-parchment-500 text-xs bg-parchment-200 px-2 py-0.5 rounded-full mr-1">
          {loans.length}
        </span>
        {isOpen ? (
          <ChevronDown size={16} className="text-parchment-400" />
        ) : (
          <ChevronRight size={16} className="text-parchment-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-2.5 pl-1">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} variant={variant} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ExpiringSoonIcon() {
  return <Clock size={14} className="text-sage-600" />
}
export function OverdueIcon() {
  return <AlertTriangle size={14} className="text-coral-500" />
}
export function InstallmentIcon() {
  return <Layers size={14} className="text-apricot-600" />
}
export function ActiveIcon() {
  return <Minus size={14} className="text-parchment-600" />
}
export function SettledIcon() {
  return <CheckCircle2 size={14} className="text-sage-600" />
}
