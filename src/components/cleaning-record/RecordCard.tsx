import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { User, Calendar, Sun, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CleaningRecord, AirConditioner } from '@/types';
import { DUST_LEVEL_LABELS, DRYING_STATUS_LABELS } from '@/types';

interface RecordCardProps {
  record: CleaningRecord;
  ac?: AirConditioner;
  index: number;
}

const dustLevelColors = {
  light: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  heavy: 'bg-red-100 text-red-700 border-red-200',
};

const dryingStatusColors = {
  not_dried: 'bg-gray-100 text-gray-700',
  drying: 'bg-amber-100 text-amber-700',
  dried: 'bg-green-100 text-green-700',
};

export function RecordCard({ record, ac, index }: RecordCardProps) {
  const isComplete = record.installedBackAt && record.dryingStatus === 'dried';

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {ac && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">❄️</span>
            </div>
            <div>
              <p className="font-bold text-gray-800">{ac.room}</p>
              <p className="text-xs text-gray-500">
                {ac.brand} {ac.model}
              </p>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
              isComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}
          >
            {isComplete ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {isComplete ? '已完成' : '进行中'}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">拆洗人：</span>
          <span className="font-medium text-gray-800">{record.cleaner}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">拆下时间：</span>
          <span className="font-medium text-gray-800">
            {format(parseISO(record.removedAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
          </span>
        </div>

        {record.installedBackAt && (
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">装回时间：</span>
            <span className="font-medium text-gray-800">
              {format(parseISO(record.installedBackAt), 'yyyy年MM月dd日 HH:mm', {
                locale: zhCN,
              })}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border',
              dustLevelColors[record.dustLevel]
            )}
          >
            灰尘{DUST_LEVEL_LABELS[record.dustLevel]}
          </span>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              dryingStatusColors[record.dryingStatus]
            )}
          >
            <Sun className="w-3 h-3 inline mr-1" />
            {DRYING_STATUS_LABELS[record.dryingStatus]}
          </span>
          {record.ventWiped && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              已擦出风口
            </span>
          )}
        </div>

        {record.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="text-gray-500">备注：</span>
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
