import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RuleCard } from '../types'
import { categoryConfig } from '../utils/category'
import { Star, RotateCcw } from 'lucide-react'

interface RuleFlipCardProps {
  rule: RuleCard
  onToggleFavorite: (id: string) => void
}

export default function RuleFlipCard({ rule, onToggleFavorite }: RuleFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const config = categoryConfig[rule.category]

  return (
    <div className="perspective-1000 w-full h-48">
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                你以为
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(rule.id)
                }}
                className="p-1"
              >
                <Star
                  className={`w-4 h-4 ${
                    rule.isFavorited ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                  }`}
                />
              </button>
            </div>
            <h3 className="text-xl font-bold text-stone-800">{rule.title}</h3>
          </div>
          <div className="relative z-10">
            <p className="text-2xl font-bold text-red-500 line-through decoration-2">
              {rule.wrongAnswer}
            </p>
            <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> 点击翻转看正确答案
            </p>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className={`absolute inset-0 rounded-2xl ${config.bgColor} border-2 ${config.borderColor}`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold ${config.color} ${config.bgColor} px-2 py-1 rounded-full`}>
                实际上
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-800">{rule.title}</h3>
          </div>
          <div className="relative z-10">
            <p className={`text-2xl font-bold ${config.color}`}>
              {rule.correctAnswer}
            </p>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              {rule.description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
