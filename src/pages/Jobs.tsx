import { useState } from 'react'
import { Briefcase, Plus, MapPin, User, Clock, Trash2, Edit3 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Job, SettlementCycle } from '@/types'
import { formatMoney, JOB_COLORS } from '@/utils/helpers'
import Drawer from '@/components/Drawer'

const CYCLE_LABELS: Record<SettlementCycle, string> = {
  daily: '日结',
  weekly: '周结',
  monthly: '月结',
}

const emptyForm = {
  name: '',
  hourlyRate: '',
  settlementCycle: 'daily' as SettlementCycle,
  contact: '',
  location: '',
  color: JOB_COLORS[0],
}

export default function Jobs() {
  const { jobs, addJob, updateJob, deleteJob } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDrawerOpen(true)
  }

  const openEdit = (job: Job) => {
    setEditingId(job.id)
    setForm({
      name: job.name,
      hourlyRate: String(job.hourlyRate),
      settlementCycle: job.settlementCycle,
      contact: job.contact,
      location: job.location,
      color: job.color,
    })
    setDrawerOpen(true)
  }

  const handleSubmit = () => {
    const name = form.name.trim()
    if (!name) return
    const hourlyRate = parseFloat(form.hourlyRate) || 0
    const data = {
      name,
      hourlyRate,
      settlementCycle: form.settlementCycle,
      contact: form.contact.trim(),
      location: form.location.trim(),
      color: form.color,
    }
    if (editingId) {
      updateJob(editingId, data)
    } else {
      addJob(data)
    }
    setDrawerOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteJob(id)
    setConfirmDeleteId(null)
  }

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-stone-900">兼职管理</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 active:scale-95 transition-all"
        >
          <Plus size={16} />
          添加
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Briefcase size={48} strokeWidth={1.5} className="mb-3 text-stone-300" />
          <p className="text-sm">暂无兼职，点击添加</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="relative flex bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100"
            >
              <div className="w-1.5 shrink-0" style={{ backgroundColor: job.color }} />
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-stone-900 truncate">{job.name}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(job)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-orange-500 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    {confirmDeleteId === job.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(job.id)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-orange-500">{formatMoney(job.hourlyRate)}</span>
                  <span className="text-xs">/小时</span>
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${job.color}18`,
                      color: job.color,
                    }}
                  >
                    <Clock size={10} className="inline mr-0.5 -mt-0.5" />
                    {CYCLE_LABELS[job.settlementCycle]}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  {job.contact && (
                    <span className="flex items-center gap-1 truncate">
                      <User size={12} className="text-stone-400" />
                      {job.contact}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={12} className="text-stone-400" />
                      {job.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? '编辑兼职' : '添加兼职'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="输入兼职名称"
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">时薪 (元)</label>
            <input
              type="number"
              value={form.hourlyRate}
              onChange={(e) => updateField('hourlyRate', e.target.value)}
              placeholder="输入时薪"
              min="0"
              step="0.1"
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">结算周期</label>
            <select
              value={form.settlementCycle}
              onChange={(e) => updateField('settlementCycle', e.target.value as SettlementCycle)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            >
              <option value="daily">日结</option>
              <option value="weekly">周结</option>
              <option value="monthly">月结</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">联系人</label>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => updateField('contact', e.target.value)}
              placeholder="输入联系人"
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">地点</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="输入工作地点"
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">颜色标签</label>
            <div className="flex flex-wrap gap-2">
              {JOB_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateField('color', c)}
                  className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: form.color === c ? '#292524' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all"
          >
            {editingId ? '保存修改' : '添加兼职'}
          </button>
        </div>
      </Drawer>
    </div>
  )
}
