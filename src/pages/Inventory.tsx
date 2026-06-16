import { useState } from 'react'
import { BarChart3, Package, Clock, AlertTriangle, Pause, Play, TrendingUp, Shield } from 'lucide-react'
import { useStore } from '@/hooks/useStore'

export default function Inventory() {
  const { boxes, batches, getBatchStats, getSupplierStats, suspendBatch, resumeBatch } = useStore()
  const [confirmSuspend, setConfirmSuspend] = useState<string | null>(null)

  const batchStats = getBatchStats()
  const supplierStats = getSupplierStats()

  const totalBoxes = boxes.length
  const inStockBoxes = boxes.filter((b) => b.status === 'in_stock').length
  const inUseBoxes = boxes.filter((b) => b.status === 'in_use').length
  const totalConsumed = boxes.filter((b) => b.status === 'used_up').length * 100 + inUseBoxes * 50
  const avgTurnover = batchStats.length > 0
    ? Math.round(batchStats.reduce((sum, b) => sum + b.turnoverDays, 0) / batchStats.length)
    : 0
  const overallComplaintRate = batchStats.length > 0
    ? batchStats.reduce((sum, b) => sum + b.complaintCount, 0) / Math.max(1, boxes.filter((b) => b.status === 'used_up' || b.status === 'in_use').length * 50)
    : 0

  const maxComplaintRate = Math.max(...batchStats.map((b) => b.complaintRate), 0.01)

  const statCards = [
    { label: '在库箱数', value: inStockBoxes, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '在用箱数', value: inUseBoxes, icon: Clock, color: 'text-success', bg: 'bg-green-50' },
    { label: '总消耗(估)', value: totalConsumed, icon: TrendingUp, color: 'text-amber', bg: 'bg-amber/10' },
    { label: '平均周转天数', value: avgTurnover, icon: BarChart3, color: 'text-tea-600', bg: 'bg-tea-50' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
          <BarChart3 size={20} className="text-amber" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-tea-900">库存总览</h2>
          <p className="text-sm text-tea-500">库存统计、客诉率分析与供应商排行</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-tea-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-tea-400">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <p className={`text-2xl font-mono-num font-semibold ${card.color}`}>{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-tea-100 p-6">
          <h3 className="text-sm font-semibold text-tea-700 mb-5 flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger" />
            批次客诉率
          </h3>
          <div className="space-y-4">
            {batchStats.map((batch) => {
              const pct = (batch.complaintRate / maxComplaintRate) * 100
              const isHigh = batch.complaintRate > 0.1
              const batchInfo = batches.find((b) => b.batchNo === batch.batchNo)
              const isSuspended = batchInfo?.status === 'suspended'

              return (
                <div key={batch.batchNo} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num text-xs text-tea-700">{batch.batchNo}</span>
                      {isSuspended && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-danger">
                          已暂停
                        </span>
                      )}
                    </div>
                    <span className={`font-mono-num text-xs font-semibold ${isHigh ? 'text-danger' : 'text-tea-500'}`}>
                      {(batch.complaintRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-tea-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-danger' : isSuspended ? 'bg-tea-300' : 'bg-amber'}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-tea-400">{batch.supplier} · {batch.complaintCount}次客诉</span>
                    {isSuspended ? (
                      <button
                        onClick={() => resumeBatch(batch.batchNo)}
                        className="text-[10px] text-success hover:underline flex items-center gap-0.5"
                      >
                        <Play size={10} /> 恢复批次
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmSuspend(batch.batchNo)}
                        className="text-[10px] text-danger hover:underline flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pause size={10} /> 暂停批次
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {batchStats.length === 0 && (
              <p className="text-center text-tea-400 text-sm py-4">暂无批次数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-tea-100 p-6">
          <h3 className="text-sm font-semibold text-tea-700 mb-5 flex items-center gap-2">
            <Shield size={16} className="text-tea-500" />
            供应商排行
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tea-100">
                  <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">排名</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">供应商</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">供应箱数</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">客诉数</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">客诉率</th>
                </tr>
              </thead>
              <tbody>
                {supplierStats.map((s, i) => (
                  <tr key={s.supplier} className="border-b border-tea-50 hover:bg-tea-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        i === 0 ? 'bg-amber/20 text-amber' : i === 1 ? 'bg-tea-100 text-tea-600' : 'bg-tea-50 text-tea-400'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-tea-700">{s.supplier}</td>
                    <td className="py-3 px-3 font-mono-num text-tea-500">{s.totalBoxes}</td>
                    <td className="py-3 px-3 font-mono-num text-tea-500">{s.complaintCount}</td>
                    <td className="py-3 px-3">
                      <span className={`font-mono-num text-xs font-semibold ${
                        s.complaintRate > 0.1 ? 'text-danger' : s.complaintRate > 0.05 ? 'text-amber' : 'text-success'
                      }`}>
                        {(s.complaintRate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-tea-100 p-6">
        <h3 className="text-sm font-semibold text-tea-700 mb-5 flex items-center gap-2">
          <Package size={16} className="text-tea-500" />
          批次明细
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tea-100">
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">批次号</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">供应商</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">总箱数</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">在库</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">在用</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">客诉数</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">客诉率</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">周转天数</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">状态</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {batchStats.map((batch) => {
                const batchInfo = batches.find((b) => b.batchNo === batch.batchNo)
                const isSuspended = batchInfo?.status === 'suspended'
                return (
                  <tr key={batch.batchNo} className={`border-b border-tea-50 hover:bg-tea-50/50 transition-colors ${isSuspended ? 'bg-red-50/30' : ''}`}>
                    <td className="py-3 px-3 font-mono-num text-xs text-tea-700">{batch.batchNo}</td>
                    <td className="py-3 px-3 text-tea-700">{batch.supplier}</td>
                    <td className="py-3 px-3 font-mono-num text-tea-500">{batch.totalBoxes}</td>
                    <td className="py-3 px-3 font-mono-num text-blue-600">{batch.inStockBoxes}</td>
                    <td className="py-3 px-3 font-mono-num text-success">{batch.inUseBoxes}</td>
                    <td className="py-3 px-3 font-mono-num text-tea-500">{batch.complaintCount}</td>
                    <td className="py-3 px-3">
                      <span className={`font-mono-num text-xs font-semibold ${
                        batch.complaintRate > 0.1 ? 'text-danger' : batch.complaintRate > 0.05 ? 'text-amber' : 'text-success'
                      }`}>
                        {(batch.complaintRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono-num text-tea-500">{batch.turnoverDays}天</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isSuspended ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'
                      }`}>
                        {isSuspended ? '已暂停' : '正常'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isSuspended ? (
                        <button
                          onClick={() => resumeBatch(batch.batchNo)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-success bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          <Play size={12} /> 恢复
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmSuspend(batch.batchNo)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-danger bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Pause size={12} /> 暂停
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmSuspend && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setConfirmSuspend(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-danger" />
              </div>
              <h3 className="font-semibold text-tea-800 mb-2">确认暂停批次？</h3>
              <p className="text-sm text-tea-500">
                暂停批次 <span className="font-mono-num font-semibold text-tea-700">{confirmSuspend}</span> 后，该批次所有在用箱将自动标记为不可用，吧台将停止使用该批次杯盖。
              </p>
            </div>
            <div className="flex border-t border-tea-100">
              <button
                onClick={() => setConfirmSuspend(null)}
                className="flex-1 py-3 text-sm text-tea-500 hover:bg-tea-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  suspendBatch(confirmSuspend)
                  setConfirmSuspend(null)
                }}
                className="flex-1 py-3 text-sm font-medium text-danger hover:bg-red-50 transition-colors border-l border-tea-100"
              >
                确认暂停
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
