import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Luggage, Users, Check, AlertCircle } from 'lucide-react'
import { useRouteStore } from '@/stores/useRouteStore'
import { useReservationStore } from '@/stores/useReservationStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function Reserve() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getRouteById = useRouteStore((s) => s.getRouteById)
  const addReservation = useReservationStore((s) => s.addReservation)
  const getRemainingSeats = useReservationStore((s) => s.getRemainingSeats)
  const getCurrentEmployee = useEmployeeStore((s) => s.getCurrentEmployee)
  const isEmployeeBanned = useEmployeeStore((s) => s.isEmployeeBanned)

  const [selectedStop, setSelectedStop] = useState<string | null>(null)
  const [hasLuggage, setHasLuggage] = useState(false)
  const [companions, setCompanions] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  const route = getRouteById(id!)
  const currentEmployee = getCurrentEmployee()
  const banned = currentEmployee ? isEmployeeBanned(currentEmployee.id) : false
  const remainingSeats = route ? getRemainingSeats(id!, route.totalSeats) : 0
  const isFull = remainingSeats <= 0

  if (!route || !currentEmployee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">路线不存在</p>
      </div>
    )
  }

  function handleSubmit() {
    if (!selectedStop || banned) return
    const stop = route.stops.find((s) => s.id === selectedStop)
    if (!stop) return

    addReservation({
      routeId: route.id,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      boardingStop: stop.name,
      hasLuggage,
      companions,
      isWaitlisted: isFull,
      waitlistPosition: 0,
    })

    navigate(`/route/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">预约座位</h1>
        </div>
        <p className="text-sm text-white/70 ml-8">{route.name} · {route.departureTime}</p>
      </div>

      {banned && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">
            您当前已被禁止预约，解禁日期: {currentEmployee.banEndDate}
          </p>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#ff6b35]" />
            选择上车站点
          </h3>
          <div className="relative pl-6">
            {route.stops.map((stop, idx) => {
              const isFirst = idx === 0
              const isLast = idx === route.stops.length - 1
              const isSelected = selectedStop === stop.id
              return (
                <div
                  key={stop.id}
                  className="relative pb-6 last:pb-0 cursor-pointer"
                  onClick={() => setSelectedStop(stop.id)}
                >
                  {!isLast && (
                    <div className="absolute left-[-18px] top-[22px] w-0.5 h-full bg-[#1e3a5f]/20" />
                  )}
                  <div
                    className={cn(
                      "absolute left-[-22px] top-[6px] w-3 h-3 rounded-full border-2 transition-all",
                      isSelected
                        ? "bg-[#ff6b35] border-[#ff6b35] scale-125"
                        : isFirst || isLast
                          ? "bg-[#1e3a5f]/30 border-[#1e3a5f]/30"
                          : "bg-white border-[#1e3a5f]/40"
                    )}
                  />
                  {isSelected && (
                    <Check className="absolute left-[-21px] top-[5px] w-3.5 h-3.5 text-white" />
                  )}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm transition-colors",
                      isSelected ? "font-semibold text-[#ff6b35]" : (isFirst || isLast) ? "font-medium text-[#1e3a5f]" : "text-gray-700"
                    )}>
                      {stop.name}
                    </span>
                    <span className="text-xs text-gray-400">{stop.estimatedTime}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Luggage className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-sm font-medium text-gray-700">是否带行李</span>
            </div>
            <button
              onClick={() => setHasLuggage(!hasLuggage)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                hasLuggage ? "bg-[#ff6b35]" : "bg-gray-200"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  hasLuggage ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-sm font-medium text-gray-700">同行人数</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCompanions(Math.max(0, companions - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-lg"
              >
                −
              </button>
              <span className="text-sm font-semibold text-[#1e3a5f] w-6 text-center">{companions}</span>
              <button
                onClick={() => setCompanions(Math.min(3, companions + 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {isFull && !banned && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 font-medium">座位已满</p>
              <p className="text-xs text-gray-500 mt-0.5">提交后将加入候补列表，有座位空出时自动顺延</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          disabled={!selectedStop || banned}
          className={cn(
            "w-full py-3 rounded-xl font-semibold text-sm transition-all",
            !selectedStop || banned
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#ff6b35] text-white active:scale-[0.98]"
          )}
        >
          {!selectedStop ? '请选择上车站点' : isFull ? '加入候补' : '确认预约'}
        </button>
      </div>

      {showConfirm && selectedStop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">确认预约信息</h3>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">路线</span>
                <span className="text-gray-800">{route.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">上车站点</span>
                <span className="text-gray-800">{route.stops.find((s) => s.id === selectedStop)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">行李</span>
                <span className="text-gray-800">{hasLuggage ? '有' : '无'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">同行人数</span>
                <span className="text-gray-800">{companions}人</span>
              </div>
              {isFull && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">状态</span>
                  <span className="text-[#ff6b35] font-medium">候补</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
              >
                返回修改
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#ff6b35] text-white text-sm font-medium"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
