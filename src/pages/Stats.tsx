import { useFridgeStore } from '@/store/fridgeStore'
import { TrendingDown, Flame, Trash2, Trophy, Package } from 'lucide-react'

export default function Stats() {
  const { getMonthlyClaimCount, getMonthlyExpiredCount, getPopularFoods, claimRecords, foodItems, cleaningRecords } = useFridgeStore()

  const monthlyClaim = getMonthlyClaimCount()
  const monthlyExpired = getMonthlyExpiredCount()
  const popularFoods = getPopularFoods()
  const totalItems = foodItems.length
  const availableItems = foodItems.filter((f) => f.status === 'available').length
  const totalClaims = claimRecords.length

  const now = new Date()
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`

  const latestCleaning = cleaningRecords.length > 0
    ? cleaningRecords.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
    : null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-1">📊 统计看板</h2>
        <p className="text-sm text-stone-400">本月社区冰箱运营数据概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 opacity-80" />
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{monthLabel}</span>
          </div>
          <p className="text-3xl font-bold">{monthlyClaim}</p>
          <p className="text-sm text-emerald-100 mt-1">减少浪费（份）</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <Flame className="w-8 h-8 opacity-80" />
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{monthLabel}</span>
          </div>
          <p className="text-3xl font-bold">{popularFoods.length > 0 ? popularFoods[0].totalClaimed : 0}</p>
          <p className="text-sm text-blue-100 mt-1">
            最热门 · {popularFoods.length > 0 ? popularFoods[0].name : '暂无数据'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between mb-3">
            <Trash2 className="w-8 h-8 opacity-80" />
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{monthLabel}</span>
          </div>
          <p className="text-3xl font-bold">{monthlyExpired}</p>
          <p className="text-sm text-red-100 mt-1">过期报废（份）</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-500" />
            热门食物排行
          </h3>
          {popularFoods.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-sm">暂无领取记录</div>
          ) : (
            <div className="space-y-3">
              {popularFoods.slice(0, 10).map((food, idx) => {
                const maxCount = popularFoods[0].totalClaimed
                const pct = maxCount > 0 ? (food.totalClaimed / maxCount) * 100 : 0
                return (
                  <div key={food.name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-stone-200 text-stone-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-stone-100 text-stone-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-stone-700 truncate">{food.name}</span>
                        <span className="text-xs text-stone-400 shrink-0 ml-2">{food.totalClaimed}份</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-emerald-500" />
            运营概况
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-stone-100">
              <span className="text-sm text-stone-500">食物总品种</span>
              <span className="text-sm font-bold text-stone-800">{totalItems} 种</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-stone-100">
              <span className="text-sm text-stone-500">当前可领取</span>
              <span className="text-sm font-bold text-emerald-600">{availableItems} 种</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-stone-100">
              <span className="text-sm text-stone-500">累计领取次数</span>
              <span className="text-sm font-bold text-stone-800">{totalClaims} 次</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-stone-100">
              <span className="text-sm text-stone-500">本月减少浪费</span>
              <span className="text-sm font-bold text-emerald-600">{monthlyClaim} 份</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-stone-100">
              <span className="text-sm text-stone-500">本月过期报废</span>
              <span className="text-sm font-bold text-red-600">{monthlyExpired} 份</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-stone-500">最近清洁时间</span>
              <span className="text-sm font-bold text-stone-800">
                {latestCleaning
                  ? new Date(latestCleaning.recordedAt).toLocaleDateString('zh-CN')
                  : '暂无记录'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2 mb-4">
          📋 近期领取记录
        </h3>
        {claimRecords.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm">暂无领取记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 text-xs font-bold text-stone-400">食物名称</th>
                  <th className="text-left py-2 text-xs font-bold text-stone-400">数量</th>
                  <th className="text-left py-2 text-xs font-bold text-stone-400">领取人</th>
                  <th className="text-left py-2 text-xs font-bold text-stone-400">领取时间</th>
                  <th className="text-left py-2 text-xs font-bold text-stone-400">备注</th>
                </tr>
              </thead>
              <tbody>
                {[...claimRecords]
                  .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())
                  .slice(0, 20)
                  .map((record) => (
                    <tr key={record.id} className="border-b border-stone-50 hover:bg-stone-50">
                      <td className="py-2 font-medium text-stone-700">{record.foodName}</td>
                      <td className="py-2 text-emerald-600 font-bold">{record.quantity}</td>
                      <td className="py-2 text-stone-500">{record.claimerName}</td>
                      <td className="py-2 text-stone-400 text-xs">
                        {new Date(record.claimedAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="py-2 text-stone-400 text-xs">{record.notes || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
