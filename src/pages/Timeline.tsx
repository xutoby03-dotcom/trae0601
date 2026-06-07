import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, MailOpen } from 'lucide-react'
import { useCapsuleStore } from '@/store/capsuleStore'
import { formatDate, THEME_COLORS } from '@/lib/utils'

export default function Timeline() {
  const { capsules, loadCapsules } = useCapsuleStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadCapsules()
  }, [loadCapsules])

  const sorted = useMemo(() => {
    return [...capsules].sort((a, b) => {
      const aReady = !a.isLocked && !a.isOpened ? 0 : 1
      const bReady = !b.isLocked && !b.isOpened ? 0 : 1
      if (aReady !== bReady) return aReady - bReady
      return new Date(a.openDate).getTime() - new Date(b.openDate).getTime()
    })
  }, [capsules])

  return (
    <div className="min-h-screen pb-24" style={{ background: `linear-gradient(180deg, ${THEME_COLORS.darkBrown} 0%, #1A0F08 100%)` }}>
      <div className="mx-auto max-w-xl px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="mb-1 text-2xl font-bold"
            style={{ color: THEME_COLORS.gold, fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
          >
            时间线
          </h1>
          <p className="text-xs text-[#8B7355]">所有胶囊按开启日期排列</p>
        </motion.div>

        {sorted.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <span className="mb-3 block text-3xl">📭</span>
            <p className="text-sm text-[#8B7355]/50">还没有时间胶囊</p>
          </motion.div>
        )}

        <div className="relative">
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-[#4A3228]/30" />

          {sorted.map((capsule, i) => {
            const isOpened = capsule.isOpened
            const isLocked = capsule.isLocked
            const isReadyToOpen = !isLocked && !isOpened

            return (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative mb-6 flex gap-4"
              >
                <div className="relative z-10 mt-1.5 flex-shrink-0">
                  <div
                    className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 ${
                      isReadyToOpen ? 'border-solid' : isOpened ? 'border-solid' : 'border-dashed'
                    }`}
                    style={{
                      borderColor: isReadyToOpen ? capsule.moodColor : isOpened ? capsule.moodColor : '#4A322860',
                      background: isReadyToOpen ? `${capsule.moodColor}25` : isOpened ? `${capsule.moodColor}20` : '#2C181060',
                      boxShadow: isReadyToOpen ? `0 0 12px ${capsule.moodColor}40` : undefined,
                    }}
                  >
                    {isReadyToOpen ? (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Mail size={14} style={{ color: capsule.moodColor }} />
                      </motion.div>
                    ) : isOpened ? (
                      <MailOpen size={14} style={{ color: capsule.moodColor }} />
                    ) : (
                      <Lock size={12} className="text-[#8B7355]/60" />
                    )}
                  </div>
                </div>

                <motion.div
                  whileHover={{ x: 3 }}
                  onClick={() => navigate(`/capsule/${capsule.id}`)}
                  className="flex-1 cursor-pointer rounded-xl p-4 transition-shadow hover:shadow-lg"
                  style={{
                    background: isReadyToOpen
                      ? `linear-gradient(145deg, ${capsule.moodColor}08, ${THEME_COLORS.cream}0D, ${THEME_COLORS.paperTexture}0D)`
                      : `linear-gradient(145deg, ${THEME_COLORS.cream}0D, ${THEME_COLORS.paperTexture}0D)`,
                    border: `1px solid ${isReadyToOpen ? capsule.moodColor + '40' : isOpened ? capsule.moodColor + '30' : '#4A322830'}`,
                    borderLeft: `3px solid ${capsule.moodColor}`,
                    boxShadow: isReadyToOpen ? `0 2px 12px ${capsule.moodColor}15` : undefined,
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h3
                      className="truncate text-sm font-bold"
                      style={{
                        color: isReadyToOpen ? capsule.moodColor : isOpened ? THEME_COLORS.cream : '#8B7355',
                        fontFamily: '"Playfair Display", "Noto Serif SC", serif',
                      }}
                    >
                      {isLocked ? capsule.title.replace(/./g, '•').slice(0, 6) + (capsule.title.length > 6 ? '…' : '') : capsule.title}
                    </h3>
                    <span
                      className="ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: isReadyToOpen ? capsule.moodColor : isOpened ? `${capsule.moodColor}20` : '#4A322820',
                        color: isReadyToOpen ? '#fff' : isOpened ? capsule.moodColor : '#8B7355',
                      }}
                    >
                      {isReadyToOpen ? '等你拆 ✨' : isOpened ? '已拆信' : '密封中'}
                    </span>
                  </div>

                  {isReadyToOpen && (
                    <p className="mb-2 text-xs font-medium" style={{ color: capsule.moodColor, opacity: 0.7 }}>
                      时光已到，快去拆信吧
                    </p>
                  )}

                  {isOpened && (
                    <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-[#8B7355]/70" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                      {capsule.content.slice(0, 80)}{capsule.content.length > 80 ? '…' : ''}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-[#8B7355]/50">
                    <span>开启日期：{formatDate(capsule.openDate)}</span>
                    {capsule.images.length > 0 && <span>📎 {capsule.images.length}</span>}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
