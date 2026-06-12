import type { Vaccine, Child } from '@/types';
import { AlertTriangle, Calendar, MapPin, Ticket, ChevronRight } from 'lucide-react';
import { formatDate, friendlyDateDiff, daysFromToday, formatDateTime } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

interface ReminderCardProps {
  vaccine: Vaccine;
  child?: Child;
  variant: 'overdue' | 'upcoming';
  onAppoint?: () => void;
}

export default function ReminderCard({ vaccine, child, variant, onAppoint }: ReminderCardProps) {
  const navigate = useNavigate();
  const isOverdue = variant === 'overdue';
  const diffDays = daysFromToday(isOverdue ? vaccine.latestDate : vaccine.suggestedDate);

  const bgClass = isOverdue
    ? 'bg-gradient-to-br from-danger-500 via-danger-500 to-rose-500'
    : 'bg-gradient-to-br from-accent-500 via-orange-500 to-amber-500';

  const dotColor = isOverdue ? 'bg-danger-200' : 'bg-accent-200';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${bgClass} text-white shadow-soft card-hover animate-fade-in-up`}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${dotColor} ${
                isOverdue ? 'animate-pulse-soft' : ''
              }`}
            />
            <span className="text-xs font-medium text-white/90">
              {isOverdue ? '逾期未预约' : '即将到期'}
            </span>
          </div>
          <button
            onClick={() => {
              if (onAppoint) onAppoint();
              else navigate('/vaccines');
            }}
            className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-medium backdrop-blur-sm transition-all"
          >
            {vaccine.status === 'appointed' ? '查看详情' : '立即预约'}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">
              {vaccine.name} · 第{vaccine.dose}剂
            </h3>
          </div>
          {child && (
            <p className="text-sm text-white/80">{child.name}</p>
          )}
        </div>

        <div className="space-y-2 text-sm text-white/90">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {isOverdue
                ? `最晚日期：${formatDate(vaccine.latestDate)}`
                : `建议日期：${formatDate(vaccine.suggestedDate)}`}
            </span>
          </div>
          {vaccine.status === 'appointed' && vaccine.appointmentTime && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>预约：{formatDateTime(vaccine.appointmentTime)}</span>
              </div>
              {vaccine.appointmentLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{vaccine.appointmentLocation}</span>
                </div>
              )}
              {vaccine.queueNumber && (
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  <span>排队号：{vaccine.queueNumber}</span>
                </div>
              )}
            </>
          )}
          {vaccine.status !== 'appointed' && (
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full ${
                  isOverdue ? 'bg-white/25' : 'bg-white/25'
                } font-medium`}
              >
                {isOverdue ? `已逾期 ${Math.abs(diffDays)} 天` : friendlyDateDiff(vaccine.suggestedDate)}
              </span>
              <ChevronRight className="w-4 h-4 text-white/70" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
