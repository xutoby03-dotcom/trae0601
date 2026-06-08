import { useStore } from '../store/useStore'
import { TrendingDown, Utensils, CheckCircle, UserX, Package } from 'lucide-react'

export default function StatsPage() {
  const { foodItems, getMonthlyStats } = useStore()
  const stats = getMonthlyStats()

  const activeItems = foodItems.filter(i => i.status !== 'expired' && i.status !== 'completed')
  const totalItems = foodItems.length
  const completedItems = foodItems.filter(i => i.status === 'completed')
  const expiredItems = foodItems.filter(i => i.status === 'expired')

  const totalMoneySaved = completedItems.reduce((sum, item) => sum + (item.originalPrice - item.sharePrice) * item.quantity, 0)
  const totalPortions = completedItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">📊 减少浪费统计</h1>

      <div className="bg-gradient-to-br from-primary to-amber-500 rounded-2xl p-5 text-white mb-6 shadow-lg">
        <p className="text-sm opacity-90">本月一起少浪费了</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-4xl font-bold">¥{stats.moneySaved.toFixed(1)}</span>
          <span className="text-sm opacity-80">元</span>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-2xl font-bold">{stats.foodPortions}</span>
          <span className="text-sm opacity-80">份食物</span>
        </div>
        <p className="text-xs opacity-70 mt-3">
          累计节省 ¥{totalMoneySaved.toFixed(1)}，共 {totalPortions} 份食物没被浪费
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-warm-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-gray-500">成功拼单</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.completedOrders}</p>
          <p className="text-xs text-gray-400 mt-1">本月完成取货</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-warm-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <UserX size={16} className="text-red-600" />
            </div>
            <span className="text-xs text-gray-500">爽约次数</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.noShowCount}</p>
          <p className="text-xs text-gray-400 mt-1">本月爽约</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-warm-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Package size={16} className="text-primary" />
            </div>
            <span className="text-xs text-gray-500">分享食品</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.itemsShared}</p>
          <p className="text-xs text-gray-400 mt-1">本月发布并完成</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-warm-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingDown size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">减少浪费率</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">食品利用率</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-warm-border shadow-sm mb-6">
        <h3 className="font-semibold text-sm text-gray-800 mb-3">拼单状态概览</h3>
        <div className="space-y-2">
          {[
            { label: '拼单中', count: activeItems.filter(i => i.status === 'grouping').length, color: 'bg-green-500' },
            { label: '待取货', count: activeItems.filter(i => i.status === 'pendingPickup').length, color: 'bg-blue-500' },
            { label: '已完成', count: completedItems.length, color: 'bg-gray-400' },
            { label: '已过期', count: expiredItems.length, color: 'bg-red-400' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-gray-600 flex-1">{item.label}</span>
              <span className="text-sm font-medium text-gray-800">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {completedItems.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-warm-border shadow-sm">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">最近完成</h3>
          <div className="space-y-2">
            {completedItems.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.photo || '🛒'}</span>
                  <span className="text-sm text-gray-700 truncate max-w-[180px]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-600 font-medium">省 ¥{((item.originalPrice - item.sharePrice) * item.quantity).toFixed(1)}</span>
                  <p className="text-xs text-gray-400">{item.quantity}份</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
        <p className="text-sm text-green-700">
          🌱 感谢你的每一次拼单，都是对地球的一份温柔！
        </p>
        <p className="text-xs text-green-600 mt-1">
          已累计减少浪费 ¥{totalMoneySaved.toFixed(1)}，{totalPortions} 份食物重获新生
        </p>
      </div>
    </div>
  )
}
