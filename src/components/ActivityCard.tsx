import { Link } from 'react-router-dom';
import { Activity, Registration } from '@/types';
import {
  MapPin,
  Users,
  Clock,
  UserCheck,
  Tent,
  Building2,
} from 'lucide-react';
import {
  formatDateTime,
  getConfirmedCount,
  getWaitlistCount,
  getActivityStatus,
  cn,
} from '@/utils/helpers';

interface ActivityCardProps {
  activity: Activity;
  registrations: Registration[];
}

const statusStyles: Record<string, string> = {
  success: 'bg-accent-100 text-accent-700 border-accent-200',
  warning: 'bg-primary-100 text-primary-700 border-primary-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  ended: 'bg-ink-400/20 text-ink-500 border-ink-400/30',
};

export default function ActivityCard({ activity, registrations }: ActivityCardProps) {
  const confirmed = getConfirmedCount(registrations);
  const waitlist = getWaitlistCount(registrations);
  const status = getActivityStatus(activity, registrations);
  const progress = Math.min((confirmed / activity.maxParticipants) * 100, 100);
  const isEnded = status.type === 'ended';

  return (
    <Link
      to={`/activity/${activity.id}`}
      className={cn(
        'card group block animate-slide-up',
        isEnded && 'opacity-70'
      )}
    >
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-primary-100 via-cream-100 to-accent-100 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,140,66,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(78,205,196,0.15),transparent_50%)]" />
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
            {activity.coverEmoji}
          </span>
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={cn(
              'chip border text-xs',
              activity.locationType === 'outdoor'
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-purple-100 text-purple-700 border-purple-200'
            )}>
              {activity.locationType === 'outdoor' ? (
                <Tent className="w-3 h-3" />
              ) : (
                <Building2 className="w-3 h-3" />
              )}
              {activity.locationType === 'outdoor' ? '户外' : '室内'}
            </span>
            <span className="chip bg-white/80 backdrop-blur text-primary-700 text-xs border border-primary-200">
              {activity.ageRange}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={cn('chip border text-xs', statusStyles[status.type])}>
              {status.type === 'success' && <UserCheck className="w-3 h-3" />}
              {status.label}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg text-ink-900 mb-3 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {activity.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-ink-700">
              <Clock className="w-4 h-4 text-primary-500 shrink-0" />
              <span className="truncate">{formatDateTime(activity.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-700">
              <MapPin className="w-4 h-4 text-accent-500 shrink-0" />
              <span className="truncate">{activity.location}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-ink-700">
                <Users className="w-4 h-4 text-primary-500" />
                <span>
                  <span className="font-bold text-ink-900">{confirmed}</span>
                  <span className="text-ink-500">/{activity.maxParticipants}人</span>
                </span>
              </div>
              {waitlist > 0 && (
                <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-lg">
                  候补 {waitlist} 人
                </span>
              )}
            </div>
            <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  progress >= 100
                    ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                    : 'bg-gradient-to-r from-accent-400 to-accent-600'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {activity.needParent && (
            <div className="mt-4 pt-4 border-t border-cream-200">
              <span className="chip bg-primary-50 text-primary-600 text-xs">
                👨‍👩‍👧 需家长陪同
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
