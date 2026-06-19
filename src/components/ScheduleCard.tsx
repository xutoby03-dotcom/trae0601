import React from 'react';
import { User, Clock, CheckCircle, Circle, AlertCircle, Hand } from 'lucide-react';
import type { Schedule, GardenBed, Volunteer, TimeSlot } from '@shared/types.js';
import { TIME_SLOT_LABELS, CROP_EMOJIS } from '@shared/types.js';
import { formatDate, getDayLabel } from '../utils/dateUtils.js';

interface ScheduleCardProps {
  schedule: Schedule & {
    gardenBed?: GardenBed;
    volunteer?: Volunteer;
  };
  onClaim?: () => void;
  onUnclaim?: () => void;
  onComplete?: () => void;
  showDate?: boolean;
  currentUserId?: string;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClaim,
  onUnclaim,
  onComplete,
  showDate = true,
  currentUserId,
}) => {
  const cropEmoji = schedule.gardenBed
    ? CROP_EMOJIS[schedule.gardenBed.crop] || '🌱'
    : '🌱';

  const statusConfig = {
    unclaimed: {
      icon: Circle,
      bg: 'bg-cream-100',
      border: 'border-cream-300',
      text: 'text-forest-600',
      label: '待认领',
      badgeClass: 'badge-neutral',
    },
    claimed: {
      icon: Clock,
      bg: 'bg-primary-50',
      border: 'border-primary-300',
      text: 'text-primary-700',
      label: '待完成',
      badgeClass: 'badge-info',
    },
    completed: {
      icon: CheckCircle,
      bg: 'bg-primary-100',
      border: 'border-primary-400',
      text: 'text-primary-800',
      label: '已完成',
      badgeClass: 'badge-success',
    },
    skipped: {
      icon: AlertCircle,
      bg: 'bg-sky-50',
      border: 'border-sky-300',
      text: 'text-sky-700',
      label: '已跳过',
      badgeClass: 'badge-info',
    },
  }[schedule.status];

  const StatusIcon = statusConfig.icon;
  const isMine = schedule.volunteerId === currentUserId;
  const canClaim = schedule.status === 'unclaimed';
  const canComplete = schedule.status === 'claimed' && isMine;
  const canUnclaim = schedule.status === 'claimed' && isMine && onUnclaim;

  return (
    <div
      className={`p-4 rounded-xl border-2 ${statusConfig.bg} ${statusConfig.border} transition-all duration-200 hover:shadow-card`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
              schedule.status === 'completed' ? 'bg-primary-200' : 'bg-white'
            }`}
          >
            {cropEmoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {showDate && (
                <span className="text-sm font-medium text-forest-800">
                  {getDayLabel(schedule.scheduledDate)} · {formatDate(schedule.scheduledDate)}
                </span>
              )}
              <span className={`badge ${statusConfig.badgeClass}`}>
                {TIME_SLOT_LABELS[schedule.timeSlot as TimeSlot]}
              </span>
              <span className={`badge ${statusConfig.badgeClass}`}>
                {statusConfig.label}
              </span>
              {isMine && <span className="badge badge-warning">我的</span>}
            </div>

            {schedule.gardenBed && (
              <p className="mt-1 font-medium text-forest-800">
                {schedule.gardenBed.bedNumber} · {schedule.gardenBed.crop}
              </p>
            )}

            {schedule.volunteer && (
              <div className="mt-2 flex items-center gap-2 text-sm text-forest-600">
                <User size={14} />
                <span>{schedule.volunteer.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusIcon size={20} className={statusConfig.text} />

          <div className="flex gap-2">
            {canClaim && onClaim && (
              <button
                onClick={onClaim}
                className="btn btn-primary text-sm py-1.5 px-3"
              >
                <Hand size={14} />
                认领
              </button>
            )}
            {canComplete && onComplete && (
              <button
                onClick={onComplete}
                className="btn btn-primary text-sm py-1.5 px-3"
              >
                <CheckCircle size={14} />
                打卡
              </button>
            )}
            {canUnclaim && (
              <button
                onClick={onUnclaim}
                className="btn btn-outline text-sm py-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50"
                title="取消认领"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
