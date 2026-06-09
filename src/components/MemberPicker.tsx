import type { FamilyMember } from '../types'
import { motion } from 'framer-motion'

interface MemberPickerProps {
  members: FamilyMember[]
  value: string
  onChange: (memberId: string) => void
}

export default function MemberPicker({ members, value, onChange }: MemberPickerProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {members.map((member) => {
        const isSelected = value === member.id
        return (
          <motion.button
            key={member.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(member.id)}
            className={`flex flex-col items-center gap-2 min-w-[72px] p-3 rounded-2xl border-2 transition-all ${
              isSelected
                ? 'bg-emerald-50 border-emerald-400 shadow-md'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <span className="text-3xl">{member.avatar}</span>
            <span className={`text-xs font-medium ${isSelected ? 'text-emerald-700' : 'text-stone-500'}`}>
              {member.name}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
