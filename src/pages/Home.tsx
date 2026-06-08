import { useState, useMemo } from 'react'
import { Plus, Users, Search, Trash2, Edit3 } from 'lucide-react'
import { useKitchenStore } from '@/store/kitchenStore'
import StickerCard from '@/components/StickerCard'
import TaskForm from '@/components/TaskForm'
import CompleteTaskModal from '@/components/CompleteTaskModal'
import MemberManager from '@/components/MemberManager'
import { Task } from '@/store/kitchenStore'

type Period = 'today' | 'week' | 'month'

const PERIOD_CONFIG: { key: Period; label: string; emoji: string; color: string }[] = [
  { key: 'today', label: '今天', emoji: '🔴', color: 'bg-red-100 text-red-700 border-red-300' },
  { key: 'week', label: '本周', emoji: '🟡', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { key: 'month', label: '本月', emoji: '🟢', color: 'bg-green-100 text-green-700 border-green-300' },
]

function getStickerRotation(index: number): number {
  const seed = ((index + 1) * 7) % 5
  const angles = [-2, -1, 0, 1, 2]
  return angles[seed]
}

export default function Home() {
  const { tasks, getTasksByPeriod, getMemberById, deleteTask, getOverdueTasks } = useKitchenStore()
  const [activePeriod, setActivePeriod] = useState<Period>('today')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [completingTask, setCompletingTask] = useState<Task | undefined>()
  const [showMembers, setShowMembers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const overdueTasks = getOverdueTasks()
  const periodTasks = getTasksByPeriod(activePeriod)

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return periodTasks
    return periodTasks.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [periodTasks, searchQuery])

  const incompleteTasks = filteredTasks.filter((t) => !t.isCompleted)
  const completedTasks = filteredTasks.filter((t) => t.isCompleted)

  return (
    <div className="min-h-screen fridge-texture pb-20">
      <header className="metal-bar sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧹</span>
            <h1 className="font-handwritten text-2xl font-bold text-white drop-shadow-sm">
              厨房清洁排班墙
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembers(true)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <Users size={18} />
            </button>
          </div>
        </div>
      </header>

      {overdueTasks.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-4 mt-3">
          <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="animate-wiggle inline-block">⚠️</span>
            <span className="text-sm text-danger font-medium">
              {overdueTasks.length}个任务已逾期，快去完成！
            </span>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 mt-4">
        <div className="flex gap-2 mb-4">
          {PERIOD_CONFIG.map((p) => {
            const count = getTasksByPeriod(p.key).filter((t) => !t.isCompleted).length
            return (
              <button
                key={p.key}
                onClick={() => setActivePeriod(p.key)}
                className={`tab-metal px-4 py-2 rounded-lg font-handwritten text-lg font-bold transition-all flex items-center gap-1.5 ${
                  activePeriod === p.key
                    ? `${p.color} border shadow-md scale-105`
                    : 'text-gray-500 border border-transparent hover:bg-white/50'
                }`}
              >
                <span>{p.emoji}</span>
                <span>{p.label}</span>
                {count > 0 && (
                  <span className="ml-1 bg-white/80 text-gray-700 text-xs px-1.5 py-0.5 rounded-full font-body font-bold">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索任务..."
            className="w-full pl-9 pr-4 py-2 bg-white/60 rounded-lg border border-gray-200/50 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 float-animation">🫧</div>
            <p className="font-handwritten text-2xl text-gray-400">
              {searchQuery ? '没找到相关任务' : '厨房很干净！'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? '换个关键词试试' : '点击下方按钮添加清洁任务'}
            </p>
          </div>
        ) : (
          <>
            {incompleteTasks.length > 0 && (
              <div className="mb-6">
                <h2 className="font-handwritten text-lg text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-amber-400 rounded" />
                  待完成
                  <span className="text-sm font-body text-gray-400">({incompleteTasks.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {incompleteTasks.map((task, i) => (
                    <StickerCard
                      key={task.id}
                      task={task}
                      member={getMemberById(task.assignedMemberId)}
                      rotation={getStickerRotation(i)}
                      onClick={() => setEditingTask(task)}
                      onComplete={() => setCompletingTask(task)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="mb-6">
                <h2 className="font-handwritten text-lg text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-green-400 rounded" />
                  已完成
                  <span className="text-sm font-body text-gray-300">({completedTasks.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {completedTasks.map((task, i) => (
                    <StickerCard
                      key={task.id}
                      task={task}
                      member={getMemberById(task.assignedMemberId)}
                      rotation={getStickerRotation(i + incompleteTasks.length)}
                      onClick={() => setEditingTask(task)}
                      onComplete={() => setCompletingTask(task)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editingTask && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-lg">{editingTask.isCompleted ? '✅' : '📌'}</span>
              <span className="font-handwritten text-lg font-bold text-gray-800 truncate">
                {editingTask.name}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setShowTaskForm(true)
                }}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Edit3 size={16} className="text-blue-500" />
              </button>
              <button
                onClick={() => {
                  deleteTask(editingTask.id)
                  setEditingTask(undefined)
                }}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
              <button
                onClick={() => setEditingTask(undefined)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setEditingTask(undefined)
          setShowTaskForm(true)
        }}
        className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
      >
        <Plus size={24} strokeWidth={3} />
      </button>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(undefined)
          }}
        />
      )}

      {completingTask && (
        <CompleteTaskModal
          task={completingTask}
          onClose={() => setCompletingTask(undefined)}
        />
      )}

      {showMembers && (
        <MemberManager onClose={() => setShowMembers(false)} />
      )}
    </div>
  )
}
