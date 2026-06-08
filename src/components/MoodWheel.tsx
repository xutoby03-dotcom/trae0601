import { motion } from 'framer-motion'
import { MOOD_CONFIG, type Mood } from '@/lib/types'
import { cn } from '@/lib/utils'

const MOODS: Mood[] = ['tired', 'annoyed', 'happy', 'insomnia', 'want-cry', 'want-learn', 'want-empty']

interface Props {
  selected: Mood | null
  onSelect: (mood: Mood) => void
}

export default function MoodWheel({ selected, onSelect }: Props) {
  const radius = 130
  const centerX = 160
  const centerY = 160

  return (
    <div className="relative w-80 h-80 mx-auto">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 320 320"
      >
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 20}
          fill="none"
          stroke="rgba(217,119,6,0.15)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 20}
          fill="none"
          stroke="rgba(217,119,6,0.08)"
          strokeWidth="1"
          strokeDasharray="2 8"
        />
      </svg>

      {selected && (
        <motion.div
          key={selected}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <span className="text-4xl">{MOOD_CONFIG[selected].emoji}</span>
            <p className="text-amber-400/80 text-sm mt-1 font-serif">
              今天{MOOD_CONFIG[selected].label}
            </p>
          </div>
        </motion.div>
      )}

      {!selected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-500 text-sm font-serif">选一个心情吧</p>
        </div>
      )}

      {MOODS.map((mood, i) => {
        const angle = (i / MOODS.length) * 2 * Math.PI - Math.PI / 2
        const x = centerX + radius * Math.cos(angle) - 28
        const y = centerY + radius * Math.sin(angle) - 28
        const config = MOOD_CONFIG[mood]
        const isSelected = selected === mood

        return (
          <motion.button
            key={mood}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(mood)}
            className={cn(
              'absolute w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border',
              isSelected
                ? 'border-amber-400/60 shadow-lg shadow-amber-500/20'
                : 'border-slate-700/50 hover:border-slate-600/50'
            )}
            style={{
              left: x,
              top: y,
              backgroundColor: isSelected
                ? `${config.color}30`
                : 'rgba(30,41,59,0.6)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: isSelected ? 1.15 : 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <span className="text-lg leading-none">{config.emoji}</span>
            <span
              className={cn(
                'text-[10px] mt-0.5',
                isSelected ? 'text-amber-300' : 'text-slate-400'
              )}
            >
              {config.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
