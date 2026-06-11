import { Link } from 'react-router-dom';
import { Calendar, User, Phone, AlertTriangle, ClipboardCheck } from 'lucide-react';
import type { FosterTask, Pet } from '@/types';
import { statusLabel, statusColor, formatDateDisplay } from '@/utils';

interface TaskCardProps {
  task: FosterTask;
  pet?: Pet;
  showMissedAlert?: boolean;
  missedItemsCount?: number;
}

export default function TaskCard({ task, pet, showMissedAlert, missedItemsCount = 0 }: TaskCardProps) {
  return (
    <Link to={`/tasks/${task.id}`} className="card group block hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
      {showMissedAlert && missedItemsCount > 0 && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-xl flex items-center gap-1">
          <AlertTriangle size={12} />
          {missedItemsCount} 项遗漏
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          {pet?.avatarUrl ? (
            <img
              src={pet.avatarUrl}
              alt={pet.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-3xl">
              {pet?.species === 'dog' ? '🐕' : pet?.species === 'cat' ? '🐱' : '🐾'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                {task.title}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {pet?.name || '宠物'} · {task.caretakerName || '待定'} 照料
              </p>
            </div>
            <span className={`tag ${statusColor[task.status]}`}>
              {statusLabel[task.status]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDateDisplay(task.startDate)} ~ {formatDateDisplay(task.endDate)}
            </span>
            {task.caretakerPhone && (
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {task.caretakerPhone}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {task.feedingTimesPerDay > 0 && (
              <span className="tag bg-amber-50 text-amber-700">
                🍚 {task.feedingTimesPerDay}餐/天
              </span>
            )}
            {task.medicationInstructions && (
              <span className="tag bg-rose-50 text-rose-700">
                💊 需要喂药
              </span>
            )}
            {task.walkingRequirements && (
              <span className="tag bg-emerald-50 text-emerald-700">
                🐾 需要遛弯
              </span>
            )}
          </div>
        </div>
      </div>

      {task.status === 'active' && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Link
            to={`/tasks/${task.id}/checkin`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm"
          >
            <ClipboardCheck size={16} />
            去打卡
          </Link>
        </div>
      )}

      {task.status === 'completed' && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Link
            to={`/tasks/${task.id}/review`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm"
          >
            查看交接回顾
          </Link>
        </div>
      )}
    </Link>
  );
}
