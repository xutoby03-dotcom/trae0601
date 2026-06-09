import { useState, useMemo } from 'react'
import { ShoppingCart, Plus, Package, Truck, CheckCircle2, DollarSign, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProcurementStore } from '@/stores/procurementStore'
import { useConsumableStore } from '@/stores/consumableStore'
import type { Procurement, ProcurementStatus } from '@/types'
import Modal from '@/components/Modal'

const statusSteps: ProcurementStatus[] = ['ordered', 'arrived', 'installed']
const statusLabels: Record<ProcurementStatus, string> = {
  ordered: '已下单',
  arrived: '已到货',
  installed: '已安装',
}
const statusIcons: Record<ProcurementStatus, React.ReactNode> = {
  ordered: <Clock className="h-3.5 w-3.5" />,
  arrived: <Truck className="h-3.5 w-3.5" />,
  installed: <CheckCircle2 className="h-3.5 w-3.5" />,
}

export default function Procurement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    consumableId: '',
    quantity: 1,
    supplier: '',
    cost: 0,
  })

  const { procurements, addProcurement, updateProcurementStatus } = useProcurementStore()
  const { consumables } = useConsumableStore()

  const consumableMap = useMemo(() => {
    const map: Record<string, string> = {}
    consumables.forEach((c) => { map[c.id] = c.name })
    return map
  }, [consumables])

  const orderedCount = procurements.filter((p) => p.status === 'ordered').length
  const arrivedCount = procurements.filter((p) => p.status === 'arrived').length
  const installedCount = procurements.filter((p) => p.status === 'installed').length
  const totalCost = procurements.reduce((sum, p) => sum + p.cost, 0)

  const handleSubmit = () => {
    if (!form.consumableId || !form.supplier || form.quantity <= 0 || form.cost <= 0) return
    const procurement: Procurement = {
      id: 'pr_' + Date.now(),
      consumableId: form.consumableId,
      quantity: form.quantity,
      supplier: form.supplier,
      cost: form.cost,
      status: 'ordered',
      orderedAt: new Date().toISOString(),
    }
    addProcurement(procurement)
    setForm({ consumableId: '', quantity: 1, supplier: '', cost: 0 })
    setModalOpen(false)
  }

  const handleAdvance = (id: string, currentStatus: ProcurementStatus) => {
    const nextMap: Record<ProcurementStatus, ProcurementStatus> = {
      ordered: 'arrived',
      arrived: 'installed',
      installed: 'installed',
    }
    updateProcurementStatus(id, nextMap[currentStatus])
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-amber-400" />
          采购跟踪
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          新增采购
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-[#1a1a35] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/50">已下单</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400">{orderedCount}</div>
        </div>
        <div className="rounded-xl bg-[#1a1a35] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/50">已到货</span>
            <Truck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400">{arrivedCount}</div>
        </div>
        <div className="rounded-xl bg-[#1a1a35] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/50">已安装</span>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{installedCount}</div>
          <div className="mt-2 flex items-center gap-1 text-sm text-white/40">
            <DollarSign className="h-3.5 w-3.5" />
            总费用 ¥{totalCost.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {procurements.map((proc) => {
          const currentStep = statusSteps.indexOf(proc.status)
          return (
            <div
              key={proc.id}
              className="rounded-xl bg-[#1a1a35] border border-white/5 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-amber-400" />
                    <span className="font-semibold text-white">
                      {consumableMap[proc.consumableId] || '未知耗材'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span>数量：{proc.quantity}</span>
                    <span>供应商：{proc.supplier}</span>
                    <span className="text-amber-400 font-medium">¥{proc.cost.toLocaleString()}</span>
                  </div>
                </div>
                {proc.status !== 'installed' && (
                  <button
                    onClick={() => handleAdvance(proc.id, proc.status)}
                    className="shrink-0 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/30"
                  >
                    {proc.status === 'ordered' ? '确认到货' : '确认安装'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-0">
                {statusSteps.map((step, idx) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full border-2 transition',
                          idx <= currentStep
                            ? 'border-amber-400 bg-amber-400 text-[#0f0f23]'
                            : 'border-white/20 bg-transparent text-white/20'
                        )}
                      >
                        {statusIcons[step]}
                      </div>
                      <span
                        className={cn(
                          'mt-1 text-xs',
                          idx <= currentStep ? 'text-white/80' : 'text-white/30'
                        )}
                      >
                        {statusLabels[step]}
                      </span>
                      <span className="mt-0.5 text-[10px] text-white/25">
                        {idx === 0 ? formatDate(proc.orderedAt) : idx === 1 ? formatDate(proc.arrivedAt) : formatDate(proc.installedAt)}
                      </span>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 flex-1 mx-1 -mt-5',
                          idx < currentStep ? 'bg-amber-400' : 'bg-white/10'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {procurements.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/30">
            暂无采购记录
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新增采购">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-white/60">耗材</label>
            <select
              value={form.consumableId}
              onChange={(e) => setForm({ ...form, consumableId: e.target.value })}
              className="w-full rounded-lg bg-[#12122a] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/50"
            >
              <option value="">请选择耗材</option>
              {consumables.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">数量</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full rounded-lg bg-[#12122a] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">供应商</label>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              placeholder="输入供应商名称"
              className="w-full rounded-lg bg-[#12122a] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-400/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">费用（¥）</label>
            <input
              type="number"
              min={0}
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
              className="w-full rounded-lg bg-[#12122a] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/50"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-400"
          >
            提交采购
          </button>
        </div>
      </Modal>
    </div>
  )
}
