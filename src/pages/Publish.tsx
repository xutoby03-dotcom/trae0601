import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarpoolStore } from '@/store/useCarpoolStore'
import { ArrowLeft, MapPin, Navigation, Clock, Users, DollarSign, Luggage, Phone, Eye } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import SeatIndicator from '@/components/SeatIndicator'
import { formatFullDate } from '@/utils/time'
import { formatCurrency, calculateCostPerPerson } from '@/utils/cost'

export default function Publish() {
  const navigate = useNavigate()
  const { addCarpool, currentUserId, currentUserName } = useCarpoolStore()

  const [form, setForm] = useState({
    departure: '',
    destination: '',
    departureTime: '',
    totalSeats: 4,
    totalCost: 100,
    allowLuggage: true,
    contact: '',
  })

  const passengerCount = 1
  const perPerson = calculateCostPerPerson(form.totalCost, passengerCount)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.departure || !form.destination || !form.departureTime) return
    const id = addCarpool({
      departure: form.departure,
      destination: form.destination,
      departureTime: new Date(form.departureTime).toISOString(),
      totalSeats: form.totalSeats,
      totalCost: form.totalCost,
      allowLuggage: form.allowLuggage,
      contact: form.contact,
      publisherId: currentUserId,
      publisherName: currentUserName,
    })
    navigate(`/carpool/${id}`)
  }

  const updateField = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-300 transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">发布拼车</h1>
          <p className="text-xs text-slate-400">填写信息，寻找同行邻居</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            路线信息
          </h3>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">出发地</label>
            <input
              type="text"
              required
              value={form.departure}
              onChange={(e) => updateField('departure', e.target.value)}
              placeholder="如：阳光花园3号门"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">目的地</label>
            <input
              type="text"
              required
              value={form.destination}
              onChange={(e) => updateField('destination', e.target.value)}
              placeholder="如：浦东国际机场"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            时间与座位
          </h3>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">出发时间</label>
            <input
              type="datetime-local"
              required
              value={form.departureTime}
              onChange={(e) => updateField('departureTime', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              座位数: <span className="text-orange-600 font-bold">{form.totalSeats}</span>
            </label>
            <input
              type="range"
              min="2"
              max="7"
              value={form.totalSeats}
              onChange={(e) => updateField('totalSeats', Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>2座</span>
              <span>7座</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-500" />
            费用信息
          </h3>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">总费用 (元)</label>
            <input
              type="number"
              min="0"
              required
              value={form.totalCost}
              onChange={(e) => updateField('totalCost', Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">预估每人</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(perPerson)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
            <Luggage className="w-4 h-4 text-orange-500" />
            其他信息
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">允许带行李</span>
            <button
              type="button"
              onClick={() => updateField('allowLuggage', !form.allowLuggage)}
              className={`w-11 h-6 rounded-full transition-all relative ${
                form.allowLuggage ? 'bg-orange-500' : 'bg-slate-200'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                form.allowLuggage ? 'left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">联系方式</label>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => updateField('contact', e.target.value)}
              placeholder="如：微信 xxx 或 电话 138****5678"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 active:scale-[0.98] transition-all"
        >
          发布拼车
        </button>
      </form>

      {form.departure && form.destination && (
        <div className="bg-white rounded-2xl border border-orange-100 p-4">
          <h4 className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
            <Eye className="w-3.5 h-3.5" />
            预览效果
          </h4>
          <div className="border-l-4 border-emerald-400 pl-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-800">{form.destination}</span>
              <StatusBadge status="recruiting" />
            </div>
            <p className="text-xs text-slate-400">{form.departure}</p>
            {form.departureTime && (
              <p className="text-sm font-semibold text-orange-600 mt-1">
                {formatFullDate(new Date(form.departureTime).toISOString())}
              </p>
            )}
            <div className="mt-2">
              <SeatIndicator total={form.totalSeats} taken={1} />
            </div>
            <p className="text-sm font-semibold text-orange-600 mt-2">{formatCurrency(perPerson)}/人</p>
          </div>
        </div>
      )}
    </div>
  )
}
