import { useState, useEffect } from 'react'
import { AlertTriangle, Search, ChevronRight, Eye } from 'lucide-react'
import { useStore, type ProblemType } from '@/hooks/useStore'

const PROBLEM_LABELS: Record<ProblemType, string> = {
  leak: '漏杯',
  burst: '爆盖',
  loose: '压不紧',
}

export default function Complaints() {
  const { complaints, orders, boxes, addComplaint, getOrdersByBatchNo, getStationById, getBoxById } = useStore()
  const [orderNo, setOrderNo] = useState('')
  const [problemType, setProblemType] = useState<ProblemType>('leak')
  const [activeTab, setActiveTab] = useState<'records' | 'trace'>('records')
  const [traceBatchNo, setTraceBatchNo] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const matchedOrder = orders.find((o) => o.orderNo === orderNo.trim())
  const orderExists = !!matchedOrder

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderExists) return
    addComplaint(orderNo.trim(), problemType)

    const box = getBoxById(matchedOrder.boxId)
    if (box) {
      setTraceBatchNo(box.batchNo)
      setActiveTab('trace')
    }

    setOrderNo('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
  }

  const tracedOrders = traceBatchNo ? getOrdersByBatchNo(traceBatchNo) : []
  const tracedBatchBoxes = traceBatchNo ? boxes.filter((b) => b.batchNo === traceBatchNo) : []
  const tracedComplaints = traceBatchNo
    ? complaints.filter((c) => tracedBatchBoxes.some((b) => b.id === c.orderBoxId))
    : []

  const handleTraceFromComplaint = (complaintOrderNo: string) => {
    const order = orders.find((o) => o.orderNo === complaintOrderNo)
    if (order) {
      const box = getBoxById(order.boxId)
      if (box) {
        setTraceBatchNo(box.batchNo)
        setActiveTab('trace')
      }
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
          <AlertTriangle size={20} className="text-danger" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-tea-900">客诉追踪</h2>
          <p className="text-sm text-tea-500">登记客诉信息，反查同批次影响订单</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-tea-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-tea-700 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-danger" />
          客诉登记
        </h3>
        <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-tea-500 mb-1.5">订单号</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tea-400" />
              <input
                type="text"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="输入订单号，如 DD20260601001"
                className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-tea-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber font-mono-num"
              />
            </div>
            {orderNo && !orderExists && (
              <p className="text-xs text-danger mt-1">未找到该订单，请先在吧台页登记出杯</p>
            )}
            {orderExists && matchedOrder && (
              <div className="mt-1.5 px-2.5 py-1.5 bg-amber/5 rounded-lg text-xs text-tea-600 flex items-center gap-2">
                <span className="text-tea-400">批次:</span>
                <span className="font-mono-num font-medium text-tea-800">
                  {getBoxById(matchedOrder.boxId)?.batchNo || '-'}
                </span>
                <span className="text-tea-300">·</span>
                <span className="text-tea-400">吧台:</span>
                <span>{getStationById(matchedOrder.stationId)?.name || '-'}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-tea-500 mb-1.5">问题类型</label>
            <select
              value={problemType}
              onChange={(e) => setProblemType(e.target.value as ProblemType)}
              className="px-4 py-2.5 rounded-lg border border-tea-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber min-w-[120px]"
            >
              {(Object.entries(PROBLEM_LABELS) as [ProblemType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!orderNo || !orderExists}
            className="px-6 py-2.5 bg-danger text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {submitted ? '已登记 ✓' : '提交客诉'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-tea-100 overflow-hidden">
        <div className="flex border-b border-tea-100">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'records' ? 'text-amber border-b-2 border-amber bg-amber/5' : 'text-tea-400 hover:text-tea-600'
            }`}
          >
            客诉记录 ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('trace')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'trace' ? 'text-amber border-b-2 border-amber bg-amber/5' : 'text-tea-400 hover:text-tea-600'
            }`}
          >
            同批次反查
          </button>
        </div>

        {activeTab === 'records' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tea-50">
                  <th className="text-left py-3 px-5 text-xs font-medium text-tea-500">订单号</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-tea-500">问题类型</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-tea-500">所属批次</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-tea-500">箱号</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-tea-500">登记时间</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-tea-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => {
                  const box = boxes.find((b) => b.id === c.orderBoxId)
                  return (
                    <tr key={c.id} className="border-b border-tea-50 hover:bg-tea-50/50 transition-colors">
                      <td className="py-3 px-5 font-mono-num text-xs text-tea-700">{c.orderNo}</td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          c.problemType === 'leak' ? 'bg-blue-100 text-blue-700' :
                          c.problemType === 'burst' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {PROBLEM_LABELS[c.problemType]}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-mono-num text-xs text-tea-500">{box?.batchNo || '-'}</td>
                      <td className="py-3 px-5 font-mono-num text-xs text-tea-500">{box?.boxNo || '-'}</td>
                      <td className="py-3 px-5 font-mono-num text-xs text-tea-400">
                        {new Date(c.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-5">
                        <button
                          onClick={() => handleTraceFromComplaint(c.orderNo)}
                          className="inline-flex items-center gap-1 text-xs text-amber hover:text-amber-dark transition-colors"
                        >
                          <Eye size={12} />
                          反查同批次
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-tea-400 text-xs">暂无客诉记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'trace' && (
          <div className="p-6">
            <div className="mb-5">
              <label className="block text-xs font-medium text-tea-500 mb-1.5">输入批次号反查</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={traceBatchNo}
                  onChange={(e) => setTraceBatchNo(e.target.value)}
                  placeholder="如 XD-2026-0520"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-tea-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber font-mono-num"
                />
              </div>
              <p className="text-xs text-tea-400 mt-1.5">
                可用批次：{boxes.map((b) => b.batchNo).filter((v, i, a) => a.indexOf(v) === i).join('、')}
              </p>
            </div>

            {traceBatchNo && tracedOrders.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="bg-tea-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-mono-num font-semibold text-tea-800">{tracedOrders.length}</p>
                    <p className="text-xs text-tea-500 mt-1">同批次订单</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-mono-num font-semibold text-danger">{tracedComplaints.length}</p>
                    <p className="text-xs text-tea-500 mt-1">客诉数量</p>
                  </div>
                  <div className="bg-amber/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-mono-num font-semibold text-amber">
                      {tracedOrders.length > 0 ? (tracedComplaints.length / tracedOrders.length * 100).toFixed(1) : '0.0'}%
                    </p>
                    <p className="text-xs text-tea-500 mt-1">客诉率</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-tea-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-tea-500">订单号</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-tea-500">吧台</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-tea-500">箱号</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-tea-500">出杯时间</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-tea-500">客诉状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracedOrders.map((order) => {
                        const station = getStationById(order.stationId)
                        const box = getBoxById(order.boxId)
                        const hasComplaint = complaints.some((c) => c.orderNo === order.orderNo)
                        const complaint = complaints.find((c) => c.orderNo === order.orderNo)
                        return (
                          <tr key={order.id} className={`border-b border-tea-50 ${hasComplaint ? 'bg-red-50/50' : 'hover:bg-tea-50/50'} transition-colors`}>
                            <td className="py-2.5 px-4 font-mono-num text-xs text-tea-700">{order.orderNo}</td>
                            <td className="py-2.5 px-4 text-tea-500">{station?.name || '-'}</td>
                            <td className="py-2.5 px-4 font-mono-num text-xs text-tea-400">{box?.boxNo || '-'}</td>
                            <td className="py-2.5 px-4 font-mono-num text-xs text-tea-400">
                              {new Date(order.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-2.5 px-4">
                              {hasComplaint ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
                                  <AlertTriangle size={12} />
                                  {complaint ? PROBLEM_LABELS[complaint.problemType] : '有客诉'}
                                </span>
                              ) : (
                                <span className="text-xs text-tea-300">正常</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {traceBatchNo && tracedOrders.length === 0 && (
              <div className="py-8 text-center text-tea-400 text-sm">未找到该批次的订单记录</div>
            )}

            {!traceBatchNo && (
              <div className="py-12 text-center text-tea-300 text-sm">
                请输入批次号，或从客诉记录点击"反查同批次"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
