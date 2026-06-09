import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  CheckSquare,
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  Droplets,
  Edit,
  Calendar,
  Battery,
  Shield,
  Wind,
} from 'lucide-react'
import {
  useStore,
  getACStatus,
  CHECK_TYPE_LABELS,
  TASK_TYPE_LABELS,
  type SeasonCheckItem,
  type FamilyTask,
} from '@/store/useStore'
import { cn } from '@/lib/utils'

const STATUS_MAP: Record<ReturnType<typeof getACStatus>, { label: string; className: string }> = {
  overdue: { label: '已超期', className: 'bg-red-100 text-red-700' },
  'due-soon': { label: '即将到期', className: 'bg-yellow-100 text-yellow-700' },
  clean: { label: '状态良好', className: 'bg-green-100 text-green-700' },
}

const CHECK_ICONS: Record<SeasonCheckItem['checkType'], React.ReactNode> = {
  remote_battery: <Battery className="w-4 h-4" />,
  drain_pipe: <Droplets className="w-4 h-4" />,
  outdoor_obstacle: <Shield className="w-4 h-4" />,
  filter_status: <Wind className="w-4 h-4" />,
}

const TABS = [
  { key: 'cleaning', label: '清洗记录', icon: <Clock className="w-4 h-4" /> },
  { key: 'season', label: '换季检查', icon: <CheckSquare className="w-4 h-4" /> },
  { key: 'family', label: '家人分工', icon: <Users className="w-4 h-4" /> },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function ACDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { acUnits, cleaningRecords, seasonChecks, familyTasks, deleteAC, addSeasonCheck, toggleSeasonCheck, addFamilyTask, toggleFamilyTask, deleteFamilyTask } = useStore()

  const [activeTab, setActiveTab] = useState<TabKey>('cleaning')
  const [newMember, setNewMember] = useState('')
  const [newTaskType, setNewTaskType] = useState<FamilyTask['taskType']>('contact_technician')

  const ac = acUnits.find((a) => a.id === id)
  if (!ac) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <p className="text-gray-500 mb-4">未找到该空调</p>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">
          返回首页
        </button>
      </div>
    )
  }

  const status = getACStatus(ac)
  const statusInfo = STATUS_MAP[status]
  const acCleanings = cleaningRecords.filter((r) => r.acId === id).sort((a, b) => b.cleanDate.localeCompare(a.cleanDate))
  const acSeasonChecks = seasonChecks.filter((c) => c.acId === id)
  const acFamilyTasks = familyTasks.filter((t) => t.acId === id)

  const checkTypes: SeasonCheckItem['checkType'][] = ['remote_battery', 'drain_pipe', 'outdoor_obstacle', 'filter_status']

  const handleSeasonToggle = (checkType: SeasonCheckItem['checkType']) => {
    const existing = acSeasonChecks.find((c) => c.checkType === checkType)
    if (existing) {
      toggleSeasonCheck(existing.id)
    } else {
      addSeasonCheck({ acId: id!, checkType, checked: true, checkedDate: new Date().toISOString() })
    }
  }

  const handleAddTask = () => {
    if (!newMember.trim()) return
    addFamilyTask({ acId: id!, memberName: newMember.trim(), taskType: newTaskType, completed: false })
    setNewMember('')
  }

  const handleDelete = () => {
    if (window.confirm('确定删除该空调吗？所有关联数据将被清除。')) {
      deleteAC(id!)
      navigate('/')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{ac.room}</h1>
          <p className="text-sm text-gray-500">{ac.brand}</p>
        </div>
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', statusInfo.className)}>
          {statusInfo.label}
        </span>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => navigate(`/ac/${id}/record`)}
          className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
        >
          <Calendar className="w-4 h-4" />
          记录清洗
        </button>
        <button
          onClick={() => navigate(`/add?edit=${id}`)}
          className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-1.5"
        >
          <Edit className="w-4 h-4" />
          编辑
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          删除
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 transition',
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'cleaning' && (
        <div>
          {acCleanings.length === 0 ? (
            <p className="text-center text-gray-400 py-10">暂无清洗记录</p>
          ) : (
            <div className="relative border-l-2 border-blue-200 ml-3 space-y-6">
              {acCleanings.map((record) => (
                <div key={record.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{record.cleanerName}</span>
                      <span className="text-sm text-gray-500">{record.cleanDate}</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-600 mb-2">¥{record.cost}</div>
                    <div className="flex gap-3 mb-2">
                      <img
                        src={record.beforePhoto}
                        alt="清洗前"
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = ''
                          ;(e.target as HTMLImageElement).className = 'w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400'
                        }}
                      />
                      <img
                        src={record.afterPhoto}
                        alt="清洗后"
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = ''
                          ;(e.target as HTMLImageElement).className = 'w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400'
                        }}
                      />
                    </div>
                    <div className="flex gap-2 mb-1">
                      {record.hasOdor && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                          <AlertTriangle className="w-3 h-3" />
                          异味
                        </span>
                      )}
                      {record.hasLeakage && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-cyan-100 text-cyan-700">
                          <Droplets className="w-3 h-3" />
                          漏水
                        </span>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'season' && (
        <div className="space-y-3">
          {checkTypes.map((ct) => {
            const existing = acSeasonChecks.find((c) => c.checkType === ct)
            const checked = existing?.checked ?? false
            return (
              <label
                key={ct}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border transition cursor-pointer',
                  checked ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded flex items-center justify-center border-2 transition-all',
                    checked
                      ? 'bg-blue-600 border-blue-600 scale-100'
                      : 'border-gray-300 scale-90'
                  )}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleSeasonToggle(ct)}
                  className="sr-only"
                />
                <span className="text-gray-500">{CHECK_ICONS[ct]}</span>
                <span className={cn('text-sm font-medium', checked ? 'text-blue-700' : 'text-gray-700')}>
                  {CHECK_TYPE_LABELS[ct]}
                </span>
                {existing?.checkedDate && (
                  <span className="ml-auto text-xs text-gray-400">{new Date(existing.checkedDate).toLocaleDateString()}</span>
                )}
              </label>
            )
          })}
        </div>
      )}

      {activeTab === 'family' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="家人姓名"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
            />
            <select
              value={newTaskType}
              onChange={(e) => setNewTaskType(e.target.value as FamilyTask['taskType'])}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              {(Object.keys(TASK_TYPE_LABELS) as FamilyTask['taskType'][]).map((t) => (
                <option key={t} value={t}>
                  {TASK_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {acFamilyTasks.length === 0 ? (
            <p className="text-center text-gray-400 py-10">暂无分工任务</p>
          ) : (
            <div className="space-y-2">
              {acFamilyTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition',
                    task.completed ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
                  )}
                >
                  <button
                    onClick={() => toggleFamilyTask(task.id)}
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center border-2 transition-all',
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    )}
                  >
                    {task.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={cn('flex-1 text-sm', task.completed && 'line-through text-gray-400')}>
                    {task.memberName} · {TASK_TYPE_LABELS[task.taskType]}
                  </span>
                  <button
                    onClick={() => deleteFamilyTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
