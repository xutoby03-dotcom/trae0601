import { useState } from 'react'
import { useStore } from '@/store'
import {
  ClipboardList,
  Search,
  Send,
  Flame,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function Requisition() {
  const { consumables, requisitions, addRequisition, currentRole } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    consumableId: '',
    projectName: '',
    quantity: 1,
    purpose: '',
    advisor: '',
    returnNote: '',
    applicant: currentRole === 'student' ? '张三' : '李老师',
  })
  const [searchConsumable, setSearchConsumable] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const myRequisitions = requisitions
    .filter((r) => {
      if (currentRole === 'student') return r.applicant === '张三'
      return true
    })
    .filter((r) => !search || r.projectName.includes(search) || r.applicant.includes(search))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const filteredConsumables = consumables.filter(
    (c) =>
      !searchConsumable ||
      c.name.includes(searchConsumable) ||
      c.specification.includes(searchConsumable)
  )

  const selectedConsumable = consumables.find((c) => c.id === form.consumableId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.consumableId) return
    addRequisition({
      consumableId: form.consumableId,
      projectName: form.projectName,
      quantity: form.quantity,
      purpose: form.purpose,
      advisor: form.advisor,
      returnNote: form.returnNote,
      applicant: form.applicant,
    })
    setForm({
      consumableId: '',
      projectName: '',
      quantity: 1,
      purpose: '',
      advisor: '',
      returnNote: '',
      applicant: currentRole === 'student' ? '张三' : '李老师',
    })
    setShowForm(false)
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: '待审批', color: 'badge-info', icon: Clock },
    hazardous_pending: { label: '待二次审批', color: 'badge-danger', icon: AlertTriangle },
    approved: { label: '已通过', color: 'badge-safe', icon: CheckCircle },
    rejected: { label: '已驳回', color: 'badge-danger', icon: XCircle },
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-lab-900">领用申请</h1>
          <p className="text-sm text-gray-500 mt-1">提交耗材领用申请，查看申请状态</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn('flex items-center gap-2', showForm ? 'btn-ghost' : 'btn-primary')}
        >
          {showForm ? <XCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {showForm ? '取消' : '新建申请'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 animate-fade-in">
          <h2 className="section-title mb-4">领用申请表</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">选择耗材 *</label>
              <div className="relative">
                <input
                  className="input-field"
                  placeholder="搜索耗材名称或规格..."
                  value={selectedConsumable ? selectedConsumable.name : searchConsumable}
                  onChange={(e) => {
                    setSearchConsumable(e.target.value)
                    setForm({ ...form, consumableId: '' })
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  required
                />
                {showDropdown && !form.consumableId && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-20">
                    {filteredConsumables.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, consumableId: c.id })
                          setSearchConsumable('')
                          setShowDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-lab-50 flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2">
                          {c.name}
                          {c.isHazardous && <Flame className="w-3 h-3 text-danger-500" />}
                        </span>
                        <span className="text-gray-400 text-xs">库存 {c.stock}{c.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedConsumable && (
                <div className={cn(
                  'mt-2 p-3 rounded-lg border',
                  selectedConsumable.isHazardous ? 'bg-red-50 border-red-200' : 'bg-lab-50 border-lab-200'
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{selectedConsumable.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{selectedConsumable.specification}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedConsumable.isHazardous && (
                        <span className="badge-danger">
                          <Flame className="w-3 h-3 mr-0.5" />危化品·需二次审批
                        </span>
                      )}
                      <span className={cn(
                        'text-xs font-medium',
                        selectedConsumable.stock < selectedConsumable.minAlert
                          ? 'text-danger-500'
                          : 'text-safe-600'
                      )}>
                        库存 {selectedConsumable.stock} {selectedConsumable.unit}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">项目名称 *</label>
                <input
                  className="input-field"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  placeholder="如：肿瘤细胞增殖实验"
                  required
                />
              </div>
              <div>
                <label className="label-field">领用数量 *</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
                  min={1}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-field">用途说明 *</label>
              <textarea
                className="input-field min-h-[80px]"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="请描述领用用途..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">导师姓名 *</label>
                <input
                  className="input-field"
                  value={form.advisor}
                  onChange={(e) => setForm({ ...form, advisor: e.target.value })}
                  placeholder="如：王教授"
                  required
                />
              </div>
              <div>
                <label className="label-field">申请人 *</label>
                <input
                  className="input-field"
                  value={form.applicant}
                  onChange={(e) => setForm({ ...form, applicant: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-field">预计归还或消耗说明</label>
              <textarea
                className="input-field min-h-[60px]"
                value={form.returnNote}
                onChange={(e) => setForm({ ...form, returnNote: e.target.value })}
                placeholder="如：消耗品不归还 / 预计3月15日归还"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                取消
              </button>
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" />
                提交申请
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="搜索项目名称或申请人..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {myRequisitions.map((r) => {
            const c = consumables.find((item) => item.id === r.consumableId)
            const sc = statusConfig[r.status]
            const StatusIcon = sc.icon
            return (
              <div key={r.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center mt-0.5',
                      r.isHazardous ? 'bg-red-50' : 'bg-lab-50'
                    )}>
                      <ClipboardList className={cn(
                        'w-4 h-4',
                        r.isHazardous ? 'text-danger-500' : 'text-lab-600'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">{r.applicant}</span>
                        {r.isHazardous && (
                          <span className="badge-danger">
                            <Flame className="w-3 h-3 mr-0.5" />危化
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        申请 <span className="font-medium text-gray-700">{c?.name}</span> × {r.quantity}
                        {c?.unit} · {r.projectName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        导师：{r.advisor} · {format(new Date(r.createdAt), 'MM/dd HH:mm')}
                      </p>
                      {r.status === 'rejected' && r.rejectReason && (
                        <p className="text-xs text-danger-500 mt-1">
                          驳回原因：{r.rejectReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={cn('flex items-center gap-1', sc.color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {sc.label}
                  </span>
                </div>
              </div>
            )
          })}
          {myRequisitions.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              暂无领用记录
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
