import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import type { Observation } from '@/types'
import { cn } from '@/lib/utils'

interface ObservationFormProps {
  planId: string
}

const FLOAT_HEIGHT_OPTIONS = [
  { value: 'top' as const, label: '上层' },
  { value: 'middle' as const, label: '中层' },
  { value: 'bottom' as const, label: '下层' },
]

const FEEDING_OPTIONS = [
  { value: 'active' as const, label: '积极', emoji: '😋' },
  { value: 'moderate' as const, label: '一般', emoji: '😐' },
  { value: 'refuse' as const, label: '拒绝', emoji: '🙅' },
]

export default function ObservationForm({ planId }: ObservationFormProps) {
  const schedules = useStore(s => s.schedules.filter(sc => sc.planId === planId))
  const observations = useStore(s => s.observations.filter(o => o.planId === planId))
  const addObservation = useStore(s => s.addObservation)

  const sortedSchedules = [...schedules].sort((a, b) => a.dayIndex - b.dayIndex)

  const [selectedDay, setSelectedDay] = useState<number>(sortedSchedules[0]?.dayIndex ?? 0)
  const [extensionLevel, setExtensionLevel] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [floatHeight, setFloatHeight] = useState<'top' | 'middle' | 'bottom'>('middle')
  const [feedingResponse, setFeedingResponse] = useState<'active' | 'moderate' | 'refuse'>('moderate')
  const [wallCollision, setWallCollision] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (sortedSchedules.length > 0 && !sortedSchedules.find(s => s.dayIndex === selectedDay)) {
      setSelectedDay(sortedSchedules[0].dayIndex)
    }
  }, [sortedSchedules, selectedDay])

  useEffect(() => {
    const existing = observations.find(o => o.dayIndex === selectedDay)
    if (existing) {
      setExtensionLevel(existing.extensionLevel)
      setFloatHeight(existing.floatHeight)
      setFeedingResponse(existing.feedingResponse)
      setWallCollision(existing.wallCollision)
      setNotes(existing.notes)
    } else {
      setExtensionLevel(3)
      setFloatHeight('middle')
      setFeedingResponse('moderate')
      setWallCollision(false)
      setNotes('')
    }
  }, [selectedDay, observations])

  const handleSubmit = () => {
    addObservation({
      planId,
      dayIndex: selectedDay,
      extensionLevel,
      floatHeight,
      feedingResponse,
      wallCollision,
      notes,
    })
  }

  const recordedDays = new Set(observations.map(o => o.dayIndex))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {sortedSchedules.map(s => (
          <button
            key={s.dayIndex}
            onClick={() => setSelectedDay(s.dayIndex)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              selectedDay === s.dayIndex
                ? 'bg-cyan-500 text-gray-900'
                : recordedDays.has(s.dayIndex)
                  ? 'bg-gray-700 text-cyan-400'
                  : 'bg-gray-800 text-gray-400'
            )}
          >
            第{s.dayIndex + 1}天
            {recordedDays.has(s.dayIndex) && ' ✓'}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-gray-800/60 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-300">舒展度</label>
        <div className="flex gap-1">
          {([1, 2, 3, 4, 5] as const).map(star => (
            <button
              key={star}
              onClick={() => setExtensionLevel(star)}
              className="p-1 text-2xl transition-transform hover:scale-110"
            >
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  'h-8 w-8',
                  star <= extensionLevel ? 'fill-[#00e5c7] text-[#00e5c7]' : 'fill-gray-600 text-gray-600'
                )}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-800/60 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-300">漂浮高度</label>
        <div className="flex gap-3">
          {FLOAT_HEIGHT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFloatHeight(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-3 transition-colors',
                floatHeight === opt.value
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600 bg-gray-800 text-gray-400'
              )}
            >
              <div className="relative h-10 w-6 overflow-hidden rounded border border-gray-500">
                <div className="absolute inset-x-0 bottom-0 bg-blue-900/60" style={{ height: '100%' }} />
                <div
                  className={cn(
                    'absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full',
                    opt.value === 'top' && 'top-0.5',
                    opt.value === 'middle' && 'top-3',
                    opt.value === 'bottom' && 'top-[18px]',
                    floatHeight === opt.value ? 'bg-blue-400' : 'bg-gray-500'
                  )}
                />
              </div>
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-800/60 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-300">摄食反应</label>
        <div className="flex gap-3">
          {FEEDING_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFeedingResponse(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-3 transition-colors',
                feedingResponse === opt.value
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-gray-600 bg-gray-800 text-gray-400'
              )}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-800/60 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-300">撞壁</label>
        <button
          onClick={() => setWallCollision(!wallCollision)}
          className={cn(
            'relative h-8 w-14 rounded-full transition-colors',
            wallCollision ? 'bg-red-500' : 'bg-green-500'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-7 w-7 rounded-full bg-white shadow transition-transform',
              wallCollision ? 'translate-x-7' : 'translate-x-0.5'
            )}
          />
          <span className={cn(
            'absolute inset-0 flex items-center text-xs font-bold',
            wallCollision ? 'justify-start pl-1.5 text-white' : 'justify-end pr-1.5 text-white'
          )}>
            {wallCollision ? '是' : '否'}
          </span>
        </button>
      </div>

      <div className="rounded-xl bg-gray-800/60 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-300">备注</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          placeholder="记录其他观察..."
        />
      </div>

      <button
        onClick={handleSubmit}
        className="rounded-xl bg-[#00e5c7] px-4 py-3 font-bold text-gray-900 transition-opacity hover:opacity-90"
      >
        提交记录
      </button>
    </div>
  )
}
