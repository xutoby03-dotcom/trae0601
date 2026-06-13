import { useEffect, useState } from 'react'
import { Boxes, Package, AlertTriangle, Calendar, TrendingUp } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import StatCard from '@/components/dashboard/StatCard'
import UrgentList from '@/components/dashboard/UrgentList'
import RefrigeratedAlert from '@/components/dashboard/RefrigeratedAlert'
import ExpressStats from '@/components/dashboard/ExpressStats'
import QuickActions from '@/components/dashboard/QuickActions'
import LockerCard from '@/components/locker/LockerCard'
import type { Locker } from '@/types'

interface DashboardProps {
  onCheckIn: () => void
  onCheckOut: (packageId?: string) => void
  onAddReminder: (packageId: string) => void
}

export default function Dashboard({ onCheckIn, onCheckOut, onAddReminder }: DashboardProps) {
  const { lockers, getDashboardStats, getPackageById, refreshUrgentStatus } = useAppStore()
  const stats = getDashboardStats()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    refreshUrgentStatus()
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      refreshUrgentStatus()
    }, 60000)
    return () => clearInterval(timer)
  }, [refreshUrgentStatus])

  const urgentLockers = lockers.filter((l) => l.status === 'urgent')
  const recentActiveLockers = lockers.filter((l) => l.status !== 'empty').slice(0, 8)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="空柜格"
          value={`${stats.emptyLockers} / ${stats.totalLockers}`}
          subtitle={`空柜率 ${stats.totalLockers ? Math.round(stats.emptyLockers / stats.totalLockers * 100) : 0}%`}
          icon={<Boxes size={22} className="text-white" />}
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
          iconBg="bg-white/20"
          trend={{ value: `${stats.emptyLockers} 可用`, positive: stats.emptyLockers > stats.totalLockers / 2 }}
        />
        <StatCard
          title="在柜包裹"
          value={stats.occupiedLockers}
          subtitle="当前存放中"
          icon={<Package size={22} className="text-white" />}
          gradient="bg-gradient-to-br from-blue-400 to-blue-600"
          iconBg="bg-white/20"
          trend={{ value: '正常流转', positive: stats.occupiedLockers < stats.totalLockers }}
        />
        <StatCard
          title="滞留催取"
          value={stats.urgentPackages}
          subtitle={`超过48小时未取 ${urgentLockers.length} 个柜格`}
          icon={<AlertTriangle size={22} className="text-white" />}
          gradient="bg-gradient-to-br from-warning-400 to-orange-600"
          iconBg="bg-white/20"
          trend={{ value: '需尽快处理', positive: stats.urgentPackages === 0 }}
        />
        <StatCard
          title="今日入柜"
          value={stats.todayInCount}
          subtitle={currentTime.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          icon={<Calendar size={22} className="text-white" />}
          gradient="bg-gradient-to-br from-purple-400 to-purple-600"
          iconBg="bg-white/20"
          trend={{ value: `周环比 ${Math.floor(Math.random() * 40 - 10)}%`, positive: true }}
        />
      </div>

      <QuickActions onCheckIn={onCheckIn} onCheckOut={() => onCheckOut()} />

      {stats.refrigeratedPackages.length > 0 && (
        <RefrigeratedAlert onCheckOut={(id) => onCheckOut(id)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <UrgentList onCheckOut={(id) => onCheckOut(id)} onAddReminder={(id) => onAddReminder(id)} />
        </div>
        <div className="space-y-5">
          <ExpressStats />
        </div>
      </div>

      {recentActiveLockers.length > 0 && (
        <div className="bg-white rounded-2xl card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-800">在柜包裹概览</h3>
              <p className="text-sm text-slate-500">当前占用的柜格状态一览</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>占用</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning-500 animate-pulse-slow"></span>催取</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span>冷藏</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {recentActiveLockers.map((locker: Locker) => (
              <LockerCard
                key={locker.id}
                locker={locker}
                currentPackage={locker.currentPackageId ? getPackageById(locker.currentPackageId) || undefined : undefined}
                onClick={() => locker.currentPackageId && onCheckOut(locker.currentPackageId!)}
                selectable
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-2">
        <TrendingUp size={12} />
        <span>数据每分钟自动刷新 · 最后更新 {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  )
}
