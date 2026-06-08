import { useRef, useState } from 'react'
import { Download, Check, Share2 } from 'lucide-react'
import { useKitchenStore } from '@/store/kitchenStore'
import html2canvas from 'html2canvas'

const DAY_EMOJIS: Record<string, string> = {
  '周一': '🏃', '周二': '💪', '周三': '🔥', '周四': '⚡',
  '周五': '🎯', '周六': '🧹', '周日': '✨',
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily: '每天',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
}

export default function Export() {
  const { getWeeklySchedule, getMemberById, tasks } = useKitchenStore()
  const scheduleRef = useRef<HTMLDivElement>(null)
  const [exported, setExported] = useState(false)

  const weeklySchedule = getWeeklySchedule()
  const now = new Date()
  const weekStart = new Date(now)
  const currentDay = now.getDay()
  weekStart.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const formatDate = (d: Date) =>
    `${d.getMonth() + 1}/${d.getDate()}`

  const handleExport = async () => {
    if (!scheduleRef.current) return
    try {
      const canvas = await html2canvas(scheduleRef.current, {
        scale: 2,
        backgroundColor: '#F5F0EB',
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `厨房排班_${formatDate(weekStart)}-${formatDate(weekEnd)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setExported(true)
      setTimeout(() => setExported(false), 2000)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleShare = async () => {
    if (!scheduleRef.current) return
    try {
      const canvas = await html2canvas(scheduleRef.current, {
        scale: 2,
        backgroundColor: '#F5F0EB',
        useCORS: true,
      })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], 'kitchen-schedule.png', { type: 'image/png' })
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: '本周厨房清洁排班',
          })
        }
      })
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  return (
    <div className="min-h-screen fridge-texture pb-20">
      <header className="metal-bar sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="font-handwritten text-2xl font-bold text-white drop-shadow-sm">
              本周排班图
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium text-sm hover:bg-amber-600 transition-all shadow-md hover:shadow-lg"
          >
            {exported ? <Check size={16} /> : <Download size={16} />}
            {exported ? '已保存！' : '保存图片'}
          </button>
          {typeof navigator.share === 'function' && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-all shadow-md"
            >
              <Share2 size={16} />
              分享
            </button>
          )}
        </div>

        <div ref={scheduleRef} className="bg-fridge rounded-xl p-6 shadow-inner">
          <div className="text-center mb-6">
            <div className="inline-block bg-sticker-yellow px-4 py-2 sticker-shadow -rotate-1">
              <h2 className="font-handwritten text-3xl font-bold text-gray-800">
                🧹 本周厨房清洁排班 🧽
              </h2>
            </div>
            <p className="font-handwritten text-lg text-gray-500 mt-2">
              {formatDate(weekStart)} ~ {formatDate(weekEnd)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {weeklySchedule.map(({ day, tasks: dayTasks }) => (
              <div
                key={day}
                className="bg-white/60 rounded-lg border border-gray-200/50 p-3 min-h-[120px]"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span>{DAY_EMOJIS[day]}</span>
                  <span className="font-handwritten text-lg font-bold text-gray-700">{day}</span>
                  <span className="text-xs text-gray-400">
                    {formatDate(new Date(weekStart.getTime() + weeklySchedule.indexOf(weeklySchedule.find((d) => d.day === day)!) * 24 * 60 * 60 * 1000))}
                  </span>
                </div>
                {dayTasks.length === 0 ? (
                  <p className="font-handwritten text-sm text-gray-400 italic">休息日～</p>
                ) : (
                  <div className="space-y-1.5">
                    {dayTasks.map((task) => {
                      const member = getMemberById(task.assignedMemberId)
                      return (
                        <div
                          key={task.id}
                          className={`px-2 py-1.5 rounded text-xs flex items-center gap-1.5 ${
                            task.isCompleted
                              ? 'bg-green-100/60 line-through text-gray-400'
                              : 'bg-sticker-yellow/60 text-gray-700'
                          }`}
                        >
                          {member && (
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] flex-shrink-0"
                              style={{ backgroundColor: member.color + '30', border: `1.5px solid ${member.color}` }}
                            >
                              {member.avatar}
                            </span>
                          )}
                          <span className="truncate">{task.name}</span>
                          <span className="text-gray-400 ml-auto flex-shrink-0">{task.estimatedMinutes}m</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 font-handwritten text-base">
            {useKitchenStore.getState().members.map((m) => (
              <span key={m.id} className="flex items-center gap-1">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                  style={{ backgroundColor: m.color + '30', border: `1.5px solid ${m.color}` }}
                >
                  {m.avatar}
                </span>
                {m.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white/40 rounded-xl p-4 border border-gray-200/30">
          <h3 className="font-handwritten text-lg font-bold text-gray-700 mb-3">📌 任务总览</h3>
          <div className="space-y-2">
            {tasks.map((task) => {
              const member = getMemberById(task.assignedMemberId)
              return (
                <div key={task.id} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${task.isCompleted ? 'bg-green-400' : 'bg-amber-400'}`} />
                  <span className={`flex-1 ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.name}
                  </span>
                  <span className="text-gray-400 text-xs">{FREQUENCY_LABEL[task.frequency]}</span>
                  {member && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                        style={{ backgroundColor: member.color + '30', border: `1.5px solid ${member.color}` }}
                      >
                        {member.avatar}
                      </span>
                      <span className="text-xs">{member.name}</span>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
