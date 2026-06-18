import { useStore } from '@/store/useStore'
import { LayoutDashboard, Armchair, SprayCan, Wrench, AlertTriangle, ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DEVICE_STATUS_MAP, formatDateTime, ARMREST_TYPE_MAP } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge'

export default function Dashboard() {
  const { devices, usageRecords, maintenanceAlerts, cleanRecords, checkRecords } = useStore()

  const availableCount = devices.filter((d) => d.status === 'available').length
  const pendingCleanCount = devices.filter((d) => d.status === 'pending_clean').length
  const pendingMaintenanceCount = devices.filter((d) => d.status === 'pending_maintenance').length
  const disabledCount = devices.filter((d) => d.status === 'disabled').length

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyUsageCount = usageRecords.filter((u) => u.startTime >= weekAgo.toISOString()).length

  const pendingAlerts = maintenanceAlerts.filter((a) => a.status === 'pending')

  const allRecords = [
    ...checkRecords.map((r) => ({
      type: 'check' as const,
      deviceId: r.deviceId,
      time: r.checkedAt,
      desc: `${r.checkedBy} 完成使用前检查`,
      passed: r.allPassed,
    })),
    ...cleanRecords.map((r) => ({
      type: 'clean' as const,
      deviceId: r.deviceId,
      time: r.cleanedAt,
      desc: `${r.cleaner} 完成清洁消毒`,
      passed: !r.foundLoose,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

  const getDeviceCode = (id: string) => devices.find((d) => d.id === id)?.code ?? id

  const stats = [
    { label: '可用椅子', value: availableCount, icon: Armchair, color: 'bg-teal-500', lightBg: 'bg-teal-50' },
    { label: '待清洁', value: pendingCleanCount, icon: SprayCan, color: 'bg-amber-500', lightBg: 'bg-amber-50' },
    { label: '待维修', value: pendingMaintenanceCount + disabledCount, icon: Wrench, color: 'bg-red-500', lightBg: 'bg-red-50' },
    { label: '本周使用', value: weeklyUsageCount, icon: LayoutDashboard, color: 'bg-zinc-700', lightBg: 'bg-zinc-50' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800 font-display">助浴椅总览</h2>
        <p className="text-sm text-zinc-400 mt-1">实时查看设备状态与使用情况</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-zinc-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.lightBg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-800 tabular-nums">{stat.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {pendingAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-red-700">维修提醒</h3>
          </div>
          <div className="space-y-2">
            {pendingAlerts.slice(0, 3).map((alert) => {
              const device = devices.find((d) => d.id === alert.deviceId)
              return (
                <div key={alert.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-red-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-red-700">{device?.code}</span>
                    <span className="text-sm text-zinc-600">{alert.reason}</span>
                  </div>
                  <Link
                    to="/maintenance"
                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  >
                    处理 <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
            <h3 className="text-sm font-bold text-zinc-700">设备状态</h3>
            <Link to="/devices" className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {devices.map((device) => (
              <Link
                key={device.id}
                to={`/devices/${device.id}`}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-md ${DEVICE_STATUS_MAP[device.status].bg} flex items-center justify-center`}>
                    <Armchair className={`w-4 h-4 ${DEVICE_STATUS_MAP[device.status].color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-700 group-hover:text-teal-700 transition-colors">{device.code}</p>
                    <p className="text-[11px] text-zinc-400">{ARMREST_TYPE_MAP[device.armrestType]} · {device.weightCapacity}kg</p>
                  </div>
                </div>
                <StatusBadge status={device.status} />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
            <h3 className="text-sm font-bold text-zinc-700">最近记录</h3>
            <Clock className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="p-4">
            {allRecords.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">暂无记录</p>
            ) : (
              <div className="space-y-3">
                {allRecords.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${rec.passed ? 'bg-teal-400' : 'bg-red-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-700">
                        <span className="font-semibold text-zinc-800">{getDeviceCode(rec.deviceId)}</span> {rec.desc}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{formatDateTime(rec.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/pre-check"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm hover:shadow-md"
        >
          <ClipboardCheck className="w-4 h-4" />
          使用前检查
        </Link>
        <Link
          to="/post-record"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm hover:shadow-md"
        >
          <SprayCan className="w-4 h-4" />
          使用后记录
        </Link>
      </div>
    </div>
  )
}

function ClipboardCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}
