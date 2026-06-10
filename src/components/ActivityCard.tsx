import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, DollarSign, Clock3 } from 'lucide-react';
import type { Activity, Registration } from '../../shared/types.js';

interface ActivityCardProps {
  activity: Activity;
  registrations?: Registration[];
}

const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
  lecture: { label: '讲座', color: 'text-blue-600', bg: 'bg-blue-100' },
  boardgame: { label: '桌游夜', color: 'text-purple-600', bg: 'bg-purple-100' },
  photoshoot: { label: '外拍', color: 'text-amber-600', bg: 'bg-amber-100' },
  volunteer: { label: '志愿服务', color: 'text-green-600', bg: 'bg-green-100' },
};

function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return { date: `${month}月${day}日`, time: `${hours}:${minutes}` };
}

function getDaysRemaining(isoString: string) {
  const now = new Date();
  const target = new Date(isoString);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

export default function ActivityCard({ activity, registrations = [] }: ActivityCardProps) {
  const typeInfo = typeLabels[activity.type] || { label: activity.type, color: 'text-gray-600', bg: 'bg-gray-100' };
  const { date, time } = formatDateTime(activity.startTime);
  const registeredCount = registrations.filter((r) => r.status === 'registered').length;
  const waitlistCount = registrations.filter((r) => r.status === 'waitlist').length;
  const isAlmostFull = registeredCount >= activity.maxParticipants * 0.8;
  const isFull = registeredCount >= activity.maxParticipants;
  const isFree = activity.fee === 0;
  const daysRemaining = getDaysRemaining(activity.startTime);
  const isThisWeek = daysRemaining >= 0 && daysRemaining <= 7;

  return (
    <Link
      to={`/activity/${activity.id}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-md card-hover group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          {activity.requiresApproval && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
              需审核
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-bold text-lg line-clamp-2">{activity.title}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-primary-400" />
            <span>{date}</span>
            <span className="text-gray-400">{time}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-primary-400" />
          <span className="truncate">{activity.location}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-primary-400" />
            <span className={`text-sm font-medium ${isAlmostFull ? 'text-orange-500' : 'text-gray-600'}`}>
              {registeredCount}/{activity.maxParticipants}
              {waitlistCount > 0 && <span className="text-gray-400"> (+{waitlistCount}候补)</span>}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isFree ? (
              <span className="text-sm font-medium text-green-500">免费</span>
            ) : (
              <>
                <DollarSign className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium text-primary-500">¥{activity.fee}</span>
              </>
            )}
          </div>
        </div>

        {isFull && (
          <div className="bg-red-50 text-red-500 text-center py-2 rounded-lg text-sm font-medium">
            已满员
          </div>
        )}
        {isAlmostFull && !isFull && (
          <div className="bg-orange-50 text-orange-500 text-center py-2 rounded-lg text-sm font-medium">
            快满员啦
          </div>
        )}
        {isThisWeek && !isFull && (
          <div className="bg-secondary-50 text-secondary-600 text-center py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
            <Clock3 className="w-4 h-4" />
            本周活动
          </div>
        )}
      </div>
    </Link>
  );
}
