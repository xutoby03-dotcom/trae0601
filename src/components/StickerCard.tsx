import { Task, Member, useKitchenStore } from '@/store/kitchenStore'
import { Clock, Star, AlertTriangle, Check, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

const STICKER_BG: Record<string, string> = {
  'sticker-yellow': 'bg-sticker-yellow',
  'sticker-green': 'bg-sticker-green',
  'sticker-pink': 'bg-sticker-pink',
  'sticker-blue': 'bg-sticker-blue',
  'sticker-orange': 'bg-sticker-orange',
  'sticker-purple': 'bg-sticker-purple',
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily: '每天',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
}

interface StickerCardProps {
  task: Task
  member?: Member
  rotation: number
  onClick: () => void
  onComplete: () => void
}

export default function StickerCard({ task, member, rotation, onClick, onComplete }: StickerCardProps) {
  const getTaskUrgency = useKitchenStore((s) => s.getTaskUrgency)
  const urgency = getTaskUrgency(task)

  const isPeeling = urgency === 'overdue'
  const isWiggling = urgency === 'soon'

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onComplete()
  }

  const dueDate = new Date(task.nextDueDate)
  const now = new Date()
  const diffMs = dueDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  let dueLabel = ''
  if (urgency === 'overdue') {
    dueLabel = `逾期${Math.abs(diffDays)}天`
  } else if (diffDays === 0) {
    dueLabel = '今天到期'
  } else if (diffDays === 1) {
    dueLabel = '明天到期'
  } else {
    dueLabel = `${diffDays}天后`
  }

  return (
    <div
      className={clsx(
        'relative cursor-pointer transition-all duration-300 select-none',
        STICKER_BG[task.stickerColor] || 'bg-sticker-yellow',
        'sticker-shadow',
        isPeeling && 'sticker-peel animate-peel-up',
        isWiggling && 'animate-wiggle',
        task.isCompleted && 'opacity-60',
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...(isPeeling ? { transform: `rotate(${-3}deg) translateY(-3px)` } : {}),
      }}
      onClick={onClick}
    >
      {isPeeling && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center animate-fade-in">
          <AlertTriangle size={12} className="text-white" />
        </div>
      )}

      <div className="sticker-tape" />

      <div className="p-4 pt-5 sticker-lined min-h-[140px]">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-handwritten text-xl font-bold text-gray-800 leading-tight">
            {task.name}
          </h3>
          <button
            onClick={handleComplete}
            className={clsx(
              'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ml-2',
              task.isCompleted
                ? 'bg-success border-success text-white animate-check-pop'
                : 'border-gray-400 hover:border-success hover:bg-success/10'
            )}
          >
            {task.isCompleted && <Check size={14} strokeWidth={3} />}
          </button>
        </div>

        {member && (
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: member.color + '30', border: `2px solid ${member.color}` }}
            >
              {member.avatar}
            </span>
            <span className="text-xs text-gray-600 font-medium">{member.name}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
          <span className="flex items-center gap-0.5">
            <Clock size={11} />
            {task.estimatedMinutes}分钟
          </span>
          <span className="flex items-center gap-0.5">
            {Array.from({ length: task.difficulty }).map((_, i) => (
              <Star key={i} size={9} className="text-amber-500 fill-amber-500" />
            ))}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className={clsx(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            urgency === 'overdue' ? 'bg-red-100 text-red-700' :
            urgency === 'soon' ? 'bg-amber-100 text-amber-700' :
            urgency === 'completed' ? 'bg-green-100 text-green-700' :
            'bg-white/50 text-gray-600'
          )}>
            {urgency === 'overdue' ? dueLabel :
             urgency === 'soon' ? dueLabel :
             urgency === 'completed' ? '已完成' :
             FREQUENCY_LABEL[task.frequency]}
          </span>
          <ChevronRight size={14} className="text-gray-400" />
        </div>
      </div>
    </div>
  )
}
