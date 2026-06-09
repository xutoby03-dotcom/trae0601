import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Gift, BarChart3, Calendar, Clock, ChevronRight, Cake, AlertCircle } from 'lucide-react'
import { usePlansStore } from '@/store/plansStore'
import { formatCurrency, daysUntil, getStatusLabel } from '@/utils/format'
import { cn } from '@/lib/utils'
type PlanStatus = 'voting' | 'funding' | 'purchased' | 'delivered' | 'completed'

type FilterTab = 'all' | 'active' | 'completed'

const activeStatuses: PlanStatus[] = ['voting', 'funding', 'purchased', 'delivered']
const completedStatuses: PlanStatus[] = ['completed']

const statusColors: Record<string, string> = {
  voting: 'bg-mint-400 text-white',
  funding: 'bg-warm-500 text-white',
  purchased: 'bg-bark-900 text-white',
  delivered: 'bg-mint-400 text-white',
  completed: 'bg-rose-400 text-white',
}

function getCountdownBadge(birthdayDate: string) {
  const days = daysUntil(birthdayDate)
  if (days === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warm-500 text-white"><AlertCircle className="w-3 h-3" />今天!</span>
  if (days < 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-bark-200 text-bark-600">已过</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warm-50 text-warm-600"><Clock className="w-3 h-3" />{days}天</span>
}

export default function Home() {
  const plans = usePlansStore((s) => s.plans)
  const [filter, setFilter] = useState<FilterTab>('all')

  const filteredPlans = plans.filter((plan) => {
    if (filter === 'active') return activeStatuses.includes(plan.status)
    if (filter === 'completed') return completedStatuses.includes(plan.status)
    return true
  })

  return (
    <div className="min-h-screen bg-cream">
      <nav className="gradient-warm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cake className="w-6 h-6 text-white" />
            <span className="font-display text-xl font-bold text-white">生日合伙账</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/90 hover:text-white text-sm font-medium transition-colors">首页</Link>
            <Link to="/stats" className="text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"><BarChart3 className="w-4 h-4" />统计</Link>
          </div>
        </div>
      </nav>

      <section className="gradient-hero py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-bark-900 mb-3">一起给朋友挑礼物吧</h1>
          <p className="text-bark-500 mb-6">轻松筹款、投票选礼、让每个生日都特别</p>
          <Link
            to="/plan/new"
            className="inline-flex items-center gap-2 gradient-warm text-white px-6 py-3 rounded-full font-medium shadow-warm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />创建新计划
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {([
            { key: 'all' as FilterTab, label: '全部' },
            { key: 'active' as FilterTab, label: '进行中' },
            { key: 'completed' as FilterTab, label: '已完成' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                filter === tab.key
                  ? 'bg-warm-500 text-white'
                  : 'bg-white text-bark-500 hover:bg-warm-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-bark-400">
            <Gift className="w-16 h-16 mb-4 opacity-40" />
            <p className="text-lg font-medium">还没有生日计划</p>
            <p className="text-sm mt-1">点击下方按钮创建第一个计划吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => {
              const totalPledged = plan.participants.reduce((sum, p) => sum + p.pledgedAmount, 0)
              const progress = plan.totalBudget > 0 ? Math.min(100, (totalPledged / plan.totalBudget) * 100) : 0
              const initial = plan.birthdayPerson.charAt(0)

              return (
                <Link
                  key={plan.id}
                  to={`/plan/${plan.id}`}
                  className="glass rounded-3xl p-5 hover-lift block"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full gradient-warm flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-lg text-bark-900 truncate">{plan.birthdayPerson}</h3>
                        {getCountdownBadge(plan.birthdayDate)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-bark-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{plan.birthdayDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-bark-500 mb-1">
                      <span>筹款进度</span>
                      <span>{formatCurrency(totalPledged)} / {formatCurrency(plan.totalBudget)}</span>
                    </div>
                    <div className="w-full h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warm-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusColors[plan.status])}>
                        {getStatusLabel(plan.status)}
                      </span>
                      <span className="text-xs text-bark-400">{plan.participants.length}人参与</span>
                      <span className="text-xs text-bark-400">{plan.giftCandidates.length}个候选</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-bark-300" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <Link
        to="/plan/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-warm-500 text-white flex items-center justify-center shadow-warm hover:opacity-90 transition-opacity z-50"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  )
}
