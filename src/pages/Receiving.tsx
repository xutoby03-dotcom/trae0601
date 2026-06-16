import { useState } from 'react'
import { Package, Search, Plus, ChevronDown } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import StatusBadge from '@/components/StatusBadge'

const SUPPLIERS = ['鑫达包装', '嘉诚塑业', '恒丰包装', '旺达塑业']
const SPECS = ['90mm 平盖', '90mm 穹顶盖', '80mm 平盖', '100mm 穹顶盖']
const CUP_TYPES = ['中杯/大杯', '大杯/超大杯', '小杯/中杯']

export default function Receiving() {
  const { boxes, stations, addBox } = useStore()
  const [form, setForm] = useState({
    supplier: '',
    specification: '',
    batchNo: '',
    boxNo: '',
    cupType: '',
    arrivalDate: new Date().toISOString().slice(0, 10),
    station: '',
  })
  const [filterBatch, setFilterBatch] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.supplier || !form.batchNo || !form.boxNo) return
    addBox(form)
    setForm({
      supplier: '',
      specification: '',
      batchNo: '',
      boxNo: '',
      cupType: '',
      arrivalDate: new Date().toISOString().slice(0, 10),
      station: '',
    })
  }

  const filtered = boxes.filter((b) => {
    if (filterBatch && !b.batchNo.toLowerCase().includes(filterBatch.toLowerCase())) return false
    if (filterSupplier && b.supplier !== filterSupplier) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
          <Package size={20} className="text-amber" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-tea-900">开箱入库</h2>
          <p className="text-sm text-tea-500">录入杯盖箱信息，建立批次追踪起点</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-tea-100 p-6 space-y-5">
            <h3 className="text-sm font-semibold text-tea-700 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-amber" />
              新增入库
            </h3>

            <div>
              <label className="block text-xs font-medium text-tea-500 mb-1.5">供应商 *</label>
              <div className="relative">
                <select
                  value={form.supplier}
                  onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-tea-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber appearance-none"
                >
                  <option value="">选择供应商</option>
                  {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-tea-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-tea-500 mb-1.5">规格</label>
              <div className="relative">
                <select
                  value={form.specification}
                  onChange={(e) => setForm((f) => ({ ...f, specification: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-tea-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber appearance-none"
                >
                  <option value="">选择规格</option>
                  {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-tea-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-tea-500 mb-1.5">批次号 *</label>
                <input
                  type="text"
                  value={form.batchNo}
                  onChange={(e) => setForm((f) => ({ ...f, batchNo: e.target.value }))}
                  placeholder="如 XD-2026-0520"
                  className="w-full px-3 py-2.5 rounded-lg border border-tea-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tea-500 mb-1.5">箱号 *</label>
                <input
                  type="text"
                  value={form.boxNo}
                  onChange={(e) => setForm((f) => ({ ...f, boxNo: e.target.value }))}
                  placeholder="如 XD-0520-03"
                  className="w-full px-3 py-2.5 rounded-lg border border-tea-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber font-mono-num"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-tea-500 mb-1.5">适配杯型</label>
              <div className="relative">
                <select
                  value={form.cupType}
                  onChange={(e) => setForm((f) => ({ ...f, cupType: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-tea-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber appearance-none"
                >
                  <option value="">选择适配杯型</option>
                  {CUP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-tea-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-tea-500 mb-1.5">到货日期</label>
                <input
                  type="date"
                  value={form.arrivalDate}
                  onChange={(e) => setForm((f) => ({ ...f, arrivalDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-tea-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tea-500 mb-1.5">放置吧台</label>
                <div className="relative">
                  <select
                    value={form.station}
                    onChange={(e) => setForm((f) => ({ ...f, station: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-tea-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber appearance-none"
                  >
                    <option value="">暂不指定</option>
                    {stations.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-tea-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber text-white font-medium rounded-lg hover:bg-amber-dark transition-colors shadow-sm text-sm"
            >
              确认入库
            </button>
          </form>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-tea-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-tea-700">入库记录</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tea-400" />
                  <input
                    type="text"
                    value={filterBatch}
                    onChange={(e) => setFilterBatch(e.target.value)}
                    placeholder="搜索批次号"
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-tea-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber w-36 font-mono-num"
                  />
                </div>
                <select
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-tea-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber"
                >
                  <option value="">全部供应商</option>
                  {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tea-100">
                    <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">批次号</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">箱号</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">供应商</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">规格</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">杯型</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">到货</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">吧台</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-tea-500">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((box) => (
                    <tr key={box.id} className="border-b border-tea-50 hover:bg-tea-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono-num text-xs text-tea-700">{box.batchNo}</td>
                      <td className="py-3 px-3 font-mono-num text-xs text-tea-700">{box.boxNo}</td>
                      <td className="py-3 px-3 text-tea-700">{box.supplier}</td>
                      <td className="py-3 px-3 text-tea-500">{box.specification || '-'}</td>
                      <td className="py-3 px-3 text-tea-500">{box.cupType || '-'}</td>
                      <td className="py-3 px-3 font-mono-num text-xs text-tea-500">{box.arrivalDate}</td>
                      <td className="py-3 px-3 text-tea-500">{box.station || '-'}</td>
                      <td className="py-3 px-3"><StatusBadge status={box.status} /></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-tea-400 text-xs">暂无匹配记录</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
