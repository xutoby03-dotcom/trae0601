import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Camera, ImagePlus, X } from 'lucide-react'
import { useGarbageStore } from '../stores/useGarbageStore'
import { useFamilyStore } from '../stores/useFamilyStore'
import CategoryPicker from '../components/CategoryPicker'
import MemberPicker from '../components/MemberPicker'
import type { GarbageCategory } from '../types'
import { categoryConfig, categoryList } from '../utils/category'
import { format } from 'date-fns'

const quickItems = [
  { name: '外卖盒', category: 'other' as GarbageCategory },
  { name: '茶叶渣', category: 'kitchen' as GarbageCategory },
  { name: '电池', category: 'other' as GarbageCategory },
  { name: '纸箱', category: 'recyclable' as GarbageCategory },
  { name: '猫砂', category: 'other' as GarbageCategory },
  { name: '剩菜剩饭', category: 'kitchen' as GarbageCategory },
  { name: '塑料瓶', category: 'recyclable' as GarbageCategory },
  { name: '过期药品', category: 'hazardous' as GarbageCategory },
  { name: '灯泡', category: 'other' as GarbageCategory },
  { name: '果皮', category: 'kitchen' as GarbageCategory },
]

export default function Record() {
  const navigate = useNavigate()
  const { addRecord } = useGarbageStore()
  const { members } = useFamilyStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<GarbageCategory>('kitchen')
  const [binType, setBinType] = useState<GarbageCategory>('kitchen')
  const [memberId, setMemberId] = useState(members[0]?.id || '')
  const [disposalTime, setDisposalTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  const [notes, setNotes] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoUrl(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSubmit = () => {
    if (!name.trim()) return

    addRecord({
      id: Date.now().toString(),
      name: name.trim(),
      category,
      binType,
      memberId,
      disposalTime,
      notes,
      photoUrl,
      isCorrect: category === binType,
      createdAt: new Date().toISOString(),
      disposed: false,
    })

    navigate('/')
  }

  const handleQuickItem = (item: typeof quickItems[number]) => {
    setName(item.name)
    setCategory(item.category)
    setBinType(item.category)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-stone-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h1 className="text-xl font-bold text-stone-800">添加垃圾记录</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <label className="block text-sm font-semibold text-stone-600 mb-2">拍照记录</label>
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <div className="relative">
                <img
                  src={photoUrl}
                  alt="垃圾照片"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-300"
                />
                <button
                  onClick={() => setPhotoUrl('')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-stone-300 bg-white flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                >
                  <Camera className="w-5 h-5 text-stone-400" />
                  <span className="text-xs text-stone-400">拍照</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-stone-300 bg-white flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                >
                  <ImagePlus className="w-5 h-5 text-stone-400" />
                  <span className="text-xs text-stone-400">相册</span>
                </button>
              </>
            )}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <label className="block text-sm font-semibold text-stone-600 mb-2">快捷选择</label>
          <div className="flex flex-wrap gap-2">
            {quickItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleQuickItem(item)}
                className="px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
              >
                {item.name}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <label className="block text-sm font-semibold text-stone-600 mb-2">垃圾名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入垃圾名称..."
            className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 focus:border-emerald-400 focus:outline-none text-stone-800 placeholder-stone-300 transition-colors"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <label className="block text-sm font-semibold text-stone-600 mb-3">垃圾分类</label>
          <CategoryPicker value={category} onChange={setCategory} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <label className="block text-sm font-semibold text-stone-600 mb-3">扔进哪个桶？</label>
          <div className="grid grid-cols-4 gap-3">
            {categoryList.map((cat) => {
              const config = categoryConfig[cat]
              const isSelected = binType === cat
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBinType(cat)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? `${config.bgColor} ${config.borderColor} shadow-lg scale-105`
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className="text-3xl">{config.emoji}</span>
                  <span className={`text-xs font-semibold ${isSelected ? config.color : 'text-stone-500'}`}>
                    {config.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      layoutId="binIndicator"
                      className={`absolute -top-1 -right-1 w-5 h-5 ${config.bgColor} ${config.borderColor} border-2 rounded-full flex items-center justify-center`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    >
                      <span className="text-xs">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
          {category !== binType && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"
            >
              ⚠️ 分类和桶类型不一致，保存后将标记为"分错"，可在首页纠正
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <label className="block text-sm font-semibold text-stone-600 mb-3">谁扔的？</label>
          <MemberPicker members={members} value={memberId} onChange={setMemberId} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <label className="block text-sm font-semibold text-stone-600 mb-2">投放时间</label>
          <input
            type="datetime-local"
            value={disposalTime}
            onChange={(e) => setDisposalTime(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 focus:border-emerald-400 focus:outline-none text-stone-800 transition-colors"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <label className="block text-sm font-semibold text-stone-600 mb-2">注意事项</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="比如：需冲洗、需压扁..."
            rows={2}
            className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 focus:border-emerald-400 focus:outline-none text-stone-800 placeholder-stone-300 transition-colors resize-none"
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full py-4 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-200 disabled:text-stone-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:shadow-none"
        >
          <Check className="w-5 h-5" />
          保存记录
        </motion.button>
      </div>
    </div>
  )
}
