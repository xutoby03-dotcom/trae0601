import { useStore } from '@/store/useStore'
import { PROXIMITY_LABELS } from '@/types'
import { AlertTriangle, Clock, Wallet, MapPin, Gift, ChevronRight, ShoppingBag } from 'lucide-react'

const today = new Date().toISOString().slice(0, 10)

const alertConfig = {
  duplicate: { icon: AlertTriangle, border: 'border-amber-400', bg: 'bg-amber-50' },
  shelf_life: { icon: Clock, border: 'border-orange-400', bg: 'bg-orange-50' },
  budget: { icon: Wallet, border: 'border-red-400', bg: 'bg-red-50' },
}

export default function Home() {
  const { relatives, gifts, visits, visitGifts, getAlerts } = useStore()

  const todayVisits = visits.filter((v) => v.visitDate === today)
  const upcomingVisits = visits
    .filter((v) => v.visitDate >= today && v.status === 'pending')
    .sort((a, b) => a.visitDate.localeCompare(b.visitDate))
  const alerts = getAlerts()

  const getRelative = (id: string) => relatives.find((r) => r.id === id)
  const getGift = (id: string) => gifts.find((g) => g.id === id)
  const getVisitGifts = (visitId: string) => visitGifts.filter((vg) => vg.visitId === visitId)

  return (
    <div className="min-h-screen bg-[#FFFBEB] relative overflow-hidden">
      <div className="absolute top-2 left-6 w-6 h-8 rounded-b-full bg-red-600 shadow-lg opacity-30 animate-pulse" />
      <div className="absolute top-2 right-6 w-6 h-8 rounded-b-full bg-red-600 shadow-lg opacity-30 animate-pulse delay-500" />
      <div className="absolute top-2 left-14 w-0.5 h-4 bg-red-400 opacity-20" />
      <div className="absolute top-2 right-14 w-0.5 h-4 bg-red-400 opacity-20" />

      <div className="px-4 pt-6 pb-20 max-w-lg mx-auto space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-red-700 tracking-wide">🧧 拜年送礼助手</h1>
          <p className="text-sm text-amber-700/70 mt-1">新春快乐 · 万事如意</p>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-red-600" />
            <h2 className="text-lg font-bold text-red-700">今日拜访</h2>
            {todayVisits.length > 0 && (
              <span className="ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                {todayVisits.length}家
              </span>
            )}
          </div>
          {todayVisits.length === 0 ? (
            <div className="bg-white/60 rounded-xl p-6 text-center text-amber-700/60 text-sm">
              今日暂无拜访安排 🏠
            </div>
          ) : (
            <div className="space-y-3">
              {todayVisits.map((visit) => {
                const rel = getRelative(visit.relativeId)
                if (!rel) return null
                const vGifts = getVisitGifts(visit.id)
                return (
                  <div
                    key={visit.id}
                    className="rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-red-600 to-red-700"
                  >
                    <div className="p-4 text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{rel.title}</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          {PROXIMITY_LABELS[rel.proximity]}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {rel.address}
                      </p>
                    </div>
                    <div className="bg-white/95 p-3 space-y-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Gift className="w-3 h-3" />
                        礼品清单
                      </div>
                      {vGifts.length === 0 ? (
                        <p className="text-xs text-gray-400">暂无礼品</p>
                      ) : (
                        vGifts.map((vg) => {
                          const gift = getGift(vg.giftId)
                          if (!gift) return null
                          const unpurchased = !gift.purchased
                          return (
                            <div
                              key={vg.id}
                              className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-lg ${
                                unpurchased ? 'bg-red-50' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ShoppingBag className={`w-3.5 h-3.5 ${unpurchased ? 'text-red-500' : 'text-gray-400'}`} />
                                <span className={unpurchased ? 'text-red-600 font-medium' : 'text-gray-700'}>
                                  {gift.name}
                                </span>
                                <span className="text-xs text-gray-400">×{vg.quantity}</span>
                              </div>
                              {unpurchased && (
                                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                                  未购买
                                </span>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-lg font-bold text-amber-700">智能提醒</h2>
            {alerts.length > 0 && (
              <span className="relative flex h-2.5 w-2.5 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            )}
          </div>
          {alerts.length === 0 ? (
            <div className="bg-white/60 rounded-xl p-4 text-center text-amber-700/60 text-sm">
              暂无提醒 ✨
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => {
                const config = alertConfig[alert.type]
                const Icon = config.icon
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${config.border} ${config.bg} shadow-sm`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                    <p className="text-sm text-amber-900 leading-relaxed">{alert.message}</p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-700">拜访路线总览</h2>
          </div>
          {upcomingVisits.length === 0 ? (
            <div className="bg-white/60 rounded-xl p-4 text-center text-amber-700/60 text-sm">
              暂无待拜访安排
            </div>
          ) : (
            <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <div className="flex items-start gap-0 min-w-max">
                {upcomingVisits.map((visit, idx) => {
                  const rel = getRelative(visit.relativeId)
                  const isToday = visit.visitDate === today
                  const dateLabel = visit.visitDate.slice(5).replace('-', '/')
                  return (
                    <div key={visit.id} className="flex items-start">
                      <div className="flex flex-col items-center w-20">
                        <div className="relative">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              isToday
                                ? 'bg-red-600 border-red-600 shadow-md shadow-red-200'
                                : 'bg-amber-100 border-amber-300'
                            }`}
                          >
                            {isToday && (
                              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-red-600 font-bold whitespace-nowrap">
                                今天
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-0.5 h-3 bg-amber-200" />
                        <span className={`text-[11px] font-medium ${isToday ? 'text-red-600' : 'text-amber-700'}`}>
                          {dateLabel}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5 text-center leading-tight">
                          {rel?.title ?? '—'}
                        </span>
                      </div>
                      {idx < upcomingVisits.length - 1 && (
                        <div className="w-6 h-0.5 bg-amber-200 mt-2 self-start" />
                      )}
                    </div>
                  )
                })}
                <div className="flex items-center ml-1 mt-0.5">
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
