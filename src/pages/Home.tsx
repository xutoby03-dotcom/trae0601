import { useState } from 'react'
import { Plus, Film, Sparkles } from 'lucide-react'
import { useCinemaStore } from '@/store'
import ScreeningCard from '@/components/ScreeningCard'
import ScreeningForm from '@/components/ScreeningForm'

export default function Home() {
  const screenings = useCinemaStore((s) => s.screenings)
  const [showForm, setShowForm] = useState(false)

  const upcoming = screenings.filter((s) => s.status !== 'completed')
  const completed = screenings.filter((s) => s.status === 'completed')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-night via-night-light to-night-lighter p-8 sm:p-10 mb-10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-6 right-10 w-2 h-2 bg-gold rounded-full animate-pulse" />
          <div className="absolute top-16 right-32 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-10 right-20 w-2.5 h-2.5 bg-gold rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-8 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-cream rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-20 left-1/2 w-1 h-1 bg-gold-light rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="text-gold text-sm font-medium">每周五晚 · 社区中央广场</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-3">
            星光露天影院
          </h1>
          <p className="text-cream/60 text-sm sm:text-base max-w-lg mb-6">
            在星空下与邻里共享电影的魅力。选择心仪的场次，带上家人朋友，一起度过美好的周五夜晚。
          </p>
          <button onClick={() => setShowForm(true)} className="btn-gold inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            发布新场次
          </button>
        </div>
      </div>

      {upcoming.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Film className="w-5 h-5 text-orange" />
            <h2 className="text-xl font-bold text-night">即将放映</h2>
            <span className="ml-2 text-sm text-night-lighter">{upcoming.length} 场</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((screening, i) => (
              <ScreeningCard key={screening.id} screening={screening} index={i} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Film className="w-5 h-5 text-night-lighter" />
            <h2 className="text-xl font-bold text-night-lighter">已结束</h2>
            <span className="ml-2 text-sm text-night-lighter/60">{completed.length} 场</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((screening, i) => (
              <ScreeningCard key={screening.id} screening={screening} index={i} />
            ))}
          </div>
        </section>
      )}

      {screenings.length === 0 && (
        <div className="text-center py-20">
          <Film className="w-12 h-12 text-night-lighter/30 mx-auto mb-4" />
          <p className="text-night-lighter/50 text-lg">暂无放映场次</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
            发布第一场电影
          </button>
        </div>
      )}

      {showForm && <ScreeningForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
