import { useStore } from '@/store'
import {
  PackageCheck,
  AlertTriangle,
  Clock,
  Flame,
  ArrowRight,
  TrendingDown,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

function StatCard({
  icon: Icon,
  title,
  count,
  color,
  bgColor,
  borderColor,
}: {
  icon: React.ElementType
  title: string
  count: number
  color: string
  bgColor: string
  borderColor: string
}) {
  return (
    <div className={cn('card p-5 border-l-4', borderColor)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className={cn('text-3xl font-serif font-bold mt-1', color)}>{count}</p>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { consumables, requisitions } = useStore()

  const normalStock = consumables.filter((c) => c.stock >= c.minAlert && !c.isHazardous)
  const lowStock = consumables.filter((c) => c.stock < c.minAlert)
  const hazardous = consumables.filter((c) => c.isHazardous)
  const pendingReqs = requisitions.filter(
    (r) => r.status === 'pending' || r.status === 'hazardous_pending'
  )

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-lab-900">实验室耗材概览</h1>
        <p className="text-sm text-gray-500 mt-1">实时监控耗材库存与领用状态</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <StatCard
          icon={PackageCheck}
          title="库存正常"
          count={normalStock.length}
          color="text-safe-600"
          bgColor="bg-emerald-50"
          borderColor="border-l-safe-500"
        />
        <StatCard
          icon={TrendingDown}
          title="低库存预警"
          count={lowStock.length}
          color="text-warn-600"
          bgColor="bg-amber-50"
          borderColor="border-l-warn-500"
        />
        <StatCard
          icon={Clock}
          title="待审批"
          count={pendingReqs.length}
          color="text-lab-700"
          bgColor="bg-lab-50"
          borderColor="border-l-lab-500"
        />
        <StatCard
          icon={Flame}
          title="危化耗材"
          count={hazardous.length}
          color="text-danger-500"
          bgColor="bg-red-50"
          borderColor="border-l-danger-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-warn-600" />
              <h2 className="section-title">低库存预警</h2>
            </div>
            {lowStock.length > 0 && (
              <span className="badge-warn animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                需补货
              </span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">所有耗材库存充足</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100 animate-pulse-border"
                >
                  <div className="flex items-center gap-3">
                    {c.isHazardous && (
                      <Flame className="w-4 h-4 text-danger-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.cabinet}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-danger-500">
                      {c.stock} / {c.minAlert} {c.unit}
                    </p>
                    <p className="text-[10px] text-gray-400">当前 / 警戒线</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/consumables"
            className="flex items-center gap-1 text-xs text-lab-600 hover:text-lab-800 mt-4 font-medium"
          >
            前往补货 <ArrowRight className="w-3 h-3" />
          </Link>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-lab-700" />
              <h2 className="section-title">待审批申请</h2>
            </div>
          </div>
          {pendingReqs.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">暂无待审批申请</p>
          ) : (
            <div className="space-y-2">
              {pendingReqs.slice(0, 5).map((r) => {
                const c = consumables.find((item) => item.id === r.consumableId)
                return (
                  <div
                    key={r.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      r.isHazardous
                        ? 'bg-red-50/50 border-red-200 animate-pulse-border'
                        : 'bg-lab-50/50 border-lab-100'
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{r.applicant}</p>
                        {r.isHazardous && (
                          <span className="badge-danger">
                            <Flame className="w-3 h-3 mr-0.5" />
                            危化
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        申请 {c?.name} × {r.quantity} · {r.projectName}
                      </p>
                    </div>
                    <span className="badge-info">
                      {r.status === 'hazardous_pending' ? '待二次审批' : '待审批'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <Link
            to="/approval"
            className="flex items-center gap-1 text-xs text-lab-600 hover:text-lab-800 mt-4 font-medium"
          >
            前往审批 <ArrowRight className="w-3 h-3" />
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <PackageCheck className="w-5 h-5 text-safe-600" />
            <h2 className="section-title">库存正常耗材</h2>
          </div>
          {normalStock.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">暂无库存正常的耗材</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {normalStock.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-safe-600 font-medium mt-1">
                    {c.stock} {c.unit} · {c.cabinet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-danger-500" />
            <h2 className="section-title">危化耗材专区</h2>
          </div>
          {hazardous.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">暂无危化耗材</p>
          ) : (
            <div className="space-y-2">
              {hazardous.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    c.stock < c.minAlert
                      ? 'bg-red-50/50 border-red-200 animate-pulse-border'
                      : 'bg-red-50/30 border-red-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <span className="badge-danger">危化</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{c.specification}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-sm font-bold', c.stock < c.minAlert ? 'text-danger-500' : 'text-gray-900')}>
                        {c.stock} {c.unit}
                      </p>
                      <p className="text-[10px] text-gray-400">{c.cabinet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
