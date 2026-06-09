import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Users, Luggage, User, Clock, AlertTriangle, X } from 'lucide-react'
import { useRouteStore } from '@/stores/useRouteStore'
import { useReservationStore } from '@/stores/useReservationStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { cn } from '@/lib/utils'

export default function RouteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getRouteById = useRouteStore((s) => s.getRouteById)
  const getReservationsByRoute = useReservationStore((s) => s.getReservationsByRoute)
  const getWaitlistByRoute = useReservationStore((s) => s.getWaitlistByRoute)
  const getConfirmedByRoute = useReservationStore((s) => s.getConfirmedByRoute)
  const getRemainingSeats = useReservationStore((s) => s.getRemainingSeats)
  const getOccupiedSeats = useReservationStore((s) => s.getOccupiedSeats)
  const cancelReservation = useReservationStore((s) => s.cancelReservation)
  const getCurrentEmployee = useEmployeeStore((s) => s.getCurrentEmployee)
  const addCreditRecord = useEmployeeStore((s) => s.addCreditRecord)

  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const route = getRouteById(id!)
  const currentEmployee = getCurrentEmployee()
  const allReservations = getReservationsByRoute(id!)
  const confirmed = getConfirmedByRoute(id!)
  const waitlist = getWaitlistByRoute(id!)
  const remainingSeats = route ? getRemainingSeats(id!, route.totalSeats) : 0

  const myReservation = allReservations.find(
    (r) => r.employeeId === currentEmployee?.id && r.status !== 'cancelled'
  )

  if (!route || !currentEmployee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">路线不存在</p>
      </div>
    )
  }

  const occupancyRate = route.totalSeats > 0 ? getOccupiedSeats(route.id) / route.totalSeats : 0

  function getMinutesBeforeDeparture(): number {
    const today = new Date()
    const [h, m] = route.departureTime.split(':').map(Number)
    const departure = new Date(today)
    departure.setHours(h, m, 0, 0)
    return Math.floor((departure.getTime() - Date.now()) / 60000)
  }

  function handleCancel() {
    if (!myReservation) return
    const minutes = getMinutesBeforeDeparture()
    const result = cancelReservation(myReservation.id, minutes, route.totalSeats)
    if (result.creditCost > 0) {
      const type = result.type === 'no_show' ? 'no_show' : 'late_cancel'
      const reason = result.type === 'no_show' ? '爽约未上车' : '发车前30分钟内取消'
      addCreditRecord(currentEmployee.id, type, route.id, reason, result.creditCost)
    }
    setShowCancelDialog(false)
  }

  function getCancelCostText() {
    const minutes = getMinutesBeforeDeparture()
    if (minutes >= 30) return '免费取消'
    if (minutes > 0) return '将扣除 1 信用分（发车前30分钟内取消）'
    return '将扣除 3 信用分（爽约未上车）'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">{route.name}</h1>
          {route.isDelayed && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">延误</span>
          )}
          {route.isTemporary && (
            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">临时</span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ff6b35]" />
            <span>发车时间: {route.departureTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-[#ff6b35]">→</span>
            <span>{route.departure} → {route.destination}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#ff6b35]" />
            <span>司机电话: {route.driverPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ff6b35]" />
            <span>总座位: {route.totalSeats}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">座位情况</span>
            <span className="text-sm text-gray-500">
              剩余 <span className={cn("font-semibold", remainingSeats <= 5 ? "text-red-500" : "text-[#1e3a5f]")}>{remainingSeats}</span> / {route.totalSeats}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                occupancyRate >= 0.9 ? "bg-red-500" : occupancyRate >= 0.7 ? "bg-yellow-500" : "bg-[#1e3a5f]"
              )}
              style={{ width: `${Math.min(occupancyRate * 100, 100)}%` }}
            />
          </div>
        </div>

        {waitlist.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              候补列表 ({waitlist.length}人)
            </h3>
            <div className="space-y-2">
              {waitlist.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-1.5 px-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#ff6b35]" />
                    <span className="text-sm">{w.employeeName}</span>
                  </div>
                  <span className="text-xs text-[#ff6b35]">第{w.waitlistPosition}位</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">途经站点</h3>
          <div className="relative pl-6">
            {route.stops.map((stop, idx) => {
              const isFirst = idx === 0
              const isLast = idx === route.stops.length - 1
              return (
                <div key={stop.id} className="relative pb-6 last:pb-0">
                  {!isLast && (
                    <div className="absolute left-[-18px] top-[22px] w-0.5 h-full bg-[#1e3a5f]/20" />
                  )}
                  <div
                    className={cn(
                      "absolute left-[-22px] top-[6px] w-3 h-3 rounded-full border-2",
                      isFirst || isLast
                        ? "bg-[#ff6b35] border-[#ff6b35]"
                        : "bg-white border-[#1e3a5f]"
                    )}
                  />
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm", (isFirst || isLast) && "font-semibold text-[#1e3a5f]")}>
                      {stop.name}
                    </span>
                    <span className="text-xs text-gray-400">{stop.estimatedTime}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            已预约 ({confirmed.length}人)
          </h3>
          {confirmed.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">暂无预约</p>
          ) : (
            <div className="space-y-2">
              {confirmed.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#1e3a5f]" />
                    <span className="text-sm">{r.employeeName}</span>
                    {r.hasLuggage && <Luggage className="w-3.5 h-3.5 text-[#ff6b35]" />}
                    {r.companions > 0 && (
                      <span className="text-xs bg-[#1e3a5f]/10 text-[#1e3a5f] px-1.5 py-0.5 rounded">
                        +{r.companions}人
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{r.boardingStop}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pb-6">
          {!myReservation ? (
            <button
              onClick={() => navigate(`/route/${id}/reserve`)}
              className="w-full bg-[#ff6b35] text-white py-3 rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              预约座位
            </button>
          ) : (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="w-full bg-white border border-red-300 text-red-500 py-3 rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              取消预约
            </button>
          )}
        </div>
      </div>

      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">确认取消预约</h3>
              <button onClick={() => setShowCancelDialog(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{getCancelCostText()}</p>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              当前信用分: <span className="font-semibold text-[#1e3a5f]">{currentEmployee.creditScore}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
              >
                再想想
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
