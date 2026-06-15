import { useState, useMemo } from 'react';
import {
  FileText,
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  Wrench,
  Package,
  Send,
  Filter,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  OPERATION_TYPE_LABELS,
  CLOTHING_TYPE_LABELS,
  SIZE_LIST,
  type OperationType,
  type ExchangeRecord,
  type Size,
} from '@/types';

const operationIcons: Record<OperationType, typeof ArrowDownCircle> = {
  exchange_in: ArrowDownCircle,
  exchange_out: ArrowUpCircle,
  match_stock: Package,
  match_swap: Repeat,
  manual_process: Wrench,
  stock_in: ArrowDownCircle,
  stock_out: ArrowUpCircle,
};

const operationColors: Record<OperationType, string> = {
  exchange_in: 'text-green-500 bg-green-100',
  exchange_out: 'text-orange-500 bg-orange-100',
  match_stock: 'text-blue-500 bg-blue-100',
  match_swap: 'text-purple-500 bg-purple-100',
  manual_process: 'text-amber-500 bg-amber-100',
  stock_in: 'text-emerald-500 bg-emerald-100',
  stock_out: 'text-red-500 bg-red-100',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecordsPage() {
  const records = useAppStore((s) => s.records);
  const [filterType, setFilterType] = useState<OperationType | 'all'>('all');
  const [filterSize, setFilterSize] = useState<Size | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (filterType !== 'all' && record.operationType !== filterType)
        return false;
      if (filterSize !== 'all') {
        const matchOriginal = record.originalSize === filterSize;
        const matchTarget = record.targetSize === filterSize;
        if (!matchOriginal && !matchTarget) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          record.studentName?.toLowerCase().includes(query) ||
          record.className?.toLowerCase().includes(query) ||
          record.operator.toLowerCase().includes(query) ||
          record.remark?.toLowerCase().includes(query) ||
          CLOTHING_TYPE_LABELS[record.clothingType].toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [records, filterType, filterSize, searchQuery]);

  const RecordItem = ({ record }: { record: ExchangeRecord }) => {
    const Icon = operationIcons[record.operationType];
    const colorClass = operationColors[record.operationType];
    const isExchangeOut = record.operationType === 'exchange_out';
    const isExchangeIn = record.operationType === 'exchange_in';
    const displaySize = isExchangeOut ? record.originalSize : record.targetSize;
    const sizeLabel = isExchangeOut ? '交出尺码' : isExchangeIn ? '收到尺码' : null;

    return (
      <div className="flex gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 w-px bg-slate-200 mt-2" />
        </div>
        <div className="flex-1 pb-2 min-w-0">
          <div className="flex items-start justify-between mb-1 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-800">
                {OPERATION_TYPE_LABELS[record.operationType]}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {CLOTHING_TYPE_LABELS[record.clothingType]}
              </span>
              {sizeLabel && displaySize && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isExchangeOut ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {sizeLabel}：{displaySize}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">
              {formatDate(record.createdAt)}
            </span>
          </div>
          {record.studentName && (
            <div className="text-sm text-slate-700 mb-1 font-medium">
              {record.studentName}
              {record.className && (
                <span className="text-slate-500 font-normal ml-1">
                  · {record.className}
                </span>
              )}
            </div>
          )}
          {(record.originalSize || record.targetSize) && !sizeLabel && (
            <div className="text-sm text-slate-500 mb-1">
              {record.originalSize && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100">
                  {record.originalSize}
                </span>
              )}
              {record.originalSize && record.targetSize && (
                <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-slate-400" />
              )}
              {record.targetSize && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                  {record.targetSize}
                </span>
              )}
              <span className="ml-2 text-slate-400 text-xs">
                数量：{record.quantity}
              </span>
            </div>
          )}
          {record.remark && (
            <div className="text-xs text-slate-500 mt-1.5 bg-slate-50 px-2 py-1 rounded inline-block">
              {record.remark}
            </div>
          )}
          <div className="text-xs text-slate-400 mt-1.5">
            操作人：{record.operator}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">流水记录</h2>
          <p className="text-sm text-slate-500 mt-1">
            所有换入换出操作记录
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
            共 <span className="font-bold">{records.length}</span> 条记录
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索学生、班级、衣服类型、操作人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value as Size | 'all')}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm appearance-none pr-8 cursor-pointer"
          >
            <option value="all">全部尺码</option>
            {SIZE_LIST.map((size) => (
              <option key={size} value={size}>
                {size} 码
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as OperationType | 'all')}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm appearance-none pr-8 cursor-pointer"
          >
            <option value="all">全部类型</option>
            {Object.entries(OPERATION_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredRecords.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((record) => (
              <RecordItem key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-1">
              暂无流水记录
            </h3>
            <p className="text-sm text-slate-400">没有找到匹配的操作记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
