import { User, MapPin, Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';
import type { CleaningRecord, Bathroom } from '../types';
import { formatDate, getDaysSince } from '../utils/dateUtils';

interface CleaningRecordItemProps {
  record: CleaningRecord;
  bathroom: Bathroom | undefined;
}

const getUnhandledBadgeConfig = (days: number) => {
  if (days === 0) {
    return {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      label: '已处理',
      icon: <CheckCircle2 size={14} />,
    };
  }
  if (days <= 3) {
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      label: `未处理 ${days} 天`,
      icon: <Clock size={14} />,
    };
  }
  return {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: `未处理 ${days} 天`,
    icon: <Clock size={14} />,
  };
};

export const CleaningRecordItem = ({ record, bathroom }: CleaningRecordItemProps) => {
  const daysAgo = getDaysSince(record.cleaningDate);
  const badgeConfig = getUnhandledBadgeConfig(record.daysUnhandled);

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 to-orange-200" />
      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-orange-500 border-4 border-orange-100" />

      <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">{bathroom?.name || '未知浴室'}</span>
              {daysAgo <= 2 && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                  最近
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{formatDate(record.cleaningDate)}</span>
              <span className="mx-1">·</span>
              <Clock size={14} />
              <span>{daysAgo} 天前清洗</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badgeConfig.bg} ${badgeConfig.text}`}>
            {badgeConfig.icon}
            {badgeConfig.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <User size={16} className="text-orange-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">清洗人</div>
              <div className="text-sm font-medium text-gray-800">{record.cleanedBy}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPin size={16} className="text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">晾干地点</div>
              <div className="text-sm font-medium text-gray-800">{record.dryingLocation}</div>
            </div>
          </div>
        </div>

        {record.notes && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
            <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
