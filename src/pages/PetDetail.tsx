import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Droplets } from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { usePetStore } from '@/store/usePetStore'
import type { PoopStatus } from '@/types'
import { POOP_STATUS_LABELS } from '@/types'

const TYPE_EMOJI: Record<string, string> = { cat: '🐱', dog: '🐶' }

const POOP_STATUS_CONFIG: { value: PoopStatus; color: string; bg: string; border: string; emoji: string }[] = [
  { value: 'normal', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', emoji: '😊' },
  { value: 'soft', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300', emoji: '😐' },
  { value: 'loose', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300', emoji: '😟' },
  { value: 'constipated', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', emoji: '😣' },
]

const ABNORMAL_TAGS = ['不吃', '呕吐', '精神差', '咳嗽', '皮肤问题']

const WATER_QUICK = [50, 100, 150, 200]

export default function PetDetail() {
  const { petId } = useParams<{ petId: string }>()
  const navigate = useNavigate()
  const { pets, addDailyRecord, getDailyRecord } = usePetStore()

  const pet = pets.find((p) => p.id === petId)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [foodActual, setFoodActual] = useState<number>(0)
  const [waterMl, setWaterMl] = useState<number>(0)
  const [poopStatus, setPoopStatus] = useState<PoopStatus>('normal')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [abnormalNote, setAbnormalNote] = useState('')

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const dateDisplay = format(currentDate, 'M月d日 EEEE', { locale: zhCN })

  useEffect(() => {
    if (!petId) return
    const record = getDailyRecord(petId, dateStr)
    if (record) {
      setFoodActual(record.foodActualGrams)
      setWaterMl(record.waterMl)
      setPoopStatus(record.poopStatus)
      setAbnormalNote(record.abnormalNote)
      const tags = ABNORMAL_TAGS.filter((tag) => record.abnormalNote.includes(tag))
      setSelectedTags(new Set(tags))
    } else {
      setFoodActual(0)
      setWaterMl(0)
      setPoopStatus('normal')
      setSelectedTags(new Set())
      setAbnormalNote('')
    }
  }, [petId, dateStr, getDailyRecord])

  if (!pet) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">😿</div>
        <h2 className="font-display text-xl font-bold text-stone-700 mb-2">找不到宠物</h2>
        <p className="text-sm text-stone-500 mb-6">该宠物不存在或已被删除</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          返回首页
        </button>
      </div>
    )
  }

  const goToday = () => setCurrentDate(new Date())
  const goPrev = () => setCurrentDate((d) => subDays(d, 1))
  const goNext = () => setCurrentDate((d) => addDays(d, 1))

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const saveDiet = () => {
    addDailyRecord({
      petId: pet.id,
      date: dateStr,
      foodActualGrams: foodActual,
      waterMl,
      poopStatus,
      abnormalNote: abnormalNote,
    })
  }

  const savePoop = () => {
    addDailyRecord({
      petId: pet.id,
      date: dateStr,
      foodActualGrams: foodActual,
      waterMl,
      poopStatus,
      abnormalNote: abnormalNote,
    })
  }

  const saveAbnormal = () => {
    const tagStr = Array.from(selectedTags).join(' ')
    const fullNote = [tagStr, abnormalNote.trim()].filter(Boolean).join(' ')
    addDailyRecord({
      petId: pet.id,
      date: dateStr,
      foodActualGrams: foodActual,
      waterMl,
      poopStatus,
      abnormalNote: fullNote,
    })
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-8">
      <div className="bg-white border-b border-stone-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-stone-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-extrabold text-stone-800 truncate">
              {pet.name}
            </h1>
            <span className="text-sm text-stone-500">{TYPE_EMOJI[pet.type]}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {pet.photo ? (
              <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{TYPE_EMOJI[pet.type]}</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goPrev}
            className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft size={18} className="text-stone-600" />
          </button>
          <span className="font-display font-bold text-lg text-stone-800 min-w-[140px] text-center">
            {dateDisplay}
          </span>
          <button
            onClick={goNext}
            className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight size={18} className="text-stone-600" />
          </button>
          <button
            onClick={goToday}
            className="ml-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            今天
          </button>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4"
          >
            <h2 className="font-display font-bold text-stone-800 text-base mb-4 flex items-center gap-2">
              <span className="text-xl">🍽</span> 饮食记录
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">实际进食量(g)</label>
                <input
                  type="number"
                  value={foodActual || ''}
                  onChange={(e) => setFoodActual(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">饮水量(ml)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={waterMl || ''}
                    onChange={(e) => setWaterMl(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors"
                  />
                  <Droplets size={18} className="text-sky-400 flex-shrink-0" />
                </div>
                <div className="flex gap-2 mt-2.5">
                  {WATER_QUICK.map((ml) => (
                    <button
                      key={ml}
                      onClick={() => setWaterMl((prev) => prev + ml)}
                      className="flex-1 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-600 hover:bg-sky-100 active:scale-95 transition-all"
                    >
                      +{ml}ml
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={saveDiet}
                className="w-full py-2.5 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                保存饮食记录
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4"
          >
            <h2 className="font-display font-bold text-stone-800 text-base mb-4 flex items-center gap-2">
              <span className="text-xl">💩</span> 排泄记录
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {POOP_STATUS_CONFIG.map((config) => (
                  <button
                    key={config.value}
                    onClick={() => setPoopStatus(config.value)}
                    className={`
                      flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all active:scale-95
                      ${poopStatus === config.value
                        ? `${config.bg} ${config.border} ${config.color}`
                        : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                      }
                    `}
                  >
                    <span className="text-xl">{config.emoji}</span>
                    <span className="text-sm font-semibold">{POOP_STATUS_LABELS[config.value]}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center py-2">
                <span className="text-3xl">
                  {POOP_STATUS_CONFIG.find((c) => c.value === poopStatus)?.emoji}
                </span>
              </div>
              <button
                onClick={savePoop}
                className="w-full py-2.5 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                保存排泄记录
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4"
          >
            <h2 className="font-display font-bold text-stone-800 text-base mb-4 flex items-center gap-2">
              <span className="text-xl">📝</span> 异常备注
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {ABNORMAL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all active:scale-95
                      ${selectedTags.has(tag)
                        ? 'bg-rose-50 border-rose-300 text-rose-600'
                        : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                value={abnormalNote}
                onChange={(e) => setAbnormalNote(e.target.value)}
                placeholder="记录其他异常情况..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors resize-none"
              />
              <button
                onClick={saveAbnormal}
                className="w-full py-2.5 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                保存异常备注
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-4"
          >
            <h2 className="font-display font-bold text-stone-800 text-base mb-3 flex items-center gap-2">
              📋 宠物档案
            </h2>
            <div className="space-y-2.5">
              {pet.restrictions && (
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-semibold flex-shrink-0">禁忌</span>
                  <span className="text-sm text-stone-600">{pet.restrictions}</span>
                </div>
              )}
              {pet.medications && (
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-xs font-semibold flex-shrink-0">用药</span>
                  <span className="text-sm text-stone-600">{pet.medications}</span>
                </div>
              )}
              {pet.specialHabits && (
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-semibold flex-shrink-0">习性</span>
                  <span className="text-sm text-stone-600">{pet.specialHabits}</span>
                </div>
              )}
              {!pet.restrictions && !pet.medications && !pet.specialHabits && (
                <p className="text-sm text-stone-400 text-center py-2">暂无特殊记录</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
