import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUmbrellaStore } from '@/store'
import { LOCATIONS, SIZE_LABELS } from '@/types'
import { formatDateTime } from '@/utils/helpers'
import { ArrowLeft, MapPin, Shield, Clock, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Borrow() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const store = useUmbrellaStore()

  const umbrella = store.umbrellas.find((u) => u.id === id)

  const [borrowerName, setBorrowerName] = useState('')
  const [expectedReturnTime, setExpectedReturnTime] = useState(() => {
    const d = new Date()
    d.setHours(d.getHours() + 24)
    return d.toISOString().slice(0, 16)
  })
  const [returnLocation, setReturnLocation] = useState(LOCATIONS[0].name)
  const [submitted, setSubmitted] = useState(false)

  if (!umbrella) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-400">未找到该雨伞</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-full bg-[#1B3A5C] text-white text-sm font-semibold"
        >
          返回首页
        </button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!borrowerName.trim() || !expectedReturnTime) return

    store.borrowUmbrella(
      umbrella.id,
      borrowerName.trim(),
      new Date(expectedReturnTime).toISOString(),
      returnLocation
    )
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 font-display">借伞成功！</h2>
          <p className="text-sm text-slate-500 mb-2">
            雨伞 {umbrella.code} 已借出
          </p>
          <p className="text-xs text-slate-400">
            请于 {formatDateTime(new Date(expectedReturnTime).toISOString())} 前归还到 {returnLocation}
          </p>
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
        <h2 className="text-2xl font-bold text-[#1B3A5C] font-display">借伞确认</h2>
        <p className="text-sm text-slate-400 mt-1">请确认雨伞信息并填写借用详情</p>
      </div>

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
            <p className="text-xs text-slate-400">{SIZE_LABELS[umbrella.size]} · {umbrella.color === '#F3F4F6' ? '白' : ''}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {umbrella.location}
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {umbrella.deposit > 0 ? `押金¥${umbrella.deposit}` : '免押金'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            贡献者: {umbrella.contributorName}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">你的名字</label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all"
              placeholder="借用人姓名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">预计归还时间</label>
            <input
              type="datetime-local"
              value={expectedReturnTime}
              onChange={(e) => setExpectedReturnTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all"
              required
            />
          </div>

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
        </div>

        <button
          type="submit"
          disabled={!borrowerName.trim() || !expectedReturnTime}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1B3A5C] to-[#2D5F8B] text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          确认借伞
        </button>
      </form>
    </div>
  )
}
