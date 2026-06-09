import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { BATTERY_TYPE_LABELS } from '@/types/index'
import type { HearingAid } from '@/types/index'

const batteryOptions = Object.entries(BATTERY_TYPE_LABELS) as [
  HearingAid['batteryType'],
  string
][]

export default function DeviceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const hearingAids = useStore((s) => s.hearingAids)
  const addHearingAid = useStore((s) => s.addHearingAid)
  const updateHearingAid = useStore((s) => s.updateHearingAid)

  const isEdit = Boolean(id)
  const existing = isEdit ? hearingAids.find((a) => a.id === id) : null

  const [side, setSide] = useState<HearingAid['side']>('left')
  const [model, setModel] = useState('')
  const [batteryType, setBatteryType] = useState<HearingAid['batteryType']>('rechargeable')
  const [chargingCase, setChargingCase] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [warrantyPhone, setWarrantyPhone] = useState('')

  useEffect(() => {
    if (existing) {
      setSide(existing.side)
      setModel(existing.model)
      setBatteryType(existing.batteryType)
      setChargingCase(existing.chargingCase)
      setPurchaseDate(existing.purchaseDate)
      setWarrantyPhone(existing.warrantyPhone)
    }
  }, [existing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!model.trim()) return

    if (isEdit && id) {
      updateHearingAid(id, {
        side,
        model: model.trim(),
        batteryType,
        chargingCase: chargingCase.trim(),
        purchaseDate,
        warrantyPhone: warrantyPhone.trim(),
      })
    } else {
      addHearingAid({
        id: crypto.randomUUID(),
        side,
        model: model.trim(),
        batteryType,
        chargingCase: chargingCase.trim(),
        purchaseDate,
        warrantyPhone: warrantyPhone.trim(),
      })
    }
    navigate('/devices')
  }

  const inputClass =
    'w-full px-4 py-3.5 text-lg rounded-xl border border-indigo-100 bg-white text-[#2D3A4A] placeholder:text-[#2D3A4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8913A]/40 focus:border-[#E8913A] transition-colors'
  const labelClass = 'block text-base font-semibold text-[#2D3A4A] mb-2'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/devices')}
          className="p-2 rounded-xl hover:bg-[#E8913A]/10 text-[#2D3A4A] transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-bold text-[#2D3A4A]">
          {isEdit ? '编辑助听器' : '添加助听器'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>佩戴侧</label>
          <div className="flex gap-4">
            {(
              [
                ['left', '左耳', 'bg-blue-400'],
                ['right', '右耳', 'bg-rose-400'],
              ] as const
            ).map(([value, label, dotColor]) => (
              <label
                key={value}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 cursor-pointer transition-colors text-lg ${
                  side === value
                    ? 'border-[#E8913A] bg-[#E8913A]/5'
                    : 'border-indigo-100 bg-white hover:border-[#E8913A]/40'
                }`}
              >
                <input
                  type="radio"
                  name="side"
                  value={value}
                  checked={side === value}
                  onChange={() => setSide(value)}
                  className="sr-only"
                />
                <span className={`w-3 h-3 rounded-full ${dotColor}`} />
                <span className="font-semibold text-[#2D3A4A]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>型号</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="请输入助听器型号"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>电池类型</label>
          <select
            value={batteryType}
            onChange={(e) => setBatteryType(e.target.value as HearingAid['batteryType'])}
            className={inputClass}
          >
            {batteryOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>充电盒</label>
          <input
            type="text"
            value={chargingCase}
            onChange={(e) => setChargingCase(e.target.value)}
            placeholder="请输入充电盒型号"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>购买日期</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>保修电话</label>
          <input
            type="tel"
            value={warrantyPhone}
            onChange={(e) => setWarrantyPhone(e.target.value)}
            placeholder="请输入保修电话"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-[#E8913A] text-white py-4 rounded-xl text-lg font-bold hover:bg-[#d07e2e] transition-colors mt-4"
        >
          <Save size={20} />
          {isEdit ? '保存修改' : '添加助听器'}
        </button>
      </form>
    </div>
  )
}
