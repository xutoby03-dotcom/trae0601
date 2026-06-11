import { useStore } from '@/store/useStore'
import { getLevelLabel, getStatusZone } from '@/utils/degradation'
import { Battery, AlertTriangle, AlertCircle, CheckCircle2, Clock, Plus, ClipboardCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const zones = [
  { key: 'normal' as const, label: '正常', icon: CheckCircle2, border: 'border-emerald-500/40', headerBg: 'bg-emerald-500/15', headerText: 'text-emerald-400', badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/30', cardBorder: 'hover:border-emerald-500/40' },
  { key: 'check' as const, label: '该检测', icon: Clock, border: 'border-amber-500/40', headerBg: 'bg-amber-500/15', headerText: 'text-amber-400', badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/30', cardBorder: 'hover:border-amber-500/40' },
  { key: 'degraded' as const, label: '疑似衰减', icon: AlertTriangle, border: 'border-orange-500/40', headerBg: 'bg-orange-500/15', headerText: 'text-orange-400', badgeBg: 'bg-orange-500/10', badgeText: 'text-orange-400', badgeBorder: 'border-orange-500/30', cardBorder: 'hover:border-orange-500/40' },
  { key: 'danger' as const, label: '危险提醒', icon: AlertCircle, border: 'border-red-500/40', headerBg: 'bg-red-500/15', headerText: 'text-red-400', badgeBg: 'bg-red-500/10', badgeText: 'text-red-400', badgeBorder: 'border-red-500/30', cardBorder: 'hover:border-red-500/40' },
]

export default function Home() {
  const { vehicles, currentUser } = useStore()
  const userVehicles = currentUser?.role === 'admin' ? vehicles : vehicles.filter((v) => v.userId === currentUser?.id)

  const grouped = zones.map((z) => ({
    ...z,
    items: userVehicles.filter((v) => getStatusZone(v.degradationLevel) === z.key),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-50">电池健康总览</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {currentUser?.role === 'admin' ? '全小区车辆状态' : `${currentUser?.name} 的车辆状态`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/checkup/new" className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors">
            <Plus className="w-4 h-4" /> 体检
          </Link>
          <Link to="/vehicles" className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors">
            <ClipboardCheck className="w-4 h-4" /> 登记
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-zinc-100">{userVehicles.length}</div>
          <div className="text-xs text-zinc-500">车辆总数</div>
        </div>
        {grouped.map((z) => (
          <div key={z.key} className={`bg-zinc-900 border ${z.border} rounded-xl p-3 text-center`}>
            <div className={`text-2xl font-black ${z.headerText}`}>{z.items.length}</div>
            <div className={`text-xs ${z.badgeText}`}>{z.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {grouped.map((zone) => (
          <div key={zone.key} className={`border ${zone.border} rounded-2xl overflow-hidden`}>
            <div className={`${zone.headerBg} ${zone.headerText} px-4 py-3 flex items-center gap-2`}>
              <zone.icon className="w-4 h-4" />
              <span className="font-bold text-sm">{zone.label}</span>
              <span className="text-xs opacity-60 ml-1">{zone.items.length} 辆</span>
            </div>
            <div className="p-4">
              {zone.items.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-6">暂无车辆</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {zone.items.map((v, i) => (
                    <Link
                      key={v.id}
                      to={`/vehicles`}
                      className={`animate-slide-up bg-zinc-900 border border-zinc-800 rounded-xl p-4 ${zone.cardBorder} transition-all hover:shadow-lg ${zone.key === 'danger' ? 'animate-pulse-glow' : ''}`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-zinc-100">{v.brand}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{v.batteryModel}</div>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${zone.badgeBg} ${zone.badgeText} ${zone.badgeBorder}`}>
                          {v.degradationLevel} · {getLevelLabel(v.degradationLevel)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Battery className="w-3 h-3" />
                          {v.nominalRange}km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {v.lastCheckupDate || '未检测'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
