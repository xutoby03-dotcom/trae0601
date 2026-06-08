import { useState, useCallback, useMemo } from 'react'
import { loadCareTasks, completeTask, loadPlants } from '../utils/storage'
import { CareTask } from '../types'
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO, isAfter, isWithinInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type CareType = 'water' | 'fertilize' | 'repot'

const TYPE_CONFIG: Record<CareType, { icon: string; label: string; color: string; bg: string }> = {
  water: { icon: '💧', label: '浇水', color: 'var(--blue-500)', bg: 'var(--blue-50)' },
  fertilize: { icon: '🧪', label: '施肥', color: 'var(--purple-500)', bg: 'var(--purple-50)' },
  repot: { icon: '🏺', label: '换盆', color: 'var(--amber-600)', bg: 'var(--amber-50)' },
}

const TYPE_OPTIONS: { value: CareType | ''; label: string; icon: string }[] = [
  { value: '', label: '全部类型', icon: '📋' },
  { value: 'water', label: '浇水', icon: '💧' },
  { value: 'fertilize', label: '施肥', icon: '🧪' },
  { value: 'repot', label: '换盆', icon: '🏺' },
]

function TaskRow({ task, onDone }: { task: CareTask; onDone: () => void }) {
  const cfg = TYPE_CONFIG[task.type]
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      borderRadius: 'var(--radius-sm)',
      background: task.completed ? 'var(--gray-50)' : cfg.bg,
      opacity: task.completed ? 0.6 : 1,
    }}>
      <span style={{ fontSize: 20 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: task.completed ? 'var(--gray-400)' : 'var(--gray-800)' }}>
          {task.plantName}
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
          {cfg.label}
          {task.completed && task.completedDate && (
            <span> · 已于 {format(parseISO(task.completedDate), 'M月d日 HH:mm')} 完成</span>
          )}
        </div>
      </div>
      {!task.completed && (
        <button
          className="btn btn-sm btn-primary"
          onClick={(e) => {
            e.preventDefault()
            completeTask(task.id)
            onDone()
          }}
        >
          ✓ 完成
        </button>
      )}
    </div>
  )
}

export default function CalendarView() {
  const [tasks, setTasks] = useState<CareTask[]>(() => loadCareTasks())
  const refresh = useCallback(() => setTasks(loadCareTasks()), [])

  const [filterPlant, setFilterPlant] = useState('')
  const [filterType, setFilterType] = useState<CareType | ''>('')
  const [onlyThisWeek, setOnlyThisWeek] = useState(true)

  const plantNames = useMemo(() => {
    const names = Array.from(new Set(loadPlants().map(p => p.name)))
    return names.sort()
  }, [])

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterPlant && t.plantName !== filterPlant) return false
      if (filterType && t.type !== filterType) return false
      return true
    })
  }, [tasks, filterPlant, filterType])

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

  const weekDays = (() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  })()

  const pendingTasks = useMemo(() => {
    return filtered
      .filter(t => !t.completed && !isAfter(parseISO(t.scheduledDate), addDays(weekStart, 7)))
      .sort((a, b) => parseISO(a.scheduledDate).getTime() - parseISO(b.scheduledDate).getTime())
  }, [filtered, weekStart])

  const completedTasks = useMemo(() => {
    let list = filtered.filter(t => t.completed)
    if (onlyThisWeek) {
      list = list.filter(t => {
        if (!t.completedDate) return false
        return isWithinInterval(parseISO(t.completedDate), { start: weekStart, end: weekEnd })
      })
    }
    return list
      .sort((a, b) => {
        const da = a.completedDate ? parseISO(a.completedDate).getTime() : 0
        const db = b.completedDate ? parseISO(b.completedDate).getTime() : 0
        return db - da
      })
      .slice(0, 20)
  }, [filtered, onlyThisWeek, weekStart, weekEnd])

  const activeFilterCount = (filterPlant ? 1 : 0) + (filterType ? 1 : 0)

  const clearFilters = () => {
    setFilterPlant('')
    setFilterType('')
  }

  return (
    <div>
      <h2 className="page-title">📅 照料日历</h2>

      <div style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 20,
        padding: 14,
        background: 'white',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
      }}>
        <select
          value={filterPlant}
          onChange={e => setFilterPlant(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--gray-200)',
            fontSize: 13,
            color: filterPlant ? 'var(--green-600)' : 'var(--gray-600)',
            fontWeight: filterPlant ? 600 : 400,
            background: filterPlant ? 'var(--green-50)' : 'white',
            cursor: 'pointer',
          }}
        >
          <option value="">🌿 全部植物</option>
          {plantNames.map(name => (
            <option key={name} value={name}>🌱 {name}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 4 }}>
          {TYPE_OPTIONS.map(opt => {
            const active = filterType === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setFilterType(opt.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: active ? '1px solid var(--green-400)' : '1px solid var(--gray-200)',
                  background: active ? 'var(--green-50)' : 'white',
                  color: active ? 'var(--green-600)' : 'var(--gray-500)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {opt.icon} {opt.label}
              </button>
            )
          })}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--gray-200)',
              background: 'white',
              color: 'var(--gray-400)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ✕ 清除筛选
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
            {filtered.length} 项任务
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        {weekDays.map(day => {
          const dayTasks = filtered.filter(t => isSameDay(parseISO(t.scheduledDate), day))
          const isToday = isSameDay(day, new Date())

          return (
            <div key={day.toISOString()} style={{
              background: isToday ? 'var(--green-50)' : 'white',
              borderRadius: 'var(--radius)',
              border: isToday ? '2px solid var(--green-400)' : '1px solid var(--gray-200)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '10px 12px',
                textAlign: 'center',
                borderBottom: '1px solid var(--gray-100)',
              }}>
                <div style={{
                  fontSize: 12,
                  color: 'var(--gray-400)',
                  fontWeight: 500,
                }}>
                  {format(day, 'EEE', { locale: zhCN })}
                </div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: isToday ? 'var(--green-600)' : 'var(--gray-700)',
                }}>
                  {format(day, 'd')}
                </div>
              </div>

              <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dayTasks.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--gray-300)', textAlign: 'center', padding: '8px 0' }}>
                    无任务
                  </div>
                )}
                {dayTasks.slice(0, 3).map(task => {
                  const cfg = TYPE_CONFIG[task.type as CareType]
                  return (
                    <div key={task.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 6px',
                      borderRadius: 4,
                      fontSize: 11,
                      background: task.completed ? 'var(--gray-50)' : cfg.bg,
                      color: task.completed ? 'var(--gray-400)' : cfg.color,
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}>
                      <span>{cfg.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.plantName}
                      </span>
                    </div>
                  )
                })}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center' }}>
                    +{dayTasks.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 12 }}>
          🔔 待办任务
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>
              🎉 本周没有待办任务
            </div>
          ) : (
            pendingTasks.map(task => (
              <TaskRow key={task.id} task={task} onDone={refresh} />
            ))
          )}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)' }}>
            ✓ 已完成
          </h3>
          <button
            onClick={() => setOnlyThisWeek(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border: onlyThisWeek ? '1px solid var(--green-400)' : '1px solid var(--gray-200)',
              background: onlyThisWeek ? 'var(--green-50)' : 'white',
              color: onlyThisWeek ? 'var(--green-600)' : 'var(--gray-400)',
              fontSize: 12,
              fontWeight: onlyThisWeek ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            📅 仅本周
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {completedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)', fontSize: 14 }}>
              暂无已完成任务
            </div>
          ) : (
            completedTasks.map(task => (
              <TaskRow key={task.id} task={task} onDone={refresh} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
