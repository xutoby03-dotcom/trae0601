import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, MailOpen } from 'lucide-react'
import CountdownTimer from './CountdownTimer'
import { formatDate, THEME_COLORS } from '@/lib/utils'
import type { TimeCapsule } from '@/types'

interface Props {
  capsule: TimeCapsule
  onOpen: () => void
}

export default function CapsuleDetail({ capsule, onOpen }: Props) {
  const [isOpening, setIsOpening] = useState(false)
  const [showContent, setShowContent] = useState(capsule.isOpened)

  const canOpen = !capsule.isLocked
  const isOpened = capsule.isOpened

  useEffect(() => {
    if (isOpened && !showContent) {
      setShowContent(true)
    }
  }, [isOpened, showContent])

  const handleOpen = () => {
    if (!canOpen || isOpened) return
    setIsOpening(true)
    setTimeout(() => {
      setShowContent(true)
      onOpen()
    }, 1200)
  }

  return (
    <div className="relative mx-auto max-w-xl px-4 py-8">
      <AnimatePresence mode="wait">
        {!showContent ? (
          <motion.div
            key="sealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="relative mb-8"
              style={{ perspective: 1000 }}
            >
              <motion.div
                animate={
                  isOpening
                    ? { rotateY: 180, scale: 0.8, opacity: 0 }
                    : canOpen
                    ? { y: [0, -6, 0] }
                    : {}
                }
                transition={
                  isOpening
                    ? { duration: 1, ease: 'easeInOut' }
                    : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }
                className="relative"
              >
                <div
                  className="relative h-56 w-80 overflow-hidden rounded-lg shadow-2xl"
                  style={{
                    background: `linear-gradient(145deg, ${THEME_COLORS.cream}, ${THEME_COLORS.paperTexture})`,
                    borderLeft: `4px solid ${capsule.moodColor}`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${capsule.moodColor}15` }}>
                      {canOpen ? (
                        <MailOpen size={28} style={{ color: capsule.moodColor }} />
                      ) : (
                        <Lock size={28} className="text-[#8B7355]" />
                      )}
                    </div>

                    <h2
                      className="mb-1 text-lg font-bold"
                      style={{ color: THEME_COLORS.darkBrown, fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
                    >
                      {canOpen ? capsule.title : capsule.title.replace(/./g, '•')}
                    </h2>

                    <div className="mb-3">
                      <CountdownTimer openDate={capsule.openDate} moodColor={capsule.moodColor} />
                    </div>

                    <p className="text-xs text-[#8B7355]/60">
                      {canOpen ? '时光已到，点击拆信' : '信件密封中，耐心等待吧'}
                    </p>
                  </div>

                  <div
                    className="absolute bottom-4 right-4 h-12 w-12 rotate-12 opacity-[0.06]"
                    style={{ color: THEME_COLORS.sealRed }}
                  >
                    <svg viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="50" r="45" />
                      <text x="50" y="58" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">封</text>
                    </svg>
                  </div>
                </div>
              </motion.div>

              {canOpen && !isOpening && (
                <motion.div
                  className="absolute -inset-4 rounded-xl opacity-50"
                  style={{ background: `radial-gradient(circle, ${capsule.moodColor}15, transparent 70%)` }}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {isOpening && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ scale: [1, 2, 3], opacity: [1, 0.5, 0] }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-20 w-20 rounded-full"
                    style={{ background: `radial-gradient(circle, ${capsule.moodColor}40, transparent)` }}
                  />
                </motion.div>
              )}
            </motion.div>

            {canOpen && !isOpening && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className="rounded-full px-8 py-3 text-sm font-bold shadow-lg transition-shadow hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${capsule.moodColor}, ${capsule.moodColor}CC)`,
                  color: 'white',
                }}
              >
                拆开这封信
              </motion.button>
            )}

            <div className="mt-6 text-center text-xs text-[#8B7355]/50">
              <p>写信日期：{formatDate(capsule.createdAt)}</p>
              <p>开启日期：{formatDate(capsule.openDate)}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="opened"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `${capsule.moodColor}20` }}
            >
              <MailOpen size={24} style={{ color: capsule.moodColor }} />
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full overflow-hidden rounded-xl shadow-xl"
              style={{
                background: `linear-gradient(145deg, ${THEME_COLORS.cream}, ${THEME_COLORS.paperTexture})`,
                borderTop: `3px solid ${capsule.moodColor}`,
              }}
            >
              <div className="p-8">
                <div className="mb-1 text-xs" style={{ color: `${capsule.moodColor}AA` }}>
                  来自 {formatDate(capsule.createdAt)} 的信
                </div>
                <h1
                  className="mb-6 text-2xl font-bold"
                  style={{ color: THEME_COLORS.darkBrown, fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
                >
                  {capsule.title}
                </h1>

                <div
                  className="mb-6 whitespace-pre-wrap text-sm leading-loose text-[#4A3228]"
                  style={{ fontFamily: '"Noto Serif SC", serif' }}
                >
                  {capsule.content}
                </div>

                {capsule.images.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-3">
                    {capsule.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="h-32 w-32 rounded-lg object-cover shadow-md"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-[#D4A574]/20 pt-4 text-xs text-[#8B7355]/60">
                  <span>写信：{formatDate(capsule.createdAt)}</span>
                  <span>拆信：{formatDate(capsule.openDate)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-xs text-[#8B7355]/40"
            >
              时光胶囊已拆封 ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
