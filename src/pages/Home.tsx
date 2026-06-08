import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, MapPin, Users, ChefHat, DollarSign, Trophy, TrendingUp } from 'lucide-react'
import { useGatheringStore } from '@/store/useGatheringStore'
import type { Gathering } from '@/types'

type GatheringStatus = Gathering['status']

const STATUS_CONFIG: Record<GatheringStatus, { label: string; bg: string; text: string; dot: string }> = {
  preparing: { label: '筹备中', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  ongoing: { label: '进行中', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  completed: { label: '已完成', bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' },
}

function StatusBadge({ status }: { status: GatheringStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function GatheringCard({ gathering }: { gathering: Gathering }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(`/gathering/${gathering.id}`)}
      className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-serif text-lg text-bark font-semibold group-hover:text-primary transition-colors line-clamp-1">
          {gathering.name}
        </h3>
        <StatusBadge status={gathering.status} />
      </div>
      <div className="space-y-2 text-sm text-stone-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary/60 shrink-0" />
          <span>{gathering.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
          <span>{gathering.location}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary/60 shrink-0" />
            <span>{gathering.headCount} 人</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary/60 shrink-0" />
            <span>¥{gathering.budget}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-400">
      <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <ChefHat className="w-12 h-12 text-stone-300" />
      </div>
      <p className="font-serif text-lg text-stone-400 mb-1">还没有聚会</p>
      <p className="text-sm text-stone-300">点击上方按钮创建你的第一次聚会吧</p>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const gatherings = useGatheringStore((s) => s.gatherings)
  const getTopDishes = useGatheringStore((s) => s.getTopDishes)

  const upcoming = gatherings
    .filter((g) => g.status === 'preparing' || g.status === 'ongoing')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const completed = gatherings
    .filter((g) => g.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const topDishes = getTopDishes(3)

  return (
    <div className="min-h-screen bg-cream font-sans">
      <div className="bg-gradient-to-br from-primary to-primary/85 text-white">
        <div className="container px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              聚会菜单协调器
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8">
              让每次聚会都有条不紊
            </p>
            <button
              type="button"
              onClick={() => navigate('/gathering/new')}
              className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              创建聚会
            </button>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {gatherings.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {upcoming.length > 0 && (
                  <section className="mb-10">
                    <h2 className="font-serif text-2xl text-bark font-semibold mb-5 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-primary" />
                      即将到来
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcoming.map((g) => (
                        <GatheringCard key={g.id} gathering={g} />
                      ))}
                    </div>
                  </section>
                )}

                {completed.length > 0 && (
                  <section>
                    <h2 className="font-serif text-2xl text-bark font-semibold mb-5 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-honey" />
                      已完成
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {completed.map((g) => (
                        <GatheringCard key={g.id} gathering={g} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          <aside className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 lg:sticky lg:top-8">
              <h3 className="font-serif text-xl text-bark font-semibold mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                快速统计
              </h3>

              <div className="space-y-4">
                <div className="bg-primary/5 rounded-xl p-4">
                  <p className="text-sm text-stone-500 mb-1">聚会总数</p>
                  <p className="font-serif text-3xl font-bold text-primary">{gatherings.length}</p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-sage/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-stone-500 mb-0.5">筹备中</p>
                    <p className="font-serif text-xl font-bold text-sage">{upcoming.filter((g) => g.status === 'preparing').length}</p>
                  </div>
                  <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-stone-500 mb-0.5">进行中</p>
                    <p className="font-serif text-xl font-bold text-emerald-600">{upcoming.filter((g) => g.status === 'ongoing').length}</p>
                  </div>
                  <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-stone-500 mb-0.5">已完成</p>
                    <p className="font-serif text-xl font-bold text-stone-500">{completed.length}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-bark mb-3 flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-primary" />
                    人气菜品 TOP 3
                  </h4>
                  {topDishes.length === 0 ? (
                    <p className="text-xs text-stone-400 py-2">暂无评分数据</p>
                  ) : (
                    <div className="space-y-2">
                      {topDishes.map((dish, i) => (
                        <div key={dish.name} className="flex items-center gap-3 bg-stone-50 rounded-lg px-3 py-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-honey' : 'bg-stone-400'}`}>
                            {i + 1}
                          </span>
                          <span className="text-sm text-bark truncate flex-1">{dish.name}</span>
                          <span className="text-xs text-stone-400 shrink-0">★ {dish.avgRating.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
