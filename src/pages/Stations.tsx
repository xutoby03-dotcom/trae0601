import { useState } from 'react'
import { Coffee, Play, X, Plus, Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import StatusBadge from '@/components/StatusBadge'

export default function Stations() {
  const { stations, boxes, startUsingBox, addOrder, getBoxById } = useStore()
  const [switchingStationId, setSwitchingStationId] = useState<string | null>(null)
  const [orderInputs, setOrderInputs] = useState<Record<string, string>>({})
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const availableBoxes = boxes.filter((b) => b.status === 'in_stock')

  const handleStart = (boxId: string) => {
    if (switchingStationId) {
      startUsingBox(switchingStationId, boxId)
      setSwitchingStationId(null)
    }
  }

  const handleAddOrder = (stationId: string) => {
    const orderNo = orderInputs[stationId]?.trim()
    if (!orderNo) return
    addOrder(orderNo, stationId)
    setOrderInputs((prev) => ({ ...prev, [stationId]: '' }))
    setJustAdded(orderNo)
    setTimeout(() => setJustAdded(null), 1500)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
          <Coffee size={20} className="text-amber" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-tea-900">吧台管理</h2>
          <p className="text-sm text-tea-500">查看吧台使用状态，切换杯盖箱批次</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stations.map((station) => {
          const currentBox = station.currentBoxId ? getBoxById(station.currentBoxId) : null
          const isActive = !!currentBox

          return (
            <div
              key={station.id}
              className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${
                isActive ? 'border-green-200' : 'border-tea-100'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-tea-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-tea-300'}`} />
                  <h3 className="font-semibold text-tea-800">{station.name}</h3>
                </div>
                <StatusBadge status={currentBox?.status || 'in_stock'} />
              </div>

              <div className="px-6 py-4 space-y-3">
                {currentBox ? (
                  <>
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <span className="text-tea-400">批次号</span>
                      <span className="font-mono-num text-tea-700 text-right">{currentBox.batchNo}</span>
                      <span className="text-tea-400">箱号</span>
                      <span className="font-mono-num text-tea-700 text-right">{currentBox.boxNo}</span>
                      <span className="text-tea-400">供应商</span>
                      <span className="text-tea-700 text-right">{currentBox.supplier}</span>
                      <span className="text-tea-400">开始使用</span>
                      <span className="font-mono-num text-tea-500 text-right">
                        {new Date(station.startedAt!).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="text-tea-400">已消耗</span>
                      <span className="font-mono-num text-amber font-semibold text-right">{station.consumedCount} 杯</span>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-tea-400 text-sm">当前无使用中的杯盖箱</p>
                    <p className="text-tea-300 text-xs mt-1">请选择箱号开始使用</p>
                  </div>
                )}
              </div>

              <div className="px-6 pb-4 space-y-3">
                <button
                  onClick={() => setSwitchingStationId(station.id)}
                  className="w-full py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors bg-tea-50 text-tea-600 hover:bg-amber/10 hover:text-amber"
                >
                  <Play size={14} />
                  切换杯盖箱
                </button>

                {currentBox && (
                  <div className="border-t border-tea-50 pt-3">
                    <label className="block text-xs font-medium text-tea-500 mb-2">出杯登记</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={orderInputs[station.id] || ''}
                        onChange={(e) => setOrderInputs((prev) => ({ ...prev, [station.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOrder(station.id)}
                        placeholder="输入订单号"
                        className="flex-1 px-3 py-2 rounded-lg border border-tea-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber font-mono-num"
                      />
                      <button
                        onClick={() => handleAddOrder(station.id)}
                        disabled={!orderInputs[station.id]?.trim()}
                        className="px-3 py-2 bg-amber text-white rounded-lg text-xs font-medium hover:bg-amber-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {justAdded && orderInputs[station.id] ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                    {justAdded && (
                      <p className="text-xs text-success mt-1.5 flex items-center gap-1">
                        <Check size={12} /> 已登记 {justAdded}，批次 {currentBox.batchNo}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {switchingStationId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSwitchingStationId(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-tea-100">
              <h3 className="font-semibold text-tea-800">选择杯盖箱</h3>
              <button onClick={() => setSwitchingStationId(null)} className="text-tea-400 hover:text-tea-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
              {availableBoxes.length === 0 ? (
                <p className="text-center text-tea-400 py-8 text-sm">暂无可用的在库杯盖箱，请先入库</p>
              ) : (
                availableBoxes.map((box) => (
                  <button
                    key={box.id}
                    onClick={() => handleStart(box.id)}
                    className="w-full text-left p-4 rounded-lg border border-tea-100 hover:border-amber hover:bg-amber/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-num text-sm font-semibold text-tea-800">{box.boxNo}</span>
                      <span className="text-xs text-tea-400 group-hover:text-amber transition-colors">点击选用 →</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-xs">
                      <span className="text-tea-400">批次号</span>
                      <span className="font-mono-num text-tea-600 text-right">{box.batchNo}</span>
                      <span className="text-tea-400">供应商</span>
                      <span className="text-tea-600 text-right">{box.supplier}</span>
                      <span className="text-tea-400">规格</span>
                      <span className="text-tea-600 text-right">{box.specification || '-'}</span>
                      <span className="text-tea-400">适配杯型</span>
                      <span className="text-tea-600 text-right">{box.cupType || '-'}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
