import { Map, Plus, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TrendChart } from '../components/TrendChart'
import { MaterialChart } from '../components/MaterialChart'
import { StatusStats } from '../components/StatusStats'
import { useInsectHotel } from '../hooks/useInsectHotel'

export default function AnalysisPage() {
  const { getMaterialStats, getTrendData } = useInsectHotel()
  const materialStats = getMaterialStats()
  const trendData = getTrendData()
  const latestTrend = trendData[trendData.length - 1]
  const previousTrend = trendData[trendData.length - 2]

  const occupancyChange = latestTrend && previousTrend
    ? latestTrend.occupied - previousTrend.occupied
    : 0

  const topMaterials = materialStats.slice(0, 3)
  const bottomMaterials = materialStats.slice(-3).reverse()

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
                <p className="text-sm text-stone-500">数据分析</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className="nav-link flex items-center gap-2">
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
              <Link to="/analysis" className="nav-link nav-link-active flex items-center gap-2">
                📊 数据分析
              </Link>
            </nav>
          </div>

          <nav className="md:hidden flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            <Link to="/" className="nav-link flex items-center gap-1 text-sm whitespace-nowrap">
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
            <Link to="/analysis" className="nav-link nav-link-active flex items-center gap-1 text-sm whitespace-nowrap">
              📊 数据分析
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <StatusStats />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-5">
            <h3 className="text-lg font-bold text-stone-800 mb-4">🏆 最受欢迎材料</h3>
            <div className="space-y-3">
              {topMaterials.map((stat, index) => (
                <div
                  key={stat.material}
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-xl"
                >
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-stone-800">{stat.materialName}</div>
                    <div className="text-sm text-stone-500">
                      {stat.occupiedCells}/{stat.totalCells} 个格口入住
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {stat.occupancyRate}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-5">
            <h3 className="text-lg font-bold text-stone-800 mb-4">💡 需要关注</h3>
            <div className="space-y-3">
              {bottomMaterials.map((stat, index) => (
                <div
                  key={stat.material}
                  className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl"
                >
                  <span className="text-2xl">
                    {index === 0 ? '⚠️' : index === 1 ? '🔍' : '💭'}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-stone-800">{stat.materialName}</div>
                    <div className="text-sm text-stone-500">
                      {stat.occupiedCells}/{stat.totalCells} 个格口入住
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    {stat.occupancyRate}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-stone-800">📈 今日数据摘要</h3>
              <p className="text-sm text-stone-500">基于最近30天观察数据</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${occupancyChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {occupancyChange >= 0 ? '+' : ''}{occupancyChange}
                </div>
                <div className="text-xs text-stone-500">较昨日入住变化</div>
              </div>
              <div className="w-px bg-stone-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {latestTrend?.occupied || 0}
                </div>
                <div className="text-xs text-stone-500">当前已入住</div>
              </div>
              <div className="w-px bg-stone-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-600">
                  {latestTrend?.empty || 0}
                </div>
                <div className="text-xs text-stone-500">当前空置</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
              <div className="text-3xl mb-1">🐝</div>
              <div className="text-2xl font-bold text-green-700">
                {materialStats.reduce((sum, m) => sum + m.occupiedCells, 0)}
              </div>
              <div className="text-xs text-green-600">昆虫之家</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl text-center">
              <div className="text-3xl mb-1">👀</div>
              <div className="text-2xl font-bold text-amber-700">
                {latestTrend?.underObservation || 0}
              </div>
              <div className="text-xs text-amber-600">观察中</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
              <div className="text-3xl mb-1">📝</div>
              <div className="text-2xl font-bold text-blue-700">
                {trendData.length}
              </div>
              <div className="text-xs text-blue-600">天数据</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
              <div className="text-3xl mb-1">🔬</div>
              <div className="text-2xl font-bold text-purple-700">
                {materialStats.length}
              </div>
              <div className="text-xs text-purple-600">种材料</div>
            </div>
          </div>
        </div>

        <TrendChart />
        <MaterialChart />

        <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-5">
          <h3 className="text-lg font-bold text-stone-800 mb-4">💡 观察小贴士</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="font-medium text-green-800 mb-2">🌅 最佳观察时间</h4>
              <p className="text-sm text-green-700">
                清晨和傍晚是昆虫最活跃的时段，建议在这两个时间段进行观察，更容易看到访客。
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <h4 className="font-medium text-amber-800 mb-2">🔍 观察要点</h4>
              <p className="text-sm text-amber-700">
                注意观察格口是否有封口、啃痕或羽化孔，这些都是昆虫入住的重要迹象。
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-medium text-blue-800 mb-2">🌦️ 天气影响</h4>
              <p className="text-sm text-blue-700">
                晴天昆虫活动更频繁，雨天它们会躲在格口中。记录天气有助于分析昆虫活动规律。
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-medium text-purple-800 mb-2">📌 持续观察</h4>
              <p className="text-sm text-purple-700">
                昆虫入住需要时间，建议持续观察至少2-4周，才能准确判断材料的吸引力。
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-stone-400 text-sm">
        <p>🐝 探索自然，发现生命的奥秘 🦋</p>
      </footer>
    </div>
  )
}
