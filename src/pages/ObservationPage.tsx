import { Map, Plus, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CellGrid } from '../components/CellGrid'
import { StatusStats } from '../components/StatusStats'
import { MaterialAlert } from '../components/MaterialAlert'
import { useInsectHotel } from '../hooks/useInsectHotel'

export default function ObservationPage() {
  const { isLoading } = useInsectHotel()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐛</div>
          <p className="text-stone-600">正在加载昆虫旅馆数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b-2 border-dashed border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-float">🏠</span>
              <div>
                <h1 className="text-2xl font-display font-bold text-stone-800">
                  昆虫旅馆观察站
                </h1>
                <p className="text-sm text-stone-500">
                  {new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className="nav-link nav-link-active flex items-center gap-2">
                <Map className="w-4 h-4" />
                观察地图
              </Link>
              <Link to="/cells" className="nav-link flex items-center gap-2">
                <Plus className="w-4 h-4" />
                格口管理
              </Link>
              <Link to="/record" className="nav-link flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                每日记录
              </Link>
              <Link to="/analysis" className="nav-link flex items-center gap-2">
                📊 数据分析
              </Link>
            </nav>
          </div>

          <nav className="md:hidden flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            <Link to="/" className="nav-link nav-link-active flex items-center gap-1 text-sm whitespace-nowrap">
              <Map className="w-4 h-4" />
              观察地图
            </Link>
            <Link to="/cells" className="nav-link flex items-center gap-1 text-sm whitespace-nowrap">
              <Plus className="w-4 h-4" />
              格口管理
            </Link>
            <Link to="/record" className="nav-link flex items-center gap-1 text-sm whitespace-nowrap">
              <Calendar className="w-4 h-4" />
              每日记录
            </Link>
            <Link to="/analysis" className="nav-link flex items-center gap-1 text-sm whitespace-nowrap">
              📊 数据分析
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <MaterialAlert />
        <StatusStats />
        <CellGrid />
      </main>

      <footer className="text-center py-6 text-stone-400 text-sm">
        <p>🐝 探索自然，发现生命的奥秘 🦋</p>
      </footer>
    </div>
  )
}
