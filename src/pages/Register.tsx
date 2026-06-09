import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Upload, Clock, Package, Sparkles, Shirt, ChevronRight } from 'lucide-react'
import type { ClothingType, FabricType, DamageLocation, Difficulty } from '@/types'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

const clothingTypes: { value: ClothingType; emoji: string }[] = [
  { value: '衬衫', emoji: '👔' },
  { value: '牛仔裤', emoji: '👖' },
  { value: '毛衣', emoji: '🧶' },
  { value: 'T恤', emoji: '👕' },
  { value: '裙子', emoji: '👗' },
  { value: '外套', emoji: '🧥' },
]

const fabricTypes: FabricType[] = ['棉', '麻', '丝绸', '羊毛', '化纤', '混纺']

const colorSwatches: { label: string; hex: string }[] = [
  { label: '黑', hex: '#1a1a1a' },
  { label: '白', hex: '#ffffff' },
  { label: '灰', hex: '#9ca3af' },
  { label: '蓝', hex: '#3b82f6' },
  { label: '红', hex: '#ef4444' },
  { label: '绿', hex: '#22c55e' },
  { label: '棕', hex: '#92400e' },
  { label: '粉', hex: '#f472b6' },
  { label: '黄', hex: '#eab308' },
]

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const damageLocations: DamageLocation[] = ['领口', '袖口', '膝盖', '拉链', '纽扣', '面料磨损', '无破损']

const difficultyConfig: Record<Difficulty, { color: string; bg: string }> = {
  '简单': { color: 'text-sage-700', bg: 'bg-sage-100' },
  '中等': { color: 'text-terra-700', bg: 'bg-terra-100' },
  '困难': { color: 'text-red-700', bg: 'bg-red-100' },
}

export default function Register() {
  const navigate = useNavigate()
  const addClothing = useStore((s) => s.addClothing)
  const createProject = useStore((s) => s.createProject)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const storeIdeas = useStore((s) => s.ideas)
  const materials = useStore((s) => s.materials)

  const [type, setType] = useState<ClothingType | ''>('')
  const [fabric, setFabric] = useState<FabricType | ''>('')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [damageLocation, setDamageLocation] = useState<DamageLocation | ''>('')
  const [photo, setPhoto] = useState('')
  const [reason, setReason] = useState('')
  const [typeError, setTypeError] = useState(false)
  const [submittedClothingId, setSubmittedClothingId] = useState<string | null>(null)

  const ideas = useMemo(
    () => submittedClothingId ? storeIdeas.filter(i => i.clothingId === submittedClothingId) : [],
    [storeIdeas, submittedClothingId]
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!type) {
      setTypeError(true)
      return
    }
    setTypeError(false)
    const clothing = addClothing(
      type,
      (fabric || '棉') as FabricType,
      color,
      size,
      (damageLocation || '无破损') as DamageLocation,
      photo,
      reason,
    )
    setSubmittedClothingId(clothing.id)
  }

  const handleStartProject = (ideaId: string) => {
    if (!submittedClothingId) return
    createProject(submittedClothingId, ideaId)
    navigate(`/project/${submittedClothingId}`)
  }

  const handleReset = () => {
    setType('')
    setFabric('')
    setColor('')
    setSize('')
    setDamageLocation('')
    setPhoto('')
    setReason('')
    setSubmittedClothingId(null)
    setTypeError(false)
  }

  const getMaterialName = (id: string) => materials.find(m => m.id === id)?.name ?? id

  return (
    <div className="min-h-screen bg-cream-100 font-body pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <AnimatePresence mode="wait">
          {!submittedClothingId ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-sage-800 mb-2">
                  登记旧衣
                </h1>
                <p className="text-sage-500 text-sm">
                  每一件旧衣都藏着新的可能 ✨
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-card space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-3">
                      类型 <span className="text-terra-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {clothingTypes.map(({ value, emoji }) => (
                        <motion.button
                          key={value}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setType(value); setTypeError(false) }}
                          className={cn(
                            'flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl border-2 transition-all',
                            type === value
                              ? 'border-terra-500 bg-terra-50 shadow-card-hover'
                              : 'border-cream-300 bg-cream-50 hover:border-terra-300 hover:bg-terra-50/50'
                          )}
                        >
                          <span className="text-2xl">{emoji}</span>
                          <span className={cn(
                            'text-xs font-medium',
                            type === value ? 'text-terra-700' : 'text-sage-600'
                          )}>
                            {value}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                    {typeError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-2"
                      >
                        请选择衣物类型
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-3">
                      面料
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {fabricTypes.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFabric(f)}
                          className={cn(
                            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
                            fabric === f
                              ? 'border-terra-500 bg-terra-500 text-white shadow-soft'
                              : 'border-cream-400 bg-cream-50 text-sage-600 hover:border-terra-300'
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-3">
                      颜色
                    </label>
                    <div className="flex flex-wrap gap-2.5 mb-3">
                      {colorSwatches.map(({ label, hex }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setColor(label)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center',
                            color === label
                              ? 'border-terra-500 scale-110 shadow-card-hover'
                              : 'border-cream-300 hover:scale-105',
                            hex === '#ffffff' && 'border-cream-400'
                          )}
                          style={{ backgroundColor: hex }}
                        >
                          {color === label && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={cn(
                                'w-3 h-3 rounded-full',
                                hex === '#ffffff' ? 'bg-sage-600' : 'bg-white'
                              )}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="或输入自定义颜色…"
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm text-sage-800 placeholder:text-sage-400 focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-3">
                      尺码
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSize(s)}
                          className={cn(
                            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
                            size === s
                              ? 'border-terra-500 bg-terra-500 text-white shadow-soft'
                              : 'border-cream-400 bg-cream-50 text-sage-600 hover:border-terra-300'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-3">
                      破损位置
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {damageLocations.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDamageLocation(d)}
                          className={cn(
                            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
                            damageLocation === d
                              ? 'border-sage-500 bg-sage-500 text-white shadow-soft'
                              : 'border-cream-400 bg-cream-50 text-sage-600 hover:border-sage-300'
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-3">
                      照片
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                        photo
                          ? 'border-terra-400 bg-terra-50/30'
                          : 'border-cream-400 bg-cream-50/50 hover:border-terra-300 hover:bg-terra-50/20'
                      )}
                    >
                      {photo ? (
                        <div className="flex items-center gap-4">
                          <img
                            src={photo}
                            alt="预览"
                            className="w-16 h-16 rounded-lg object-cover shadow-soft"
                          />
                          <div className="text-left">
                            <p className="text-sm text-sage-700 font-medium">已上传照片</p>
                            <p className="text-xs text-sage-400 mt-0.5">点击更换照片</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-cream-200 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-sage-500" />
                          </div>
                          <p className="text-sm text-sage-500">点击上传照片</p>
                          <p className="text-xs text-sage-400">支持 JPG、PNG 格式</p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-3">
                      舍不得扔的原因
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="这件衣服对你有什么特别的意义？…"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm text-sage-800 placeholder:text-sage-400 focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-200 transition-all resize-none"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-terra-500 to-terra-600 text-white font-medium text-sm shadow-card-hover hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  获取改造灵感
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-14 h-14 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center"
                >
                  <Shirt className="w-7 h-7 text-sage-600" />
                </motion.div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-sage-800 mb-2">
                  改造灵感来了！
                </h2>
                <p className="text-sage-500 text-sm">
                  为你的{type}找到了 {ideas.length} 个改造方向
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {ideas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terra-100 to-sage-100 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-terra-500" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-semibold text-sage-800">
                            {idea.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              difficultyConfig[idea.difficulty].bg,
                              difficultyConfig[idea.difficulty].color
                            )}>
                              {idea.difficulty}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-sage-400">
                              <Clock className="w-3 h-3" />
                              {idea.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => toggleFavorite(idea.id)}
                        className="p-1.5"
                      >
                        <Heart
                          className={cn(
                            'w-5 h-5 transition-colors',
                            idea.favorited
                              ? 'fill-red-400 text-red-400'
                              : 'text-sage-300 hover:text-red-300'
                          )}
                        />
                      </motion.button>
                    </div>

                    <p className="text-sm text-sage-600 leading-relaxed mb-4">
                      {idea.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package className="w-3.5 h-3.5 text-sage-400" />
                        <span className="text-xs font-medium text-sage-500">所需材料</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {idea.requiredMaterialIds.map((id) => (
                          <span
                            key={id}
                            className="text-xs px-2.5 py-1 rounded-full bg-cream-200 text-sage-600"
                          >
                            {getMaterialName(id)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStartProject(idea.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-terra-500 to-terra-600 text-white font-medium text-sm shadow-soft hover:shadow-card-hover transition-shadow flex items-center justify-center gap-1.5"
                    >
                      开始改造
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="w-full py-3 rounded-xl border-2 border-cream-400 text-sage-600 font-medium text-sm hover:bg-cream-200 transition-colors"
              >
                继续登记其他旧衣
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
