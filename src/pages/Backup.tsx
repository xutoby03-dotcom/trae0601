import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, Shield } from 'lucide-react'
import { useCapsuleStore } from '@/store/capsuleStore'
import { THEME_COLORS } from '@/lib/utils'

export default function Backup() {
  const { exportBackup, importBackup, capsules } = useCapsuleStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importBackup(text)
    e.target.value = ''
  }

  const sealedCount = capsules.filter((c) => c.isLocked).length
  const openedCount = capsules.filter((c) => c.isOpened).length
  const readyCount = capsules.filter((c) => !c.isLocked && !c.isOpened).length

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
            数据管理
          </h1>
          <p className="text-xs text-[#8B7355]">备份与恢复你的时间胶囊</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          <div className="rounded-xl p-4 text-center" style={{ background: '#4A322815', border: '1px solid #4A322830' }}>
            <div className="mb-1 text-2xl font-bold" style={{ color: THEME_COLORS.gold, fontFamily: '"Playfair Display", serif' }}>
              {capsules.length}
            </div>
            <div className="text-[10px] text-[#8B7355]">总胶囊</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: '#4A322815', border: '1px solid #4A322830' }}>
            <div className="mb-1 text-2xl font-bold" style={{ color: THEME_COLORS.gold, fontFamily: '"Playfair Display", serif' }}>
              {sealedCount}
            </div>
            <div className="text-[10px] text-[#8B7355]">密封中</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: '#4A322815', border: '1px solid #4A322830' }}>
            <div className="mb-1 text-2xl font-bold" style={{ color: THEME_COLORS.gold, fontFamily: '"Playfair Display", serif' }}>
              {openedCount + readyCount}
            </div>
            <div className="text-[10px] text-[#8B7355]">已到期</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportBackup}
            className="flex w-full items-center gap-4 rounded-xl p-5 text-left transition-shadow hover:shadow-lg"
            style={{
              background: `linear-gradient(145deg, ${THEME_COLORS.cream}10, ${THEME_COLORS.paperTexture}10)`,
              border: `1px solid ${THEME_COLORS.gold}20`,
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `${THEME_COLORS.gold}15` }}
            >
              <Download size={20} style={{ color: THEME_COLORS.gold }} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#E8C99B]">导出备份</div>
              <div className="text-[11px] text-[#8B7355]/60">
                将所有胶囊（含图片）导出为 JSON 文件
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleImport}
            className="flex w-full items-center gap-4 rounded-xl p-5 text-left transition-shadow hover:shadow-lg"
            style={{
              background: `linear-gradient(145deg, ${THEME_COLORS.cream}10, ${THEME_COLORS.paperTexture}10)`,
              border: `1px solid ${THEME_COLORS.gold}20`,
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `${THEME_COLORS.gold}15` }}
            >
              <Upload size={20} style={{ color: THEME_COLORS.gold }} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#E8C99B]">导入恢复</div>
              <div className="text-[11px] text-[#8B7355]/60">
                从 JSON 备份文件恢复胶囊数据
              </div>
            </div>
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex items-start gap-3 rounded-xl p-4"
            style={{ background: '#4A322810', border: '1px solid #4A322820' }}
          >
            <Shield size={16} className="mt-0.5 flex-shrink-0 text-[#8B7355]/40" />
            <div className="text-[11px] leading-relaxed text-[#8B7355]/50">
              所有数据均存储在浏览器本地 IndexedDB 中，不会上传到任何服务器。
              建议定期导出备份，以防浏览器数据丢失。
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
