import React, { useState } from 'react'
import { useHabitStore } from '../store/useHabitStore'
import { HABIT_ICONS, HABIT_COLORS, ENERGY_LABELS } from '../types'
import { Plus, X, Edit3, Archive, Trash2 } from 'lucide-react'

const HabitForm: React.FC<{
  onClose: () => void
  editId?: string
}> = ({ onClose, editId }) => {
  const { habits, addHabit, updateHabit } = useHabitStore()
  const existing = editId ? habits.find((h) => h.id === editId) : null

  const [name, setName] = useState(existing?.name || '')
  const [icon, setIcon] = useState(existing?.icon || HABIT_ICONS[0])
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(
    existing?.frequency || 'daily'
  )
  const [targetPerWeek, setTargetPerWeek] = useState(
    existing?.targetPerWeek || 7
  )
  const [energyCost, setEnergyCost] = useState<1 | 2 | 3 | 4 | 5>(
    existing?.energyCost || 3
  )
  const [color, setColor] = useState(existing?.color || HABIT_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editId) {
      updateHabit(editId, {
        name: name.trim(),
        icon,
        frequency,
        targetPerWeek,
        energyCost,
        color,
      })
    } else {
      addHabit({
        name: name.trim(),
        icon,
        frequency,
        targetPerWeek,
        energyCost,
        color,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {editId ? '编辑习惯' : '添加习惯'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              习惯名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：早睡、跑步、读书..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              图标
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all ${
                    icon === ic
                      ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              频率
            </label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFrequency(f)
                    setTargetPerWeek(f === 'daily' ? 7 : 3)
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    frequency === f
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'daily' ? '每天' : '每周'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              每周目标次数：{targetPerWeek}次
            </label>
            <input
              type="range"
              min={1}
              max={7}
              value={targetPerWeek}
              onChange={(e) => setTargetPerWeek(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1次</span>
              <span>7次</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              预计耗费精力
            </label>
            <div className="flex gap-1.5">
              {([1, 2, 3, 4, 5] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEnergyCost(v)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    energyCost === v
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {ENERGY_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-md"
          >
            {editId ? '保存修改' : '添加习惯'}
          </button>
        </form>
      </div>
    </div>
  )
}

const HabitCard: React.FC<{
  habit: ReturnType<typeof useHabitStore.getState>['habits'][0]
}> = ({ habit }) => {
  const { archiveHabit, deleteHabit } = useHabitStore()
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className="relative p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all"
      style={{ borderLeftWidth: 4, borderLeftColor: habit.color }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{habit.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 truncate">
              {habit.name}
            </span>
            {habit.archived && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                已归档
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{habit.frequency === 'daily' ? '每天' : '每周'}</span>
            <span>目标 {habit.targetPerWeek}次/周</span>
            <span>精力 {ENERGY_LABELS[habit.energyCost]}</span>
          </div>
        </div>
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit3 size={16} className="text-gray-400" />
        </button>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => archiveHabit(habit.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Archive size={12} />
            {habit.archived ? '取消归档' : '归档'}
          </button>
          <button
            onClick={() => {
              if (confirm('确定删除这个习惯吗？')) deleteHabit(habit.id)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} />
            删除
          </button>
        </div>
      )}
    </div>
  )
}

export const HabitsPage: React.FC = () => {
  const { habits } = useHabitStore()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | undefined>()
  const [showArchived, setShowArchived] = useState(false)

  const activeHabits = habits.filter((h) => !h.archived)
  const archivedHabits = habits.filter((h) => h.archived)

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">习惯管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {activeHabits.length} 个活跃习惯
          </p>
        </div>
        <button
          onClick={() => {
            setEditId(undefined)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-md"
        >
          <Plus size={16} />
          添加
        </button>
      </div>

      <div className="space-y-3">
        {activeHabits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => {
              setEditId(habit.id)
              setShowForm(true)
            }}
            className="cursor-pointer"
          >
            <HabitCard habit={habit} />
          </div>
        ))}
      </div>

      {activeHabits.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-gray-500">还没有习惯，添加一个开始吧</p>
        </div>
      )}

      {archivedHabits.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showArchived ? '隐藏' : '显示'}已归档（{archivedHabits.length}）
          </button>
          {showArchived && (
            <div className="space-y-3 mt-3">
              {archivedHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <HabitForm
          onClose={() => {
            setShowForm(false)
            setEditId(undefined)
          }}
          editId={editId}
        />
      )}
    </div>
  )
}
