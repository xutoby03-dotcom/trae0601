import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { AlertTriangle, ArrowRightLeft, TrendingUp, Package } from 'lucide-react'

export default function Dashboard() {
  const { dashboard, fetchDashboard } = useStore()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-wood-300)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-title text-3xl font-bold text-[var(--color-wood-800)]">收盒管家</h1>
        <p className="text-[var(--color-wood-500)] mt-1">桌游配件清点与外借管理</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-wood card-wood-lift rounded-xl p-5 border-l-4 border-l-orange-500 animate-fade-in-up stagger-1 opacity-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="font-serif-title text-lg font-semibold text-[var(--color-wood-800)]">缺件游戏</h2>
          </div>
          {dashboard.missingGames.length === 0 ? (
            <div className="text-center py-6 text-[var(--color-wood-400)]">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无缺件游戏</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dashboard.missingGames.map((g) => (
                <Link
                  key={g.id}
                  to={`/games/${g.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-orange-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-[var(--color-wood-700)] group-hover:text-orange-700">{g.name}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">缺 {g.missing_count} 件</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-wood card-wood-lift rounded-xl p-5 border-l-4 border-l-indigo-500 animate-fade-in-up stagger-2 opacity-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-serif-title text-lg font-semibold text-[var(--color-wood-800)]">逾期外借</h2>
          </div>
          {dashboard.overdueLendings.length === 0 ? (
            <div className="text-center py-6 text-[var(--color-wood-400)]">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无逾期外借</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dashboard.overdueLendings.map((l) => (
                <Link
                  key={l.id}
                  to="/lending"
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-indigo-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-wood-700)] group-hover:text-indigo-700">{l.game_name}</p>
                    <p className="text-xs text-[var(--color-wood-400)]">借用人: {l.borrower_name}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">逾期</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-wood card-wood-lift rounded-xl p-5 border-l-4 border-l-[var(--color-gold-400)] animate-fade-in-up stagger-3 opacity-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-serif-title text-lg font-semibold text-[var(--color-wood-800)]">热门游戏</h2>
          </div>
          {dashboard.topPlayedGames.length === 0 ? (
            <div className="text-center py-6 text-[var(--color-wood-400)]">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无游玩记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dashboard.topPlayedGames.map((g, i) => (
                <Link
                  key={g.id}
                  to={`/games/${g.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-amber-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-[var(--color-wood-700)] group-hover:text-amber-700">{g.name}</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{g.play_count} 次</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
