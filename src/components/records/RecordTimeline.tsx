import { useState } from 'react';
import { useRecordStore } from '@/store/recordStore';
import { OperationType } from '@/types';
import { formatDateShort, getOperationTypeText } from '@/utils/date';
import EmptyState from '@/components/common/EmptyState';
import { 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock4, 
  AlertCircle,
  Filter 
} from 'lucide-react';

const typeIcons: Record<OperationType, typeof PlusCircle> = {
  create: PlusCircle,
  complete: CheckCircle2,
  cancel: XCircle,
  reschedule: Clock4,
  timeout: AlertCircle,
};

const typeColors: Record<OperationType, string> = {
  create: 'bg-blue-50 text-blue-500 border-blue-200',
  complete: 'bg-emerald-50 text-emerald-500 border-emerald-200',
  cancel: 'bg-rose-50 text-rose-500 border-rose-200',
  reschedule: 'bg-amber-50 text-amber-500 border-amber-200',
  timeout: 'bg-purple-50 text-purple-500 border-purple-200',
};

const typeFilters: { key: OperationType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'create', label: '创建' },
  { key: 'complete', label: '取花' },
  { key: 'cancel', label: '取消' },
  { key: 'reschedule', label: '改期' },
  { key: 'timeout', label: '超时' },
];

export default function RecordTimeline() {
  const { records } = useRecordStore();
  const [filterType, setFilterType] = useState<OperationType | 'all'>('all');

  const filteredRecords = filterType === 'all'
    ? records
    : records.filter(r => r.type === filterType);

  const groupedRecords = filteredRecords.reduce((groups, record) => {
    const date = new Date(record.createdAt).toLocaleDateString('zh-CN');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, typeof filteredRecords>);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-forest-500">
          <Filter className="w-4 h-4" />
          筛选：
        </div>
        <div className="flex gap-2 flex-wrap">
          {typeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === filter.key
                  ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-md'
                  : 'bg-white text-forest-500 hover:bg-cream-100 border border-cream-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(groupedRecords).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([date, dayRecords]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cream-100 rounded-full text-sm font-medium text-forest-600">
                  {date}
                </div>
                <div className="flex-1 h-px bg-cream-200" />
                <span className="text-sm text-forest-400">
                  {dayRecords.length} 条记录
                </span>
              </div>
              
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-cream-200" />
                
                <div className="space-y-4">
                  {dayRecords.map((record) => {
                    const Icon = typeIcons[record.type];
                    return (
                      <div 
                        key={record.id} 
                        className="relative animate-fade-in-up"
                      >
                        <div className={`absolute -left-4 top-3 w-5 h-5 rounded-full border-2 ${typeColors[record.type]} flex items-center justify-center`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-soft p-4 hover:shadow-hover transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${typeColors[record.type]}`}>
                                {getOperationTypeText(record.type)}
                              </span>
                              <span className="text-sm font-medium text-forest-700">
                                {record.customerName}
                              </span>
                            </div>
                            <span className="text-xs text-forest-400">
                              {formatDateShort(record.createdAt).split(' ')[1]}
                            </span>
                          </div>
                          
                          <p className="text-sm text-forest-600 mb-2">
                            {record.bouquetName}
                          </p>
                          
                          {record.note && (
                            <p className="text-xs text-forest-400 bg-cream-50 rounded-lg px-3 py-2">
                              {record.note}
                            </p>
                          )}
                          
                          <p className="text-xs text-forest-400 mt-2">
                            操作人：{record.operator}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="暂无操作记录"
          description="还没有任何操作记录"
        />
      )}
    </div>
  );
}
