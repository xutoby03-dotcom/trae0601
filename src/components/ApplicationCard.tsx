import { useState, useEffect } from 'react'
import { Check, X, Car, Battery, Package, Clock, User, AlertTriangle, Timer } from 'lucide-react'
import type { ParkingApplication } from '@/types'
import { STATUS_LABELS } from '@/store/useParkingStore'

interface ApplicationCardProps {
  application: ParkingApplication
  spotLabel: string
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onComplete?: (id: string, isOvertime: boolean, isWrongSpot: boolean) => void
  showActions?: boolean
  highlighted?: boolean
}

function useRemainingTime(startTime: string, estimatedHours: number) {
  const [remaining, setRemaining] = useState<number>(() => {
    if (!startTime) return Number.MAX_SAFE_INTEGER
    const deadline = new Date(startTime).getTime() + estimatedHours * 3600000
    return Math.ceil((deadline - Date.now()) / 60000)
  })

  useEffect(() => {
    if (!startTime) return
    const deadline = new Date(startTime).getTime() + estimatedHours * 3600000

    function calc() {
      setRemaining(Math.ceil((deadline - Date.now()) / 60000))
    }
    calc()
    const timer = setInterval(calc, 15000)
    return () => clearInterval(timer)
  }, [startTime, estimatedHours])

  return remaining
}

export default function ApplicationCard({
  application,
  spotLabel,
  onApprove,
  onReject,
  onComplete,
  showActions = false,
  highlighted = false,
}: ApplicationCardProps) {
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [isOvertime, setIsOvertime] = useState(false)
  const [isWrongSpot, setIsWrongSpot] = useState(false)

  const remaining = useRemainingTime(
    application.status === 'active' && application.startTime ? application.startTime : '',
    application.estimatedHours
  )

  const isActiveWithTimer = application.status === 'active' && !!application.startTime
  const isExpired = remaining <= 0 && isActiveWithTimer
  const isNearExpiry = remaining > 0 && remaining <= 30 && isActiveWithTimer

  const statusColor: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    active: 'bg-amber-100 text-amber-700',
    completed: 'bg-slate-100 text-slate-600',
  }

  const handleComplete = () => {
    onComplete?.(application.id, isOvertime, isWrongSpot)
    setIsOvertime(false)
    setIsWrongSpot(false)
    setShowCompleteModal(false)
  }

  const formatRemaining = (mins: number) => {
    if (mins <= 0) return '已超时'
    if (mins < 60) return `剩余 ${mins} 分钟`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `剩余 ${h}小时${m > 0 ? m + '分钟' : ''}`
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl p-4 shadow-sm border transition-all duration-300 ${
          highlighted
            ? 'border-amber-400 ring-2 ring-amber-200'
            : isExpired
              ? 'border-red-200'
              : isNearExpiry
                ? 'border-orange-200'
                : 'border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{application.applicantName}</p>
              <p className="text-xs text-slate-400">{spotLabel}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[application.status]}`}>
            {STATUS_LABELS[application.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            <span>{application.licensePlate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{application.estimatedHours}小时</span>
          </div>
          {application.isEV && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Battery className="w-3.5 h-3.5" />
              <span>新能源</span>
            </div>
          )}
          {application.hasLargeItems && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600">
              <Package className="w-3.5 h-3.5" />
              <span>大件搬运</span>
            </div>
          )}
        </div>

        {application.status === 'active' && application.startTime && (
          <div className={`mb-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
            isExpired
              ? 'bg-red-50 text-red-600 animate-pulse'
              : isNearExpiry
                ? 'bg-orange-50 text-orange-600'
                : 'bg-emerald-50 text-emerald-600'
          }`}>
            {isExpired ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Timer className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{formatRemaining(remaining)}</span>
            {isExpired && <span className="ml-auto text-xs">请尽快处理</span>}
            {isNearExpiry && <span className="ml-auto text-xs">即将到期</span>}
          </div>
        )}

        {showActions && application.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onReject?.(application.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <X className="w-4 h-4" />
              拒绝
            </button>
            <button
              onClick={() => onApprove?.(application.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              <Check className="w-4 h-4" />
              同意
            </button>
          </div>
        )}

        {showActions && application.status === 'active' && (
          <button
            onClick={() => setShowCompleteModal(true)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              isExpired
                ? 'bg-red-500 text-white hover:bg-red-600'
                : isNearExpiry
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            标记已离开
          </button>
        )}

        {application.status === 'completed' && (application.isOvertime || application.isWrongSpot) && (
          <div className="flex gap-2 mt-2">
            {application.isOvertime && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">超时</span>
            )}
            {application.isWrongSpot && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">占错位</span>
            )}
          </div>
        )}
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCompleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">停车结束确认</h3>
            <div className="space-y-4 mb-6">
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-600">是否超时？</span>
                <button
                  onClick={() => setIsOvertime(!isOvertime)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${isOvertime ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isOvertime ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-600">是否占错位？</span>
                <button
                  onClick={() => setIsWrongSpot(!isWrongSpot)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${isWrongSpot ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isWrongSpot ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
