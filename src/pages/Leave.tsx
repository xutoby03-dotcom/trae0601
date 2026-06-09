import { useState } from 'react'
import { Plus, LogOut, Repeat, User, FileText, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDate, formatTime } from '@/utils/helpers'
import Drawer from '@/components/Drawer'
import type { LeaveSwapType } from '@/types'

export default function Leave() {
  const { leaveSwaps, shifts, jobs, addLeaveSwap, deleteLeaveSwap } = useStore()
  const [activeTab, setActiveTab] = useState<LeaveSwapType>('leave')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formShiftId, setFormShiftId] = useState('')
  const [formType, setFormType] = useState<LeaveSwapType>('leave')
  const [formSubstituteName, setFormSubstituteName] = useState('')
  const [formNote, setFormNote] = useState('')

  const getJob = (jobId: string) => jobs.find((j) => j.id === jobId)
  const getShift = (shiftId: string) => shifts.find((s) => s.id === shiftId)

  const filtered = leaveSwaps.filter((ls) => ls.type === activeTab)

  const resetForm = () => {
    setFormShiftId('')
    setFormType('leave')
    setFormSubstituteName('')
    setFormNote('')
  }

  const handleSubmit = () => {
    if (!formShiftId) return
    const shift = getShift(formShiftId)
    if (!shift) return
    if (formType === 'swap' && !formSubstituteName.trim()) return

    addLeaveSwap({
      shiftId: formShiftId,
      jobId: shift.jobId,
      type: formType,
      substituteName: formType === 'swap' ? formSubstituteName.trim() : '',
      note: formNote.trim(),
    })
    resetForm()
    setDrawerOpen(false)
  }

  return (
    <div className="px-4 pt-2 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-stone-900">请假换班</h1>
        <button
          onClick={() => { resetForm(); setDrawerOpen(true) }}
          className="flex items-center gap-1 bg-[#F97316] text-white px-3 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
        >
          <Plus size={16} />
          新增
        </button>
      </div>

      <div className="flex bg-stone-100 rounded-xl p-1 mb-4">
        {(['leave', 'swap'] as LeaveSwapType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            {tab === 'leave' ? '请假' : '换班'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          {activeTab === 'leave' ? <LogOut size={40} /> : <Repeat size={40} />}
          <p className="mt-3 text-sm">
            暂无{activeTab === 'leave' ? '请假' : '换班'}记录
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ls) => {
            const job = getJob(ls.jobId)
            const shift = getShift(ls.shiftId)
            return (
              <div key={ls.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      ls.type === 'leave' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      {ls.type === 'leave' ? <LogOut size={18} /> : <Repeat size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {job && (
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: job.color }} />
                        )}
                        <span className="font-medium text-stone-900">{job?.name ?? '未知岗位'}</span>
                      </div>
                      {shift && (
                        <p className="text-xs text-stone-400 mt-0.5">
                          {formatDate(shift.startTime)} {formatTime(shift.startTime)}-{formatTime(shift.endTime)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLeaveSwap(ls.id)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {ls.type === 'swap' && ls.substituteName && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
                      <User size={12} />
                      顶班人: {ls.substituteName}
                    </span>
                  )}
                  {ls.note && (
                    <span className="inline-flex items-center gap-1 text-xs bg-stone-50 text-stone-500 px-2 py-1 rounded-lg">
                      <FileText size={12} />
                      {ls.note}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="新增记录">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">选择班次</label>
            <select
              value={formShiftId}
              onChange={(e) => setFormShiftId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
            >
              <option value="">请选择班次</option>
              {shifts.map((s) => {
                const j = getJob(s.jobId)
                return (
                  <option key={s.id} value={s.id}>
                    {j?.name ?? '未知岗位'} - {formatDate(s.startTime)} {formatTime(s.startTime)}-{formatTime(s.endTime)}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">类型</label>
            <div className="flex gap-3">
              {(['leave', 'swap'] as LeaveSwapType[]).map((t) => (
                <label
                  key={t}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                    formType === t
                      ? 'border-[#F97316] bg-orange-50 text-[#F97316]'
                      : 'border-stone-200 text-stone-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={formType === t}
                    onChange={() => setFormType(t)}
                    className="sr-only"
                  />
                  {t === 'leave' ? <LogOut size={16} /> : <Repeat size={16} />}
                  {t === 'leave' ? '请假' : '换班'}
                </label>
              ))}
            </div>
          </div>

          {formType === 'swap' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                顶班人<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formSubstituteName}
                onChange={(e) => setFormSubstituteName(e.target.value)}
                placeholder="请输入顶班人姓名"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">备注</label>
            <textarea
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="请输入备注信息"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formShiftId || (formType === 'swap' && !formSubstituteName.trim())}
            className="w-full py-3 bg-[#F97316] text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            确认添加
          </button>
        </div>
      </Drawer>
    </div>
  )
}
