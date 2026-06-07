import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, MailOpen } from 'lucide-react'
import CountdownTimer from './CountdownTimer'
import { formatDate, THEME_COLORS } from '@/lib/utils'
import type { TimeCapsule } from '@/types'

interface Props {
  capsule: TimeCapsule
  index: number
}

export default function EnvelopeCard({ capsule, index }: Props) {
  const navigate = useNavigate()
  const canOpen = !capsule.isLocked
  const isOpened = capsule.isOpened
  const isReadyToOpen = canOpen && !isOpened

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/capsule/${capsule.id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-xl transition-shadow duration-300 hover:shadow-2xl"
      style={{
        background: isReadyToOpen
          ? `linear-gradient(145deg, ${capsule.moodColor}0A, ${THEME_COLORS.cream}F0, ${THEME_COLORS.paperTexture}F0)`
          : `linear-gradient(145deg, ${THEME_COLORS.cream}F0, ${THEME_COLORS.paperTexture}F0)`,
        boxShadow: isReadyToOpen ? `0 0 0 1px ${capsule.moodColor}30, 0 4px 20px ${capsule.moodColor}15` : undefined,
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1.5 transition-all duration-300 group-hover:w-2"
        style={{ background: capsule.moodColor }}
      />

      {isReadyToOpen && (
        <motion.div
          className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
          style={{ background: capsule.moodColor, color: '#fff' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          等你拆
        </motion.div>
      )}

      <div className="p-4 pl-5">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3
              className="truncate text-sm font-bold tracking-wide"
              style={{ color: isReadyToOpen ? capsule.moodColor : THEME_COLORS.darkBrown, fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
            >
              {canOpen ? capsule.title : capsule.title.replace(/./g, '•').slice(0, 8) + (capsule.title.length > 8 ? '…' : '')}
            </h3>
          </div>
          <div className="ml-2 flex-shrink-0">
            {isReadyToOpen && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: `${capsule.moodColor}25` }}
              >
                <MailOpen size={16} style={{ color: capsule.moodColor }} />
              </motion.div>
            )}
            {!canOpen && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4A3228]/10">
                <Lock size={12} className="text-[#8B7355]" />
              </div>
            )}
            {isOpened && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: `${capsule.moodColor}20` }}>
                <MailOpen size={14} style={{ color: capsule.moodColor }} />
              </div>
            )}
          </div>
        </div>

        {!canOpen && (
          <div className="mb-2">
            <CountdownTimer openDate={capsule.openDate} moodColor={capsule.moodColor} />
          </div>
        )}

        {isReadyToOpen && (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: capsule.moodColor }}>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              ✨
            </motion.span>
            信已到期，点击拆信
          </div>
        )}

        {isOpened && (
          <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-[#8B7355]" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            {capsule.content.slice(0, 60)}{capsule.content.length > 60 ? '…' : ''}
          </p>
        )}

        <div className="flex items-center justify-between text-[10px] text-[#8B7355]/70">
          <span>{formatDate(capsule.createdAt)}</span>
          <span style={{ color: canOpen ? capsule.moodColor : undefined }}>
            {isReadyToOpen ? '等你拆' : canOpen ? '已拆信' : '密封中'}
          </span>
        </div>

        {capsule.images.length > 0 && (
          <div className="mt-2 flex gap-1">
            {capsule.images.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-md"
                style={{ background: `${capsule.moodColor}15` }}
              />
            ))}
            {capsule.images.length > 3 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-md text-[9px]" style={{ background: `${capsule.moodColor}15`, color: capsule.moodColor }}>
                +{capsule.images.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {!canOpen && (
        <div className="absolute -right-3 -top-3 h-16 w-16 rotate-12 opacity-[0.03]">
          <svg viewBox="0 0 100 100" fill={THEME_COLORS.sealRed}>
            <circle cx="50" cy="50" r="45" />
            <text x="50" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">封</text>
          </svg>
        </div>
      )}

      {isReadyToOpen && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 50%, ${capsule.moodColor}0A, transparent 70%)` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  )
}
