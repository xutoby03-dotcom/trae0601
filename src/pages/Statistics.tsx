import { useMemo } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'
import { useReportStore } from '@/stores/reportStore'
import { usePrinterStore } from '@/stores/printerStore'
import { mockMonthlyCosts, mockConsumableTrends } from '@/data/mockData'

const CustomTooltipStyle: React.CSSProperties = {
  backgroundColor: '#1a1a35',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '8px 12px',
}

export default function Statistics() {
  const { reports } = useReportStore()
  const { printers } = usePrinterStore()

  const errorRanking = useMemo(() => {
    const countMap: Record<string, number> = {}
    reports.forEach((r) => {
      countMap[r.printerId] = (countMap[r.printerId] || 0) + 1
    })
    return Object.entries(countMap)
      .map(([printerId, count]) => ({
        printerId,
        name: printers.find((p) => p.id === printerId)?.name || '未知打印机',
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [reports, printers])

  const maxErrorCount = errorRanking.length > 0 ? errorRanking[0].count : 1

  return (
    <div className="min-h-screen bg-[#0f0f23] p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
          <BarChart3 className="h-5 w-5 text-amber-400" />
        </div>
        <h1 className="text-xl font-bold text-white">统计分析</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-[#1a1a35] p-5">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-white/80">月度采购成本</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMonthlyCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip contentStyle={CustomTooltipStyle} labelStyle={{ color: '#ffffff80' }} itemStyle={{ color: '#f59e0b' }} />
                <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-[#1a1a35] p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-white/80">报修排行</span>
          </div>
          <div className="space-y-3">
            {errorRanking.map((item, index) => (
              <div key={item.printerId}>
                <div className="mb-1 flex items-center justify-between">
                  <span className={cn('text-xs', index === 0 ? 'text-red-400 font-semibold' : 'text-white/70')}>
                    {item.name}
                  </span>
                  <span className={cn('text-xs font-mono', index === 0 ? 'text-red-400' : 'text-white/50')}>
                    {item.count} 次
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      index === 0 ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-red-500/50'
                    )}
                    style={{ width: `${(item.count / maxErrorCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {errorRanking.length === 0 && (
              <div className="py-8 text-center text-xs text-white/30">暂无报修记录</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-[#1a1a35] p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-white/80">耗材消耗趋势</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockConsumableTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Tooltip contentStyle={CustomTooltipStyle} labelStyle={{ color: '#ffffff80' }} />
              <Legend wrapperStyle={{ color: '#ffffff80', fontSize: 12 }} />
              <Line type="monotone" dataKey="paper" name="纸张" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} />
              <Line type="monotone" dataKey="toner" name="硒鼓" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
              <Line type="monotone" dataKey="ink" name="墨盒" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
