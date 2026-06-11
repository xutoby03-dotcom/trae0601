import { Calendar, Users, Paperclip, MoreHorizontal } from 'lucide-react';
import { Meeting, MEETING_TYPE_LABELS } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface MeetingCardProps {
  meeting: Meeting;
  todoCount?: number;
  completedTodoCount?: number;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (meeting: Meeting) => void;
  onView?: (meeting: Meeting) => void;
  className?: string;
}

const meetingTypeColors: Record<string, string> = {
  weekly: 'bg-primary-100 text-primary-600',
  monthly: 'bg-info-100 text-info-600',
  project: 'bg-success-100 text-success-600',
  review: 'bg-accent-100 text-accent-600',
  emergency: 'bg-danger-100 text-danger-600',
  other: 'bg-gray-100 text-gray-600',
};

export default function MeetingCard({
  meeting,
  todoCount = 0,
  completedTodoCount = 0,
  onEdit,
  onDelete,
  onView,
  className,
}: MeetingCardProps) {
  const progress = todoCount > 0 ? Math.round((completedTodoCount / todoCount) * 100) : 0;

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer group',
        className
      )}
      onClick={() => onView?.(meeting)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              meetingTypeColors[meeting.type]
            )}
          >
            {MEETING_TYPE_LABELS[meeting.type]}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {meeting.title}
        </h3>

        <div className="space-y-2.5">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{formatDate(meeting.date)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{meeting.participants.length} 位参与者</span>
          </div>

          {meeting.attachments.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Paperclip className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{meeting.attachments.length} 个附件</span>
            </div>
          )}
        </div>

        {todoCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">待办进度</span>
              <span className="font-medium text-gray-700">
                {completedTodoCount}/{todoCount}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(meeting);
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
          >
            编辑
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(meeting);
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-danger-600 hover:bg-white rounded-lg transition-colors"
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}
