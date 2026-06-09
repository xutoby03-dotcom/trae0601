import { useNavigate } from 'react-router-dom'
import {
  Wind,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Calendar,
  Battery,
  Droplets,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore, getACStatus, getDaysSince, CHECK_TYPE_LABELS } from '@/store/useStore'
import ACCard from '@/components/ACCard'
import BottomNav from '@/components/BottomNav'

const SEASON_ICONS: Record<string, React.ElementType> = {
  remote_battery: Battery,
  drain_pipe: Droplets,
  outdoor_obstacle: Shield,
  filter_status: Wind,
}

const GROUP_CONFIG = [
  {
    status: 'overdue' as const,
    label: '已经超期',
    color: '#F43F5E',
    bgClass: 'bg-rose-50',
    icon: AlertTriangle,
  },
  {
    status: 'due-soon' as const,
    label: '快该洗了',
    color: '#0EA5E9',
    bgClass: 'bg-sky-50',
    icon: Calendar,
  },
  {
    status: 'clean' as const,
    label: '今年洗过',
    color: '#34D399',
    bgClass: 'bg-emerald-50',
    icon: CheckCircle2,
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { acUnits, seasonChecks } = useStore()

  const grouped = GROUP_CONFIG.map((group) => ({
    ...group,
    items: acUnits.filter((ac) => getACStatus(ac) === group.status),
  }))

  const uncheckedSeasonItems = seasonChecks.filter((s) => !s.checked)
  const hasUncheckedSeason = uncheckedSeasonItems.length > 0

  if (acUnits.length === 0) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl bg-gray-50 px-4 pb-24 pt-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">🏠 空调清洗管家</h1>
          <p className="mt-1 text-sm text-gray-500">管理家中空调清洗计划</p>
        </header>

        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200">
            <Wind className="h-16 w-16 text-sky-400" />
          </div>
          <p className="mb-2 text-lg font-semibold text-gray-600">还没有添加空调</p>
          <p className="mb-8 text-sm text-gray-400">点击下方按钮添加第一台空调吧</p>
          <button
            onClick={() => navigate('/add')}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-3 font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-600 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            添加空调
          </button>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-gray-50 px-4 pb-24 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏠 空调清洗管家</h1>
        <p className="mt-1 text-sm text-gray-500">
          共 {acUnits.length} 台空调 · 已记录 {seasonChecks.length} 项检查
        </p>
      </header>

      {hasUncheckedSeason && (
        <div
          className="mb-6 rounded-2xl p-5 text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #F97316, #FB923C, #FDBA74)',
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-lg font-bold">换季提醒</span>
            <span className="ml-auto rounded-full bg-white/20 px-3 py-0.5 text-sm font-medium">
              {uncheckedSeasonItems.length} 项待检查
            </span>
          </div>
          <div className="space-y-2">
            {uncheckedSeasonItems.map((item) => {
              const ac = acUnits.find((a) => a.id === item.acId)
              const Icon = SEASON_ICONS[item.checkType] || Wind
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm">
                    {ac?.room ?? '未知'} · {CHECK_TYPE_LABELS[item.checkType]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-700">空调列表</h2>
        <button
          onClick={() => navigate('/add')}
          className="flex items-center gap-1 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          添加空调
        </button>
      </div>

      <div className="space-y-6">
        {grouped.map(
          (group) =>
            group.items.length > 0 && (
              <section key={group.status}>
                <div className="mb-3 flex items-center gap-2">
                  <group.icon className="h-4 w-4" style={{ color: group.color }} />
                  <span className="font-semibold text-gray-700">{group.label}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: group.color }}
                  >
                    {group.items.length}
                  </span>
                </div>
                <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl p-3', group.bgClass)}>
                  {group.items.map((ac) => (
                    <ACCard key={ac.id} ac={ac} />
                  ))}
                </div>
              </section>
            )
        )}
      </div>

      <BottomNav />
    </div>
  )
}
