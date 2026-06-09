import { useState } from 'react'
import { useStore } from '@/store'
import { Plus, Trash2, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'
import { WaterQualityFormModal } from '@/components/FormModals'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ODOR_LABELS: Record<string, string> = {
  none: '无异味',
  mild: '轻微',
  obvious: '明显',
}

const ODOR_COLORS: Record<string, string> = {
  none: 'text-emerald-600',
  mild: 'text-amber-600',
  obvious: 'text-red-600',
}

export default function WaterQuality() {
  const { waterQualityLogs, purifiers, deleteWaterQualityLog, getWaterQualityAlerts } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedPurifier, setSelectedPurifier] = useState<string>('all')
  const allAlerts = getWaterQualityAlerts()

  const visibleAlerts = selectedPurifier === 'all'
    ? allAlerts
    : allAlerts.filter((a) => a.purifierId === selectedPurifier)

  const filteredLogs = selectedPurifier === 'all'
    ? waterQualityLogs
    : waterQualityLogs.filter((l) => l.purifierId === selectedPurifier)

  const sorted = [...filteredLogs].sort((a, b) => a.logDate.localeCompare(b.logDate))

  const chartData = sorted.map((l) => ({
    date: format(new Date(l.logDate), 'M/d'),
    flowRate: l.flowRate,
    tdsValue: l.tdsValue,
    odor: l.odorLevel,
  }))

  const getPurifier = (id: string) => purifiers.find((p) => p.id === id)

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">水质日志</h1>
          <p className="text-sm text-slate-400 mt-0.5">追踪出水速度、TDS 和异味变化</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> 记录
        </button>
      </div>

      {visibleAlerts.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl overflow-hidden animate-fade-in">
          <div className="px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center animate-pulse-slow flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-amber-800">水质异常预警</p>
          </div>
          <div className="px-4 pb-3 space-y-2">
            {visibleAlerts.map((a) => (
              <div key={a.purifierId} className="bg-white/60 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-amber-800 mb-1">{a.purifierName}</p>
                <div className="flex flex-wrap gap-2">
                  {a.flowDecreasing && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                      <TrendingDown className="w-3 h-3" /> 出水速度连续下降
                    </span>
                  )}
                  {a.tdsIncreasing && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                      <TrendingUp className="w-3 h-3" /> TDS 连续上升
                    </span>
                  )}
                  {a.odorWorsening && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                      <AlertTriangle className="w-3 h-3" /> 异味持续恶化
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {purifiers.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedPurifier}
            onChange={(e) => setSelectedPurifier(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="all">全部净水器</option>
            {purifiers.map((p) => (
              <option key={p.id} value={p.id}>{p.brand} {p.model}</option>
            ))}
          </select>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-brand-300" />
          </div>
          <p className="text-sm text-slate-400">还没有水质记录</p>
        </div>
      ) : (
        <>
          {chartData.length >= 2 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
              <h3 className="font-display text-sm font-semibold text-slate-700 mb-4">趋势图表</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis yAxisId="flow" orientation="left" tick={{ fontSize: 11, fill: '#0d9488' }} label={{ value: 'ml/min', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#0d9488' } }} />
                    <YAxis yAxisId="tds" orientation="right" tick={{ fontSize: 11, fill: '#f59e0b' }} label={{ value: 'ppm', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#f59e0b' } }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Line yAxisId="flow" type="monotone" dataKey="flowRate" stroke="#0d9488" strokeWidth={2} dot={{ r: 3, fill: '#0d9488' }} name="出水速度" />
                    <Line yAxisId="tds" type="monotone" dataKey="tdsValue" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} name="TDS" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {[...sorted].reverse().map((log) => {
              const pur = getPurifier(log.purifierId)
              return (
                <div key={log.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-display font-bold text-brand-600">{log.flowRate}</p>
                        <p className="text-[10px] text-slate-400">ml/min</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div className="text-center">
                        <p className="text-lg font-display font-bold text-amber-500">{log.tdsValue}</p>
                        <p className="text-[10px] text-slate-400">ppm</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <span className={`text-xs font-medium ${ODOR_COLORS[log.odorLevel]}`}>
                        {ODOR_LABELS[log.odorLevel]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        {pur && <p className="text-[10px] text-slate-400">{pur.brand} {pur.model}</p>}
                        <p className="text-xs text-slate-400">{format(new Date(log.logDate), 'M月d日', { locale: zhCN })}</p>
                      </div>
                      <button
                        onClick={() => deleteWaterQualityLog(log.id)}
                        className="p-1.5 rounded-lg text-slate-200 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <WaterQualityFormModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
