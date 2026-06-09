import { useState } from 'react'
import { Printer, Plus, Search, Edit2, MapPin, User, Truck, Tag } from 'lucide-react'
import { usePrinterStore } from '@/stores/printerStore'
import type { Printer as PrinterType, PrinterStatus } from '@/types'
import Modal from '@/components/Modal'
import { cn } from '@/lib/utils'

const statusConfig: Record<PrinterStatus, { label: string; color: string }> = {
  normal: { label: '正常', color: 'bg-green-500/20 text-green-400' },
  low_supply: { label: '耗材不足', color: 'bg-yellow-500/20 text-yellow-400' },
  fault: { label: '故障', color: 'bg-red-500/20 text-red-400' },
  procurement: { label: '采购中', color: 'bg-blue-500/20 text-blue-400' },
}

const emptyForm = {
  name: '',
  location: '',
  model: '',
  consumableModels: '',
  responsiblePerson: '',
  supplier: '',
  status: 'normal' as PrinterStatus,
}

export default function Printers() {
  const { printers, addPrinter, updatePrinter, updatePrinterStatus } = usePrinterStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PrinterStatus | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = printers.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (p: PrinterType) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      location: p.location,
      model: p.model,
      consumableModels: p.consumableModels.join(', '),
      responsiblePerson: p.responsiblePerson,
      supplier: p.supplier,
      status: p.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    const data = {
      name: form.name,
      location: form.location,
      model: form.model,
      consumableModels: form.consumableModels.split(',').map((s) => s.trim()).filter(Boolean),
      responsiblePerson: form.responsiblePerson,
      supplier: form.supplier,
      status: form.status,
    }
    if (editingId) {
      updatePrinter(editingId, data)
    } else {
      addPrinter({
        id: 'p_' + Date.now(),
        createdAt: new Date().toISOString(),
        ...data,
      })
    }
    setModalOpen(false)
  }

  const handleField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Printer className="text-amber-500" size={28} />
          <h1 className="text-2xl font-bold text-white">打印机管理</h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-[#12122a] font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} />
          登记打印机
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索名称/位置..."
            className="w-full pl-9 pr-3 py-2 bg-[#12122a] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PrinterStatus | 'all')}
          className="bg-[#12122a] border border-white/10 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500/50 transition"
        >
          <option value="all">全部状态</option>
          <option value="normal">正常</option>
          <option value="low_supply">耗材不足</option>
          <option value="fault">故障</option>
          <option value="procurement">采购中</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const sc = statusConfig[p.status]
          return (
            <div
              key={p.id}
              className="bg-[#1a1a35] border border-white/10 rounded-xl p-5 hover:border-white/20 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold">{p.name}</h3>
                  <p className="text-white/50 text-sm flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {p.location}
                  </p>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded-full font-medium', sc.color)}>
                  {sc.label}
                </span>
              </div>

              <p className="text-white/60 text-sm">{p.model}</p>

              <div className="flex flex-wrap gap-1.5">
                {p.consumableModels.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 text-xs bg-white/5 text-white/70 px-2 py-0.5 rounded"
                  >
                    <Tag size={10} /> {m}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1"><User size={12} /> {p.responsiblePerson}</span>
                <span className="flex items-center gap-1"><Truck size={12} /> {p.supplier}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <button
                  onClick={() => openEdit(p)}
                  className="flex items-center gap-1 text-amber-500 hover:text-amber-400 text-sm transition"
                >
                  <Edit2 size={14} /> 编辑
                </button>
                <select
                  value={p.status}
                  onChange={(e) => updatePrinterStatus(p.id, e.target.value as PrinterStatus)}
                  className="bg-[#12122a] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500/50 transition"
                >
                  <option value="normal">正常</option>
                  <option value="low_supply">耗材不足</option>
                  <option value="fault">故障</option>
                  <option value="procurement">采购中</option>
                </select>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-white/30 py-12">未找到匹配的打印机</p>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '编辑打印机' : '登记打印机'}
      >
        <div className="space-y-4">
          {[
            { key: 'name', label: '名称' },
            { key: 'location', label: '位置' },
            { key: 'model', label: '型号' },
            { key: 'consumableModels', label: '耗材型号（逗号分隔）' },
            { key: 'responsiblePerson', label: '负责人' },
            { key: 'supplier', label: '供应商' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm text-white/60 mb-1">{label}</label>
              <input
                value={(form as Record<string, string>)[key]}
                onChange={(e) => handleField(key, e.target.value)}
                className="w-full bg-[#12122a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-white/60 mb-1">状态</label>
            <select
              value={form.status}
              onChange={(e) => handleField('status', e.target.value)}
              className="w-full bg-[#12122a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 transition"
            >
              <option value="normal">正常</option>
              <option value="low_supply">耗材不足</option>
              <option value="fault">故障</option>
              <option value="procurement">采购中</option>
            </select>
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-[#12122a] font-semibold text-sm rounded-lg transition"
            >
              {editingId ? '保存' : '登记'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
