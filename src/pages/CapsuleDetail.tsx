import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import CapsuleDetailView from '@/components/CapsuleDetail'
import { useCapsuleStore } from '@/store/capsuleStore'
import { THEME_COLORS, formatDate } from '@/lib/utils'

export default function CapsuleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { capsules, openCapsule, deleteCapsule, loadCapsules } = useCapsuleStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadCapsules()
  }, [loadCapsules])

  const capsule = capsules.find((c) => c.id === id)

  if (!capsule) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: THEME_COLORS.darkBrown }}>
        <p className="text-[#8B7355]">胶囊不存在</p>
      </div>
    )
  }

  const handleOpen = async () => {
    await openCapsule(capsule.id)
  }

  const handleDelete = async () => {
    await deleteCapsule(capsule.id)
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: `linear-gradient(180deg, ${THEME_COLORS.darkBrown} 0%, #1A0F08 100%)` }}>
      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A3228]/40 text-[#8B7355] transition-colors hover:border-[#D4A574]/40"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            {capsule.isOpened && (
              <span className="rounded-full px-3 py-1 text-[10px] font-medium" style={{ background: `${capsule.moodColor}15`, color: capsule.moodColor }}>
                已拆信
              </span>
            )}
            {!capsule.isLocked && !capsule.isOpened && (
              <span className="rounded-full px-3 py-1 text-[10px] font-medium" style={{ background: `${capsule.moodColor}15`, color: capsule.moodColor }}>
                可拆信
              </span>
            )}
            {capsule.isLocked && (
              <span className="rounded-full bg-[#4A3228]/20 px-3 py-1 text-[10px] font-medium text-[#8B7355]">
                密封中
              </span>
            )}
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A3228]/40 text-[#8B7355]/50 transition-colors hover:border-red-800/40 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <CapsuleDetailView capsule={capsule} onOpen={handleOpen} />

        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-sm rounded-xl p-6"
              style={{ background: THEME_COLORS.darkBrown, border: `1px solid ${THEME_COLORS.gold}30` }}
            >
              <h3 className="mb-2 text-base font-bold text-[#E8C99B]" style={{ fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}>
                确认删除
              </h3>
              <p className="mb-4 text-xs text-[#8B7355]">
                删除后无法恢复，确定要删除这封「{capsule.title}」吗？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-lg border border-[#4A3228]/40 py-2 text-xs text-[#8B7355] transition-colors hover:border-[#D4A574]/40"
                >
                  再想想
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-lg bg-red-900/80 py-2 text-xs text-red-200 transition-colors hover:bg-red-800"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
