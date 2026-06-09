import { useState } from 'react'
import { Package, FileText, Circle, Droplets, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react'
import { useConsumableStore } from '@/stores/consumableStore'
import type { Consumable } from '@/types'
import Modal from '@/components/Modal'
import { cn } from '@/lib/utils'

const categories = [
  { key: 'paper' as const, label: '纸类', icon: FileText, accent: 'text-sky-400' },
  { key: 'toner' as const, label: '硒鼓', icon: Circle, accent: 'text-violet-400' },
  { key: 'ink_cartridge' as const, label: '墨盒', icon: Droplets, accent: 'text-rose-400' },
]

interface AdjustForm {
  consumable: Consumable | null
  type: 'in' | 'out'
  quantity: number
  reason: string
}

const emptyForm: AdjustForm = { consumable: null, type: 'in', quantity: 1, reason: '' }

export default function Inventory() {
  const { consumables, stockRecords, adjustStock } = useConsumableStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<AdjustForm>(emptyForm)

  const openAdjust = (c: Consumable, type: 'in' | 'out') => {
    setForm({ consumable: c, type, quantity: 1, reason: '' })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.consumable || form.quantity <= 0 || !form.reason.trim()) return
    adjustStock(form.consumable.id, form.type, form.quantity, form.reason.trim())
    setModalOpen(false)
  }

  const recentRecords = [...stockRecords].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 20)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="text-amber-500" size={28} />
        <h1 className="text-2xl font-bold text-white">耗材库存</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categories.map(({ key, label, icon: Icon, accent }) => {
          const items = consumables.filter((c) => c.category === key)
          return (
            <div key={key} className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon size={20} className={accent} />
                <h2 className="text-lg font-semibold text-white">{label}</h2>
                <span className="text-xs text-white/40 ml-1">({items.length})</span>
              </div>
              <div className="space-y-3">
                {items.map((c) => {
                  const ratio = c.threshold > 0 ? Math.min(c.quantity / c.threshold, 2) : 0
                  const isLow = c.quantity <= c.threshold
                  const barWidth = Math.min(ratio * 50, 100)
                  return (
                    <div
                      key={c.id}
                      className="bg-[#1a1a35] border border-white/10 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-white font-medium text-sm">{c.name}</h3>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            isLow ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                          )}
                        >
                          {isLow ? '库存不足' : '库存正常'}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">{c.quantity}</span>
                        <span className="text-white/50 text-sm">{c.unit}</span>
                      </div>

                      <div className="relative">
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={cn(
                              'h-2 rounded-full transition-all',
                              isLow ? 'bg-amber-500' : 'bg-green-500'
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div
                          className="absolute top-0 h-2 w-0.5 bg-white/40"
                          style={{ left: '50%' }}
                        />
                      </div>
                      <p className="text-xs text-white/30">预警阈值: {c.threshold} {c.unit}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {c.compatibleModels.map((m) => (
                          <span
                            key={m}
                            className="text-xs bg-white/5 text-white/60 px-2 py-0.5 rounded"
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => openAdjust(c, 'in')}
                          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/25 py-1.5 rounded-lg transition"
                        >
                          <ArrowUpCircle size={14} /> 入库
                        </button>
                        <button
                          onClick={() => openAdjust(c, 'out')}
                          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 py-1.5 rounded-lg transition"
                        >
                          <ArrowDownCircle size={14} /> 出库
                        </button>
                      </div>
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <p className="text-center text-white/20 text-sm py-4">暂无数据</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-[#1a1a35] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-amber-500" />
          <h2 className="text-lg font-semibold text-white">出入库记录</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-2 font-medium">日期</th>
                <th className="text-left py-2 font-medium">耗材名称</th>
                <th className="text-left py-2 font-medium">类型</th>
                <th className="text-right py-2 font-medium">数量</th>
                <th className="text-left py-2 font-medium">原因</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((r) => {
                const c = consumables.find((item) => item.id === r.consumableId)
                return (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-2 text-white/50">
                      {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-2 text-white/80">{c?.name ?? '—'}</td>
                    <td className="py-2">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          r.type === 'in'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {r.type === 'in' ? '入库' : '出库'}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'py-2 text-right font-medium',
                        r.type === 'in' ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {r.type === 'in' ? '+' : '-'}{r.quantity}
                    </td>
                    <td className="py-2 text-white/50">{r.reason}</td>
                  </tr>
                )
              })}
              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-white/20 py-6">暂无记录</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.type === 'in' ? '入库' : '出库'}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {form.type === 'in' ? (
              <ArrowUpCircle size={20} className="text-green-400" />
            ) : (
              <ArrowDownCircle size={20} className="text-red-400" />
            )}
            <span className="text-white font-medium">{form.consumable?.name}</span>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">数量</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
              className="w-full bg-[#12122a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">原因</label>
            <input
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="请输入原因..."
              className="w-full bg-[#12122a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-white/60 hover:text-white text-sm rounded-lg border border-white/10 hover:border-white/20 transition"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={form.quantity <= 0 || !form.reason.trim()}
              className={cn(
                'px-4 py-2 font-semibold text-sm rounded-lg transition',
                form.type === 'in'
                  ? 'bg-green-500 hover:bg-green-600 text-[#12122a]'
                  : 'bg-red-500 hover:bg-red-600 text-white',
                (form.quantity <= 0 || !form.reason.trim()) && 'opacity-50 cursor-not-allowed'
              )}
            >
              确认{form.type === 'in' ? '入库' : '出库'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
