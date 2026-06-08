import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { loadCareTasks, completeTask } from '../utils/storage'
import { CareTask } from '../types'
import { format, startOfDay, addDays, isSameDay, parseISO, isBefore, isAfter } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useState } from 'react'

const TYPE_CONFIG = {
  water: { icon: '💧', label: '浇水', color: 'var(--blue-500)', bg: 'var(--blue-50)' },
  fertilize: { icon: '🧪', label: '施肥', color: 'var(--purple-500)', bg: 'var(--purple-50)' },
  repot: { icon: '🏺', label: '换盆', color: 'var(--amber-600)', bg: 'var(--amber-50)' },
}

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
  const [, setTick] = useState(0)
  const refresh = () => setTick(t => t + 1)

  const tasks = useMemo(() => loadCareTasks(), [])

  const weekDays = useMemo(() => {
    const today = startOfDay(new Date())
    return Array.from({ length: 7 }, (_, i) => addDays(today, i))
  }, [])

  return (
    <div>
      <h2 className="page-title">📅 照料日历</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        {weekDays.map(day => {
          const dayTasks = tasks.filter(t => isSameDay(parseISO(t.scheduledDate), day))
          const pendingTasks = dayTasks.filter(t => !t.completed)
          const completedTasks = dayTasks.filter(t => t.completed)
          const isToday = isSameDay(day, new Date())
          const isPast = isBefore(day, startOfDay(new Date()))

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
                  color: isToday ? 'var(--green-600)' : isPast ? 'var(--gray-400)' : 'var(--gray-700)',
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
                  const cfg = TYPE_CONFIG[task.type]
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
          {tasks.filter(t => !t.completed && !isAfter(parseISO(t.scheduledDate), addDays(startOfDay(new Date()), 7))).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>
              🎉 本周没有待办任务
            </div>
          ) : (
            tasks
              .filter(t => !t.completed && !isAfter(parseISO(t.scheduledDate), addDays(startOfDay(new Date()), 7)))
              .sort((a, b) => parseISO(a.scheduledDate).getTime() - parseISO(b.scheduledDate).getTime())
              .map(task => (
                <TaskRow key={task.id} task={task} onDone={refresh} />
              ))
          )}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 12 }}>
          ✓ 已完成
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.filter(t => t.completed).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)', fontSize: 14 }}>
              暂无已完成任务
            </div>
          ) : (
            tasks
              .filter(t => t.completed)
              .sort((a, b) => {
                const da = a.completedDate ? parseISO(a.completedDate).getTime() : 0
                const db = b.completedDate ? parseISO(b.completedDate).getTime() : 0
                return db - da
              })
              .slice(0, 10)
              .map(task => (
                <TaskRow key={task.id} task={task} onDone={refresh} />
              ))
          )}
        </div>
      </div>
    </div>
  )
}
