import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Hash, Square, Car, Clock, Phone, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useParkingStore, DAY_NAMES, VEHICLE_SIZE_LABELS } from '@/store/useParkingStore'
import type { VehicleSize, DaySlot } from '@/types'

export default function Register() {
  const navigate = useNavigate()
  const { addSpot } = useParkingStore()

  const [building, setBuilding] = useState('')
  const [spotNumber, setSpotNumber] = useState('')
  const [isWallAdjacent, setIsWallAdjacent] = useState(false)
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('any')
  const [contactPhone, setContactPhone] = useState('')
  const [slots, setSlots] = useState<DaySlot[]>([{ dayOfWeek: new Date().getDay(), startTime: '18:00', endTime: '23:00' }])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addSlot = () => {
    setSlots([...slots, { dayOfWeek: new Date().getDay(), startTime: '09:00', endTime: '22:00' }])
  }

  const removeSlot = (index: number) => {
    if (slots.length <= 1) return
    setSlots(slots.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, field: keyof DaySlot, value: string | number) => {
    const newSlots = [...slots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setSlots(newSlots)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!building.trim()) errs.building = '请输入楼栋号'
    if (!spotNumber.trim()) errs.spotNumber = '请输入车位号'
    if (!contactPhone.trim()) errs.contactPhone = '请输入联系方式'
    if (slots.length === 0) errs.slots = '请至少设置一个可用时段'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    addSpot({
      building: building.trim(),
      spotNumber: spotNumber.trim(),
      isWallAdjacent,
      vehicleSize,
      availableSlots: slots,
      contactPhone: contactPhone.trim(),
    })
    navigate('/my-spots')
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-bold text-slate-800">登记车位</h1>
        <p className="text-sm text-slate-400 mt-1">发布空闲车位，让邻居来借用</p>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                楼栋号
              </label>
              <input
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="例：3栋"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-shadow ${
                  errors.building ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-slate-50'
                }`}
              />
              {errors.building && <p className="text-xs text-red-500 mt-1">{errors.building}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                <Hash className="w-3.5 h-3.5" />
                车位号
              </label>
              <input
                value={spotNumber}
                onChange={(e) => setSpotNumber(e.target.value)}
                placeholder="例：B2-045"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-shadow ${
                  errors.spotNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-slate-50'
                }`}
              />
              {errors.spotNumber && <p className="text-xs text-red-500 mt-1">{errors.spotNumber}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                <Square className="w-3.5 h-3.5" />
                是否靠墙位
              </label>
              <button
                onClick={() => setIsWallAdjacent(!isWallAdjacent)}
                className={`w-11 h-6 rounded-full transition-colors relative ${isWallAdjacent ? 'bg-amber-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isWallAdjacent ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">车辆限制</h2>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Car className="w-3.5 h-3.5" />
            可停车型
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(VEHICLE_SIZE_LABELS) as [VehicleSize, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setVehicleSize(key)}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  vehicleSize === key
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              可用时段
            </h2>
            <button
              onClick={addSlot}
              className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
            >
              <Plus className="w-3.5 h-3.5" />
              添加
            </button>
          </div>

          {errors.slots && <p className="text-xs text-red-500 mb-2">{errors.slots}</p>}

          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={slot.dayOfWeek}
                    onChange={(e) => updateSlot(index, 'dayOfWeek', Number(e.target.value))}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-gray-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {DAY_NAMES.map((name, i) => (
                      <option key={i} value={i}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                  className="w-24 px-2 py-2 rounded-xl border border-gray-200 bg-slate-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <span className="text-slate-300 text-xs">至</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                  className="w-24 px-2 py-2 rounded-xl border border-gray-200 bg-slate-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                {slots.length > 1 && (
                  <button
                    onClick={() => removeSlot(index)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">联系方式</h2>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Phone className="w-3.5 h-3.5" />
            联系电话
          </label>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="例：138****6789"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-shadow ${
              errors.contactPhone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-slate-50'
            }`}
          />
          {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all active:scale-[0.98]"
        >
          发布车位
        </button>
      </div>
    </div>
  )
}
