import { motion } from 'framer-motion'
import type { FamilyMember } from '../types'
import { Trophy } from 'lucide-react'

interface MemberRankProps {
  members: FamilyMember[]
  stats: Record<string, { total: number; correct: number; kitchenMissed: number; mistakes: number }>
}

export default function MemberRank({ members, stats }: MemberRankProps) {
  const sorted = [...members].sort((a, b) => {
    const sa = stats[a.id] || { total: 0, correct: 0 }
    const sb = stats[b.id] || { total: 0, correct: 0 }
    const rateA = sa.total > 0 ? sa.correct / sa.total : 1
    const rateB = sb.total > 0 ? sb.correct / sb.total : 1
    return rateB - rateA
  })

  return (
    <div className="space-y-3">
      {sorted.map((member, index) => {
        const s = stats[member.id] || { total: 0, correct: 0, kitchenMissed: 0, mistakes: 0 }
        const rate = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 100
        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-stone-200"
          >
            <div className="relative">
              <span className="text-2xl">{member.avatar}</span>
              {index === 0 && (
                <Trophy className="absolute -top-2 -right-2 w-4 h-4 text-amber-400 fill-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-stone-700">{member.name}</span>
                <span className="text-xs text-stone-400">
                  正确率 {rate}%
                </span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rate}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                />
              </div>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-stone-400">投放 {s.total} 次</span>
                <span className="text-xs text-red-400">分错 {s.mistakes} 次</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
