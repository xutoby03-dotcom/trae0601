import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUmbrellaStore } from '@/store'
import { SIZE_LABELS, LOCATIONS } from '@/types'
import type { DamageType, ReturnCondition } from '@/types'
import { formatDateTime } from '@/utils/helpers'
import DamageCheck from '@/components/DamageCheck'
import { ArrowLeft, MapPin, Clock, Camera, Check, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Return() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const store = useUmbrellaStore()

  const umbrella = store.umbrellas.find((u) => u.id === id)
  const borrowRecord = umbrella ? store.getActiveBorrowForUmbrella(umbrella.id) : undefined

  const [returnLocation, setReturnLocation] = useState(borrowRecord?.returnLocation || LOCATIONS[0].name)
  const [condition, setCondition] = useState<ReturnCondition>('good')
  const [damageTypes, setDamageTypes] = useState<DamageType[]>([])
  const [damageNote, setDamageNote] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!borrowRecord) return

    store.returnUmbrella(borrowRecord.id, condition, damageTypes, damageNote)
    setSubmitted(true)
  }

  if (!umbrella || !borrowRecord) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-400">未找到该借用记录</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-full bg-[#1B3A5C] text-white text-sm font-semibold"
        >
          返回首页
        </button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 font-display">归还成功！</h2>
          <p className="text-sm text-slate-500 mb-1">
            雨伞 {umbrella.code} 已归还到 {returnLocation}
          </p>
          {condition === 'damaged' && (
            <p className="text-xs text-orange-500 mt-2">
              已记录损坏信息，雨伞将进入维修状态
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-5 py-2 rounded-full bg-[#1B3A5C] text-white text-sm font-semibold hover:bg-[#2D5F8B] transition-colors"
          >
            返回首页
          </button>
        </motion.div>
      </div>
    )
  }

  const isOverdue = new Date(borrowRecord.expectedReturnTime) < new Date()

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1B3A5C] font-display">归还雨伞</h2>
        <p className="text-sm text-slate-400 mt-1">请检查雨伞状况并确认归还</p>
      </div>

      {isOverdue && (
        <div className="mb-5 rounded-2xl bg-red-50 border border-red-200/50 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">
            该雨伞已逾期，应还时间 {formatDateTime(borrowRecord.expectedReturnTime)}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200/60"
            style={{ backgroundColor: umbrella.color + '20' }}
          >
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: umbrella.color }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">{umbrella.code}</h3>
            <p className="text-xs text-slate-400">{SIZE_LABELS[umbrella.size]}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            借用人: {borrowRecord.borrowerName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            借用时间: {formatDateTime(borrowRecord.borrowTime)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">归还点</label>
            <select
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all bg-white"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">伞况检查</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'good' as ReturnCondition, label: '完好', emoji: '✓', bg: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
                { value: 'damaged' as ReturnCondition, label: '有损坏', emoji: '⚠', bg: 'bg-orange-50 border-orange-300 text-orange-700' },
                { value: 'lost' as ReturnCondition, label: '已丢失', emoji: '✕', bg: 'bg-red-50 border-red-300 text-red-700' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setCondition(opt.value)
                    if (opt.value !== 'damaged') setDamageTypes([])
                  }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                    condition === opt.value ? opt.bg : 'border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {condition === 'damaged' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              <label className="block text-sm font-semibold text-slate-700">损坏类型</label>
              <DamageCheck selected={damageTypes} onChange={setDamageTypes} />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">损坏备注</label>
                <textarea
                  value={damageNote}
                  onChange={(e) => setDamageNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all resize-none"
                  rows={2}
                  placeholder="描述损坏情况..."
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">归还拍照确认</label>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="归还确认"
                  className="w-full h-40 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#1B3A5C]/40 hover:bg-slate-50 transition-all">
                <Camera className="w-7 h-7 text-slate-300 mb-2" />
                <span className="text-sm text-slate-400">拍照确认伞况</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1B3A5C] to-[#2D5F8B] text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transition-all duration-200"
        >
          确认归还
        </button>
      </form>
    </div>
  )
}
