import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { RecordCard } from '@/components/cleaning-record/RecordCard';
import { useAppStore } from '@/store/useAppStore';
import { DUST_LEVEL_LABELS } from '@/types';
import type { DustLevel } from '@/types';
import { parseISO } from 'date-fns';

export default function RecordList() {
  const { cleaningRecords, airConditioners } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dustFilter, setDustFilter] = useState<DustLevel | 'all'>('all');
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);

  const getACById = (id: string) => airConditioners.find((ac) => ac.id === id);

  const sortedRecords = [...cleaningRecords].sort(
    (a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
  );

  const filteredRecords = sortedRecords.filter((record) => {
    const ac = getACById(record.acId);
    const matchesSearch =
      ac?.room.includes(searchTerm) ||
      ac?.brand.includes(searchTerm) ||
      record.cleaner.includes(searchTerm);
    const matchesDust = dustFilter === 'all' || record.dustLevel === dustFilter;
    const matchesIncomplete = !onlyIncomplete || !record.installedBackAt;
    return matchesSearch && matchesDust && matchesIncomplete;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索房间、品牌、拆洗人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={dustFilter}
              onChange={(e) => setDustFilter(e.target.value as DustLevel | 'all')}
              className="pl-10 pr-8 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="all">全部灰尘程度</option>
              {Object.entries(DUST_LEVEL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              checked={onlyIncomplete}
              onChange={(e) => setOnlyIncomplete(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">仅显示未完成</span>
          </label>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {searchTerm || dustFilter !== 'all' || onlyIncomplete
              ? '没有找到匹配的记录'
              : '还没有清洗记录'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || dustFilter !== 'all' || onlyIncomplete
              ? '试试调整搜索条件'
              : '从首页选择一台空调开始清洗吧'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record, index) => (
            <RecordCard
              key={record.id}
              record={record}
              ac={getACById(record.acId)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
