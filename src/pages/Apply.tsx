import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Car, Clock, Battery, Package, Shield, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useParkingStore, VEHICLE_SIZE_LABELS, formatDaySlots } from '@/store/useParkingStore'

const SAFETY_NOTICES = [
  '严禁占用消防通道，消防通道是生命通道',
  '车牌号必须如实填写，信息不符将被拒绝',
  '请按照约定时间归还车位，超时将影响信用',
  '停车时请确认车位编号，避免占错车位',
  '如有大件搬运需求，请提前与车主沟通',
]

export default function Apply() {
  const { spotId } = useParams<{ spotId: string }>()
  const navigate = useNavigate()
  const { getSpotById, addApplication } = useParkingStore()

  const spot = getSpotById(spotId || '')

  const [licensePlate, setLicensePlate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState(2)
  const [isEV, setIsEV] = useState(false)
  const [hasLargeItems, setHasLargeItems] = useState(false)
  const [agreedSafety, setAgreedSafety] = useState(false)
  const [showSafetyModal, setShowSafetyModal] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!spot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">车位不存在</p>
      </div>
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!licensePlate.trim()) errs.licensePlate = '请输入车牌号'
    if (!agreedSafety) errs.safety = '请阅读并同意安全须知'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    addApplication({
      spotId: spot.id,
      applicantId: 'user-current',
      applicantName: '我',
      licensePlate: licensePlate.trim(),
      estimatedHours,
      isEV,
      hasLargeItems,
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-amber-600 mb-3">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-800">临停申请</h1>
        <p className="text-sm text-slate-400 mt-1">申请使用该车位</p>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{spot.building} {spot.spotNumber}</h3>
              <p className="text-xs text-slate-500">{spot.ownerName} · {VEHICLE_SIZE_LABELS[spot.vehicleSize]}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {spot.isWallAdjacent && (
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">靠墙位</span>
            )}
            <span className="bg-white/60 text-slate-600 px-2 py-0.5 rounded-full">{formatDaySlots(spot.availableSlots)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">申请信息</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                <Car className="w-3.5 h-3.5" />
                车牌号
              </label>
              <input
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="例：粤A·12345"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                  errors.licensePlate ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-slate-50'
                }`}
              />
              {errors.licensePlate && <p className="text-xs text-red-500 mt-1">{errors.licensePlate}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <Clock className="w-3.5 h-3.5" />
                预计停车时长：{estimatedHours}小时
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-300 mt-1">
                <span>1小时</span>
                <span>6小时</span>
                <span>12小时</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                <Battery className="w-3.5 h-3.5" />
                新能源车
              </label>
              <button
                onClick={() => setIsEV(!isEV)}
                className={`w-11 h-6 rounded-full transition-colors relative ${isEV ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isEV ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                <Package className="w-3.5 h-3.5" />
                有大件搬运需求
              </label>
              <button
                onClick={() => setHasLargeItems(!hasLargeItems)}
                className={`w-11 h-6 rounded-full transition-colors relative ${hasLargeItems ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${hasLargeItems ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              安全须知
            </h2>
            <button
              onClick={() => setShowSafetyModal(true)}
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              查看详情
            </button>
          </div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedSafety}
              onChange={(e) => setAgreedSafety(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs text-slate-500 leading-relaxed">
              我已阅读并同意安全须知，承诺不占用消防通道，如实填写车牌信息，按时归还车位
            </span>
          </label>
          {errors.safety && <p className="text-xs text-red-500 mt-2">{errors.safety}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all active:scale-[0.98]"
        >
          提交申请
        </button>
      </div>

      {showSafetyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowSafetyModal(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-800">安全须知</h3>
            </div>
            <div className="space-y-3 mb-6">
              {SAFETY_NOTICES.map((notice, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-700">{notice}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setAgreedSafety(true); setShowSafetyModal(false) }}
              className="w-full py-3 rounded-2xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              我已知晓并同意
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
