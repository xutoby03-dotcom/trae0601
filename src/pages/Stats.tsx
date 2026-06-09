import { TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react'
import { useLoanStore } from '@/store/loanStore'
import { formatMoney } from '@/utils/helpers'

export default function Stats() {
  const { getStats, loans, repayments } = useLoanStore()
  const stats = getStats()

  const recoveryRate = stats.totalLent > 0
    ? ((stats.totalRecovered / stats.totalLent) * 100).toFixed(1)
    : '0.0'

  const monthlyData = (() => {
    const monthMap = new Map<string, { lent: number; recovered: number }>()
    for (const loan of loans) {
      const m = loan.lendDate.slice(0, 7)
      const cur = monthMap.get(m) || { lent: 0, recovered: 0 }
      cur.lent += loan.totalAmount
      monthMap.set(m, cur)
    }
    for (const r of repayments) {
      const m = r.date.slice(0, 7)
      const cur = monthMap.get(m) || { lent: 0, recovered: 0 }
      cur.recovered += r.amount
      monthMap.set(m, cur)
    }
    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
  })()

  const maxVal = Math.max(
    ...monthlyData.map((d) => Math.max(d[1].lent, d[1].recovered)),
    1
  )

  return (
    <div className="fade-in">
      <div className="mb-5">
        <h1 className="font-display font-bold text-apricot-900 text-2xl">借还统计</h1>
        <p className="text-parchment-500 text-xs mt-0.5">一目了然，心中有数</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-warm card-enter" style={{ animationDelay: '0s' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-apricot-100 flex items-center justify-center">
              <TrendingUp size={16} className="text-apricot-500" />
            </div>
            <span className="text-parchment-500 text-xs">借出总额</span>
          </div>
          <div className="font-display font-bold text-apricot-800 text-xl">
            ¥{formatMoney(stats.totalLent)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-warm card-enter" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-coral-100 flex items-center justify-center">
              <AlertTriangle size={16} className="text-coral-400" />
            </div>
            <span className="text-parchment-500 text-xs">逾期金额</span>
          </div>
          <div className="font-display font-bold text-coral-400 text-xl">
            ¥{formatMoney(stats.totalOverdue)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-warm card-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
              <TrendingDown size={16} className="text-sage-500" />
            </div>
            <span className="text-parchment-500 text-xs">已收回</span>
          </div>
          <div className="font-display font-bold text-sage-500 text-xl">
            ¥{formatMoney(stats.totalRecovered)}
          </div>
          <div className="text-parchment-400 text-[10px] mt-0.5">回收率 {recoveryRate}%</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-warm card-enter" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-apricot-100 flex items-center justify-center">
              <Clock size={16} className="text-apricot-500" />
            </div>
            <span className="text-parchment-500 text-xs">最长拖欠</span>
          </div>
          <div className="font-display font-bold text-apricot-800 text-xl">
            {stats.maxOverdueDays}
            <span className="text-sm font-normal text-parchment-500 ml-1">天</span>
          </div>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-warm mb-4">
          <h3 className="font-display font-bold text-apricot-900 text-sm mb-4">月度趋势</h3>
          <div className="space-y-3">
            {monthlyData.map(([month, data]) => (
              <div key={month}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-parchment-500 font-medium">{month}</span>
                  <div className="flex gap-4">
                    <span className="text-apricot-500">借 ¥{formatMoney(data.lent)}</span>
                    <span className="text-sage-500">还 ¥{formatMoney(data.recovered)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-3 bg-parchment-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-apricot-300 rounded-full transition-all duration-700"
                      style={{ width: `${(data.lent / maxVal) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 h-3 bg-parchment-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage-300 rounded-full transition-all duration-700"
                      style={{ width: `${(data.recovered / maxVal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-parchment-100">
            <div className="flex items-center gap-1.5 text-xs text-parchment-500">
              <div className="w-2.5 h-2.5 bg-apricot-300 rounded-full" />
              借出
            </div>
            <div className="flex items-center gap-1.5 text-xs text-parchment-500">
              <div className="w-2.5 h-2.5 bg-sage-300 rounded-full" />
              收回
            </div>
          </div>
        </div>
      )}

      {loans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-parchment-400 text-sm">暂无数据，先记录一笔借款吧</p>
        </div>
      )}
    </div>
  )
}
