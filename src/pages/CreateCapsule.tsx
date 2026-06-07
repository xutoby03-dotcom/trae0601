import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'
import MoodColorPicker from '@/components/MoodColorPicker'
import ImageUploader from '@/components/ImageUploader'
import { useCapsuleStore } from '@/store/capsuleStore'
import { THEME_COLORS, MOOD_COLORS } from '@/lib/utils'

export default function CreateCapsule() {
  const navigate = useNavigate()
  const { templateId } = useParams()
  const { addCapsule, templates, showToast } = useCapsuleStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [openDate, setOpenDate] = useState('')
  const [moodColor, setMoodColor] = useState(MOOD_COLORS[0].value)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (templateId) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setContent(template.prefix)
        setMoodColor(template.defaultMoodColor)
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + template.defaultDaysAhead)
        setOpenDate(futureDate.toISOString().split('T')[0])
      }
    }
  }, [templateId, templates])

  useEffect(() => {
    if (!openDate) {
      const defaultDate = new Date()
      defaultDate.setFullYear(defaultDate.getFullYear() + 1)
      setOpenDate(defaultDate.toISOString().split('T')[0])
    }
  }, [openDate])

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      showToast('请输入标题', 'error')
      return
    }
    if (!content.trim()) {
      showToast('请写点什么吧', 'error')
      return
    }
    if (!openDate) {
      showToast('请选择开启日期', 'error')
      return
    }
    const openDateTime = new Date(openDate + 'T23:59:59').toISOString()
    await addCapsule({
      title: title.trim(),
      content: content.trim(),
      openDate: openDateTime,
      moodColor,
      images,
      templateId,
    })
    showToast('时间胶囊已封存 ✨', 'success')
    navigate('/')
  }, [title, content, openDate, moodColor, images, templateId, addCapsule, showToast, navigate])

  return (
    <div className="min-h-screen pb-24" style={{ background: `linear-gradient(180deg, ${THEME_COLORS.darkBrown} 0%, #1A0F08 100%)` }}>
      <div className="mx-auto max-w-xl px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A3228]/40 text-[#8B7355] transition-colors hover:border-[#D4A574]/40"
          >
            <ArrowLeft size={16} />
          </button>
          <h1
            className="text-xl font-bold"
            style={{ color: THEME_COLORS.gold, fontFamily: '"Playfair Display", "Noto Serif SC", serif' }}
          >
            写给未来
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#8B7355]">信件标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给这封信起个名字..."
              className="w-full rounded-lg border border-[#4A3228]/30 bg-[#2C1810]/60 px-4 py-3 text-sm text-[#E8C99B] placeholder-[#8B7355]/30 outline-none transition-colors focus:border-[#D4A574]/50"
              style={{ fontFamily: '"Noto Serif SC", serif' }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#8B7355]">信件正文</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="亲爱的未来的自己..."
              rows={8}
              className="w-full resize-none rounded-lg border border-[#4A3228]/30 bg-[#2C1810]/60 px-4 py-3 text-sm leading-loose text-[#E8C99B] placeholder-[#8B7355]/30 outline-none transition-colors focus:border-[#D4A574]/50"
              style={{ fontFamily: '"Noto Serif SC", serif' }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#8B7355]">开启日期</label>
            <input
              type="date"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-[#4A3228]/30 bg-[#2C1810]/60 px-4 py-3 text-sm text-[#E8C99B] outline-none transition-colors focus:border-[#D4A574]/50 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#8B7355]">心情颜色</label>
            <MoodColorPicker value={moodColor} onChange={setMoodColor} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#8B7355]">附上图片（最多9张）</label>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-shadow hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${THEME_COLORS.gold}, ${THEME_COLORS.lightGold})`,
              color: THEME_COLORS.darkBrown,
            }}
          >
            <Send size={16} />
            封存这封信
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
