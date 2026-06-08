import { useStore } from '@/store'
import { generateId } from '@/store'
import { TASK_TYPE_LABELS, TASK_STATUS_LABELS } from '@/types'
import type { FamilyTask, TaskType, TaskStatus } from '@/types'
import { Plus, Trash2, X, ArrowRight, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { format, isBefore, parseISO } from 'date-fns'

const TASK_BORDER_COLORS: Record<TaskType, string> = {
  registration: 'border-l-coral-500',
  accompany: 'border-l-amber-500',
  purchase: 'border-l-green-500',
  other: 'border-l-slate-400',
}

const TASK_BADGE_COLORS: Record<TaskType, string> = {
  registration: 'bg-coral-100 text-coral-700',
  accompany: 'bg-amber-100 text-amber-700',
  purchase: 'bg-green-100 text-green-700',
  other: 'bg-slate-100 text-slate-600',
}

const COLUMNS: TaskStatus[] = ['pending', 'inProgress', 'completed']

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  pending: 'inProgress',
  inProgress: 'completed',
  completed: null,
}

export default function Tasks() {
  const { elders, familyTasks, addFamilyTask, updateFamilyTask, deleteFamilyTask } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    elderId: '',
    type: 'registration' as TaskType,
    description: '',
    assignee: '',
    dueDate: '',
  })

  const isOverdue = (task: FamilyTask) =>
    task.status !== 'completed' && isBefore(parseISO(task.dueDate), new Date())

  const handleAdd = () => {
    if (!form.elderId || !form.description || !form.assignee || !form.dueDate) return
    addFamilyTask({
      id: generateId(),
      elderId: form.elderId,
      type: form.type,
      description: form.description,
      assignee: form.assignee,
      dueDate: form.dueDate,
      status: 'pending',
    })
    setForm({ elderId: '', type: 'registration', description: '', assignee: '', dueDate: '' })
    setShowModal(false)
  }

  const moveTask = (task: FamilyTask) => {
    const next = NEXT_STATUS[task.status]
    if (next) updateFamilyTask(task.id, { status: next })
  }

  const getElderName = (elderId: string) =>
    elders.find((e) => e.id === elderId)?.name ?? '未知'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">家庭任务分工</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600"
        >
          <Plus size={16} /> 添加任务
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((status) => {
          const tasks = familyTasks.filter((t) => t.status === status)
          return (
            <div key={status} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-semibold text-gray-700">{TASK_STATUS_LABELS[status]}</h2>
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                  {tasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => {
                  const overdue = isOverdue(task)
                  return (
                    <div
                      key={task.id}
                      className={`bg-white rounded-lg p-3 border-l-4 shadow-sm ${TASK_BORDER_COLORS[task.type]} ${overdue ? '!border-l-red-500' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${TASK_BADGE_COLORS[task.type]}`}>
                          {TASK_TYPE_LABELS[task.type]}
                        </span>
                        <div className="flex items-center gap-1">
                          {overdue && (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 flex items-center gap-0.5">
                              <AlertCircle size={10} /> 已逾期
                            </span>
                          )}
                          <button onClick={() => deleteFamilyTask(task.id)} className="text-gray-300 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">{task.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span>{task.assignee}</span>
                          <span>·</span>
                          <span>{getElderName(task.elderId)}</span>
                        </div>
                        <span>{format(parseISO(task.dueDate), 'MM/dd')}</span>
                      </div>
                      {NEXT_STATUS[task.status] && (
                        <button
                          onClick={() => moveTask(task)}
                          className="mt-2 w-full text-xs py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center gap-1"
                        >
                          {TASK_STATUS_LABELS[NEXT_STATUS[task.status]!]} <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">添加任务</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">选择老人</label>
                <select
                  value={form.elderId}
                  onChange={(e) => setForm({ ...form, elderId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">请选择</option>
                  {elders.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">任务类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {(Object.entries(TASK_TYPE_LABELS) as [TaskType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">任务描述</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="请输入任务描述"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">负责人</label>
                <input
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="请输入负责人"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">截止日期</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                取消
              </button>
              <button onClick={handleAdd} className="px-4 py-2 text-sm bg-coral-500 text-white rounded-lg hover:bg-coral-600">
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
