import { useState, useEffect } from 'react'
import { X, Star, Plus, Minus } from 'lucide-react'
import { useKitchenStore, Task, getNextDueDate } from '@/store/kitchenStore'
import { clsx } from 'clsx'

interface TaskFormProps {
  task?: Task
  onClose: () => void
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'biweekly', label: '每两周' },
  { value: 'monthly', label: '每月' },
] as const

const ROTATION_OPTIONS = [
  { value: 'rotate', label: '按人轮流', desc: '完成后自动轮到下一个人' },
  { value: 'fixed', label: '固定负责人', desc: '每次都是同一个人负责' },
  { value: 'auto-assign', label: '自动分配', desc: '没人认领时自动分配给最空闲的人' },
] as const

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const { members, addTask, updateTask } = useKitchenStore()

  const [name, setName] = useState(task?.name || '')
  const [frequency, setFrequency] = useState<Task['frequency']>(task?.frequency || 'weekly')
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimatedMinutes || 15)
  const [difficulty, setDifficulty] = useState<Task['difficulty']>(task?.difficulty || 2)
  const [rotationType, setRotationType] = useState<Task['rotationType']>(task?.rotationType || 'rotate')
  const [assignedMemberId, setAssignedMemberId] = useState(task?.assignedMemberId || members[0]?.id || '')
  const [rotationOrder, setRotationOrder] = useState<string[]>(task?.rotationOrder || members.map((m) => m.id))
  const [nextDueDate, setNextDueDate] = useState(task?.nextDueDate || new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (rotationType === 'rotate' && rotationOrder.length === 0) {
      setRotationOrder(members.map((m) => m.id))
    }
  }, [rotationType, members, rotationOrder.length])

  const handleSubmit = () => {
    if (!name.trim()) return

    if (task) {
      updateTask(task.id, {
        name,
        frequency,
        estimatedMinutes,
        difficulty,
        rotationType,
        assignedMemberId,
        rotationOrder,
        nextDueDate,
      })
    } else {
      addTask({
        name,
        frequency,
        estimatedMinutes,
        difficulty,
        rotationType,
        assignedMemberId,
        nextDueDate,
        rotationOrder: rotationType === 'rotate' ? rotationOrder : [assignedMemberId],
      })
    }
    onClose()
  }

  const toggleMemberInRotation = (memberId: string) => {
    setRotationOrder((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 animate-fade-in" onClick={onClose}>
      <div
        className="bg-sticker-yellow w-full max-w-md rounded-sm sticker-shadow animate-sticky-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticker-tape" />

        <div className="p-5 pt-7 sticker-lined">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-handwritten text-2xl font-bold text-gray-800">
              {task ? '✏️ 修改便签' : '📌 贴新便签'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-handwritten text-lg text-gray-700 block mb-1">任务名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="比如：擦灶台、洗油烟机..."
                className="w-full px-3 py-2 bg-white/60 rounded border border-gray-300/50 font-body text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="font-handwritten text-lg text-gray-700 block mb-1">频率</label>
              <div className="flex gap-2 flex-wrap">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFrequency(opt.value)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      frequency === opt.value
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-white/60 text-gray-600 hover:bg-white/80'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-1">
                <label className="font-handwritten text-lg text-gray-700 block mb-1">预计耗时</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEstimatedMinutes(Math.max(5, estimatedMinutes - 5))}
                    className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center hover:bg-white/80 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium w-16 text-center">{estimatedMinutes}分钟</span>
                  <button
                    onClick={() => setEstimatedMinutes(Math.min(120, estimatedMinutes + 5))}
                    className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center hover:bg-white/80 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="font-handwritten text-lg text-gray-700 block mb-1">难度</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d as Task['difficulty'])}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={20}
                        className={d <= difficulty ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="font-handwritten text-lg text-gray-700 block mb-1">到期日</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/60 rounded border border-gray-300/50 font-body text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
              />
            </div>

            <div>
              <label className="font-handwritten text-lg text-gray-700 block mb-1">轮班方式</label>
              <div className="space-y-2">
                {ROTATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRotationType(opt.value)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg transition-all',
                      rotationType === opt.value
                        ? 'bg-amber-500/20 border-2 border-amber-500'
                        : 'bg-white/40 border border-gray-300/30 hover:bg-white/60'
                    )}
                  >
                    <div className="font-medium text-sm text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-handwritten text-lg text-gray-700 block mb-1">
                {rotationType === 'fixed' ? '负责人' : rotationType === 'rotate' ? '轮班顺序（点击调整）' : '参与成员'}
              </label>
              <div className="flex gap-2 flex-wrap">
                {members.map((m) => {
                  const isSelected = rotationType === 'rotate'
                    ? rotationOrder.includes(m.id)
                    : assignedMemberId === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (rotationType === 'rotate') {
                          toggleMemberInRotation(m.id)
                        } else {
                          setAssignedMemberId(m.id)
                        }
                      }}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                        isSelected
                          ? 'text-white shadow-md'
                          : 'bg-white/40 text-gray-500 hover:bg-white/60'
                      )}
                      style={isSelected ? { backgroundColor: m.color } : {}}
                    >
                      <span>{m.avatar}</span>
                      <span>{m.name}</span>
                      {rotationType === 'rotate' && isSelected && (
                        <span className="text-xs opacity-80">
                          #{rotationOrder.indexOf(m.id) + 1}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/50 text-gray-600 font-medium text-sm hover:bg-white/70 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className={clsx(
                'flex-1 py-2.5 rounded-lg font-medium text-sm transition-all',
                name.trim()
                  ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              {task ? '保存修改' : '贴上去 📌'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
