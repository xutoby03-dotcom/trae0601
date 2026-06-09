import { useNavigate } from 'react-router-dom'
import { useParkingStore, formatDaySlots } from '@/store/useParkingStore'
import { Clock, TrendingUp, Users, AlertTriangle, BarChart3, ArrowRight } from 'lucide-react'

export default function Stats() {
  const navigate = useNavigate()
  const { spots, applications, getSpotsByOwner, getTotalUsedHours, getSpotUtilizationRate, getTopBorrowers, getOvertimeCount, getOvertimeRecords, currentUserId } = useParkingStore()

  const totalUsedHours = getTotalUsedHours()
  const overtimeCount = getOvertimeCount()
  const topBorrowers = getTopBorrowers()
  const overtimeRecords = getOvertimeRecords()

  const mySpotIds = new Set(getSpotsByOwner(currentUserId).map((s) => s.id))

  const expiredActiveApps = applications.filter((a) => {
    if (a.status !== 'active' || !a.startTime || !mySpotIds.has(a.spotId)) return false
    const deadline = new Date(a.startTime).getTime() + a.estimatedHours * 3600000
    return Date.now() > deadline
  })

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-bold text-slate-800">统计概览</h1>
        <p className="text-sm text-slate-400 mt-1">车位使用数据一目了然</p>
      </div>

      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-amber-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-amber-200" />
              <span className="text-xs text-amber-100">总利用时长</span>
            </div>
            <p className="text-3xl font-bold">{totalUsedHours}</p>
            <p className="text-xs text-amber-100 mt-1">小时</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg shadow-red-200 relative">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-200" />
              <span className="text-xs text-red-100">超时次数</span>
            </div>
            <p className="text-3xl font-bold">{overtimeCount}</p>
            <p className="text-xs text-red-100 mt-1">次</p>
            {expiredActiveApps.length > 0 && (
              <button
                onClick={() => navigate(`/my-spots?highlight=${expiredActiveApps[0].id}`)}
                className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {expiredActiveApps.length}条待处理
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            车位利用率
          </h2>
          <div className="space-y-4">
            {spots.map((spot) => {
              const rate = getSpotUtilizationRate(spot.id)
              return (
                <div key={spot.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-700">{spot.building} {spot.spotNumber}</span>
                    <span className="text-xs text-slate-500">{rate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{formatDaySlots(spot.availableSlots)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            借用排行
          </h2>
          {topBorrowers.length > 0 ? (
            <div className="space-y-3">
              {topBorrowers.map((borrower, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-slate-100 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-700 flex-1">{borrower.name}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">{borrower.count}次</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">暂无借用记录</p>
          )}
        </div>
      </div>

      <div className="px-4 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            超时记录
          </h2>
          {overtimeRecords.length > 0 ? (
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-red-100" />
              {overtimeRecords.map((record) => (
                <div key={record.id} className="relative">
                  <div className="absolute -left-[14px] top-1 w-3 h-3 rounded-full bg-red-400 border-2 border-white" />
                  <div className="bg-red-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{record.spotInfo}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-xs text-red-600">超时使用 {record.usedHours} 小时</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">暂无超时记录</p>
          )}
        </div>
      </div>
    </div>
  )
}
