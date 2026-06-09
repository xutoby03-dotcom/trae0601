import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Droplets,
  UserX,
  Leaf,
  Bug,
  ArrowRight,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react'
import { usePlantStore } from '@/store/plantStore'
import type { AlertType, PlantAlert } from '@/types'
import { ALERT_LABELS } from '@/types'

const GROUP_ORDER: AlertType[] = ['overwatering', 'neglected', 'yellowing', 'pestWarning']

const GROUP_META: Record<AlertType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  overwatering: {
    label: '过度浇水',
    icon: Droplets,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  neglected: {
    label: '长期没人负责',
    icon: UserX,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  yellowing: {
    label: '黄叶警告',
    icon: Leaf,
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  pestWarning: {
    label: '虫害警告',
    icon: Bug,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
}

export default function Alerts() {
  const navigate = useNavigate()
  const alerts = usePlantStore((s) => s.alerts)
  const plants = usePlantStore((s) => s.plants)
  const resolveAlert = usePlantStore((s) => s.resolveAlert)

  const unresolved = useMemo(() => alerts.filter((a) => !a.resolved), [alerts])
  const resolved = useMemo(() => alerts.filter((a) => a.resolved), [alerts])

  const grouped = useMemo(() => {
    const map: Record<string, PlantAlert[]> = {}
    for (const alert of unresolved) {
      if (!map[alert.type]) map[alert.type] = []
      map[alert.type].push(alert)
    }
    return GROUP_ORDER.filter((t) => map[t]?.length).map((type) => ({
      type,
      items: map[type].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }))
  }, [unresolved])

  const getDesk = (plantId: string) => plants.find((p) => p.id === plantId)?.desk ?? ''

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-gradient-to-r from-amber-500 to-orange-400 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-8 h-8" />
            <h1 className="text-2xl font-bold">预警中心</h1>
          </div>
          <p className="text-amber-100 text-sm">
            当前有 <span className="font-semibold text-white">{unresolved.length}</span> 条未处理预警，
            已解决 <span className="font-semibold text-white">{resolved.length}</span> 条
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <CheckCircle className="w-16 h-16 mb-4 text-emerald-400" />
            <p className="text-lg font-medium">所有预警已处理</p>
            <p className="text-sm mt-1">目前没有需要关注的预警</p>
          </div>
        )}

        {grouped.map((group) => {
          const meta = GROUP_META[group.type]
          const Icon = meta.icon
          return (
            <section key={group.type} className={`${meta.bg} rounded-2xl border ${meta.border} p-5`}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`${meta.color} w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className={`text-lg font-semibold ${meta.color}`}>{meta.label}</h2>
                <span className="ml-auto text-sm font-medium text-stone-500 bg-white/60 px-2.5 py-0.5 rounded-full">
                  {group.items.length} 条
                </span>
              </div>

              <div className="space-y-3">
                {group.items.map((alert) => {
                  const desk = getDesk(alert.plantId)
                  return (
                    <div
                      key={alert.id}
                      className="bg-white rounded-xl border border-stone-200 p-4 flex items-start gap-4"
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-stone-800">{alert.plantName}</span>
                          {desk && (
                            <span className="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                              📍 {desk}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${meta.color} ${meta.bg}`}
                          >
                            {ALERT_LABELS[alert.type]}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600">{alert.message}</p>
                        <p className="text-xs text-stone-400">{alert.createdAt}</p>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => navigate(`/plant/${alert.plantId}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-lg text-xs font-medium transition cursor-pointer border border-stone-200"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          去详情
                        </button>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium transition cursor-pointer border border-emerald-200"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          解决
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {resolved.length > 0 && (
          <section className="mt-8 pt-6 border-t border-stone-200">
            <h2 className="text-base font-semibold text-stone-400 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              已解决（{resolved.length}）
            </h2>
            <div className="space-y-2">
              {resolved
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((alert) => {
                  const desk = getDesk(alert.plantId)
                  return (
                    <div
                      key={alert.id}
                      className="bg-white rounded-xl border border-stone-100 p-3 flex items-center gap-3 opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-stone-500 font-medium">{alert.plantName}</span>
                        {desk && <span className="text-xs text-stone-400 ml-2">📍 {desk}</span>}
                        <span className="text-xs text-stone-400 ml-2">{ALERT_LABELS[alert.type]}</span>
                      </div>
                      <span className="text-xs text-stone-400">{alert.createdAt}</span>
                    </div>
                  )
                })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
