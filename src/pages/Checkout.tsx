import { useState } from 'react'
import { useStore } from '@/store'
import { CHECKOUT_STATUS_LABELS, CHECKOUT_STATUS_COLORS } from '@/types'
import { formatDateTime, isOverdue } from '@/utils/format'
import { ClipboardCheck, Plus, Search, X } from 'lucide-react'

export default function Checkout() {
  const { labs, classes, teachers, checkouts, createCheckout, getLabById, getClassById, getTeacherById } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [classId, setClassId] = useState('')
  const [experimentProject, setExperimentProject] = useState('')
  const [labId, setLabId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [quantity, setQuantity] = useState(20)
  const [filter, setFilter] = useState('')

  const selectedLab = labs.find(l => l.id === labId)
  const availableCount = selectedLab
    ? useStore.getState().goggles.filter(g => g.labId === labId && (g.status === 'available' || g.status === 'stored')).length
    : 0

  const handleSubmit = () => {
    if (!classId || !experimentProject || !labId || !teacherId || quantity <= 0) return
    const result = createCheckout({ classId, experimentProject, labId, teacherId, quantity })
    if (result) {
      setShowForm(false)
      setClassId('')
      setExperimentProject('')
      setLabId('')
      setTeacherId('')
      setQuantity(20)
    }
  }

  const filteredCheckouts = filter
    ? checkouts.filter(co => {
        const cls = getClassById(co.classId)
        const teacher = getTeacherById(co.teacherId)
        const lab = getLabById(co.labId)
        return `${co.experimentProject} ${cls?.name} ${teacher?.name} ${lab?.name}`.toLowerCase().includes(filter.toLowerCase())
      })
    : checkouts

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">领用管理</h2>
          <p className="text-slate-500 mt-1">按班级领用护目镜，记录实验项目与数量</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          新建领用
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">新建领用登记</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">领用班级</label>
                <select value={classId} onChange={e => setClassId(e.target.value)} className="select-field">
                  <option value="">请选择班级</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.department})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">实验项目</label>
                <input
                  type="text"
                  value={experimentProject}
                  onChange={e => setExperimentProject(e.target.value)}
                  placeholder="例如：酸碱中和实验"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">实验室</label>
                <select value={labId} onChange={e => setLabId(e.target.value)} className="select-field">
                  <option value="">请选择实验室</option>
                  {labs.map(l => <option key={l.id} value={l.id}>{l.name} ({l.building} {l.roomNumber})</option>)}
                </select>
                {labId && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    当前可借：<span className="font-medium text-emerald-600">{availableCount} 副</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">负责教师</label>
                <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="select-field">
                  <option value="">请选择教师</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.department})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">领用数量</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  min={1}
                  max={availableCount || 99}
                  className="input-field"
                />
                {labId && quantity > availableCount && (
                  <p className="text-xs text-rose-600 mt-1.5">数量超过可借数量 ({availableCount} 副)</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">取消</button>
              <button
                onClick={handleSubmit}
                className="btn-primary flex-1"
                disabled={!classId || !experimentProject || !labId || !teacherId || quantity <= 0 || (labId && quantity > availableCount)}
              >
                <ClipboardCheck className="w-4 h-4" />
                确认领用
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">领用记录</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索班级、实验项目..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">班级</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">实验项目</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">实验室</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">数量</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">负责教师</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">领用时间</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">状态</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheckouts.map(co => {
                const cls = getClassById(co.classId)
                const teacher = getTeacherById(co.teacherId)
                const lab = getLabById(co.labId)
                return (
                  <tr key={co.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{cls?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{co.experimentProject}</td>
                    <td className="py-3 px-4 text-slate-600">{lab?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{co.quantity} 副</td>
                    <td className="py-3 px-4 text-slate-600">{teacher?.name}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDateTime(co.checkoutTime)}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${CHECKOUT_STATUS_COLORS[co.status]}`}>
                        {CHECKOUT_STATUS_LABELS[co.status]}
                      </span>
                      {co.status === 'active' && isOverdue(co.expectedReturnTime) && (
                        <span className="badge bg-red-100 text-red-700 ml-1">逾期</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredCheckouts.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">暂无领用记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
