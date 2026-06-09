import { useMemo } from 'react'
import Navbar from '@/components/Navbar'
import { useStatsStore } from '@/stores/useStatsStore'
import { useRouteStore } from '@/stores/useRouteStore'
import { formatPace } from '@/utils/helpers'
import { BarChart3, Route, Users, Flame } from 'lucide-react'

export default function Stats() {
  const getMonthlyStats = useStatsStore(s => s.getMonthlyStats)
  const { routes } = useRouteStore()

  const stats = useMemo(() => getMonthlyStats(), [getMonthlyStats])

  const now = new Date()
  const monthYear = `${now.getFullYear()}年${now.getMonth() + 1}月`

  const maxWeekly = Math.max(...stats.weeklyDistances, 1)
  const maxRouteCount = stats.routeRanking.length > 0 ? stats.routeRanking[0].count : 1

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-[#0B1120] text-white pb-20">
      <header className="px-5 pt-14 pb-4">
        <p className="text-sm text-[#00FF88]/70 font-medium">{monthYear}</p>
        <h1 className="text-2xl font-bold mt-1 tracking-tight">本月统计</h1>
      </header>

      <section className="px-5 grid grid-cols-3 gap-3">
        <div className="relative rounded-2xl bg-white/5 border border-[#00FF88]/10 p-4 overflow-hidden shadow-[0_0_16px_rgba(0,255,136,0.08)]">
          <div className="absolute top-2 right-2">
            <Flame size={14} className="text-[#00FF88]/40" />
          </div>
          <p className="text-[10px] text-gray-400 mb-2">总里程</p>
          <p className="text-2xl font-bold text-[#00FF88] leading-none">
            {stats.totalDistance}
            <span className="text-xs font-normal text-[#00FF88]/60 ml-0.5">km</span>
          </p>
        </div>

        <div className="relative rounded-2xl bg-white/5 border border-[#00FF88]/10 p-4 overflow-hidden shadow-[0_0_16px_rgba(0,255,136,0.08)]">
          <div className="absolute top-2 right-2">
            <Route size={14} className="text-[#00FF88]/40" />
          </div>
          <p className="text-[10px] text-gray-400 mb-2">跑步次数</p>
          <p className="text-2xl font-bold text-[#00FF88] leading-none">
            {stats.totalRuns}
            <span className="text-xs font-normal text-[#00FF88]/60 ml-0.5">次</span>
          </p>
        </div>

        <div className="relative rounded-2xl bg-white/5 border border-[#00FF88]/10 p-4 overflow-hidden shadow-[0_0_16px_rgba(0,255,136,0.08)]">
          <div className="absolute top-2 right-2">
            <BarChart3 size={14} className="text-[#00FF88]/40" />
          </div>
          <p className="text-[10px] text-gray-400 mb-2">平均配速</p>
          <p className="text-2xl font-bold text-[#00FF88] leading-none">
            {stats.averagePace > 0 ? formatPace(stats.averagePace) : "--'"}
            <span className="text-xs font-normal text-[#00FF88]/60 ml-0.5">/km</span>
          </p>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-[#00FF88]" />
          周里程分布
        </h2>
        <div className="rounded-2xl bg-white/5 border border-white/5 p-5">
          <div className="flex items-end justify-around gap-3" style={{ height: 150 }}>
            {stats.weeklyDistances.map((dist, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2">
                <span className="text-xs text-gray-400">{dist > 0 ? dist.toFixed(1) : 0}</span>
                <div className="w-full flex justify-center" style={{ height: 120 }}>
                  <div
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-[#00FF88]/80 to-[#00FF88] shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                    style={{ height: `${(dist / maxWeekly) * 100}%`, marginTop: 'auto' }}
                  />
                </div>
                <span className="text-[11px] text-gray-500">第{i + 1}周</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Route size={16} className="text-[#00FF88]" />
          路线排行
        </h2>
        <div className="rounded-2xl bg-white/5 border border-white/5 p-5 space-y-3">
          {stats.routeRanking.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">暂无数据</p>
          )}
          {stats.routeRanking.map((item) => {
            const route = routes.find(r => r.id === item.routeId)
            const barColor = route?.color || '#00FF88'
            return (
              <div key={item.routeId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.count}次</span>
                </div>
                <div className="h-5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / maxRouteCount) * 100}%`,
                      background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                      boxShadow: `0 0 10px ${barColor}44`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-6 px-5 pb-4">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Users size={16} className="text-[#00FF88]" />
          稳定伙伴
        </h2>
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-2">
          {stats.partnerRanking.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">暂无数据</p>
          )}
          {stats.partnerRanking.map((partner, i) => (
            <div
              key={partner.runnerId}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <span className="w-6 text-center text-sm">
                {i < 3 ? medals[i] : <span className="text-gray-600 text-xs">{i + 1}</span>}
              </span>
              <span className="text-xl">{partner.avatar}</span>
              <span className="flex-1 text-sm text-gray-300">{partner.nickname}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 shadow-[0_0_6px_rgba(0,255,136,0.15)]">
                {partner.attendCount}次
              </span>
            </div>
          ))}
        </div>
      </section>

      <Navbar />
    </div>
  )
}
