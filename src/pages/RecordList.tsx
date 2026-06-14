import { useState, useMemo } from 'react';
import { Search, Filter, Home, XCircle } from 'lucide-react';
import { RecordCard } from '@/components/cleaning-record/RecordCard';
import { useAppStore } from '@/store/useAppStore';
import { DUST_LEVEL_LABELS } from '@/types';
import type { DustLevel } from '@/types';
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function RecordList() {
  const { cleaningRecords, airConditioners } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [dustFilter, setDustFilter] = useState<DustLevel | 'all'>('all');
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);

  const getACById = (id: string) => airConditioners.find((ac) => ac.id === id);

  const rooms = useMemo(() => {
    return airConditioners.map((ac) => ac.room);
  }, [airConditioners]);

  const hasActiveFilter =
    searchTerm !== '' || roomFilter !== 'all' || dustFilter !== 'all' || onlyIncomplete;

  const sortedRecords = [...cleaningRecords].sort(
    (a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
  );

  const filteredRecords = sortedRecords.filter((record) => {
    const ac = getACById(record.acId);

    const matchesSearch =
      !searchTerm ||
      ac?.room.includes(searchTerm) ||
      ac?.brand.includes(searchTerm) ||
      record.cleaner.includes(searchTerm);

    const matchesRoom = roomFilter === 'all' || ac?.room === roomFilter;

    const matchesDust = dustFilter === 'all' || record.dustLevel === dustFilter;

    const matchesIncomplete = !onlyIncomplete || (!record.installedBackAt && record.dryingStatus !== 'not_dried');

    return matchesSearch && matchesRoom && matchesDust && matchesIncomplete;
  });

  const handleClearFilter = () => {
    setSearchTerm('');
    setRoomFilter('all');
    setDustFilter('all');
    setOnlyIncomplete(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            清洗记录
            <span className="text-base font-normal text-gray-500">
              共 {filteredRecords.length} 条
            </span>
            {hasActiveFilter && (
              <button
                onClick={handleClearFilter}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium',
                  'bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors'
                )}
              >
                <XCircle className="w-4 h-4" />
                清空筛选
              </button>
            )}
          </h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索房间、品牌、拆洗人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="relative min-w-[140px]">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="all">全部房间</option>
            {rooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[140px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={dustFilter}
            onChange={(e) => setDustFilter(e.target.value as DustLevel | 'all')}
            className="w-full pl-10 pr-8 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="all">全部灰尘程度</option>
            {Object.entries(DUST_LEVEL_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <label
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-colors',
            onlyIncomplete
              ? 'bg-amber-50 border-amber-400 text-amber-700'
              : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
          )}
        >
          <input
            type="checkbox"
            checked={onlyIncomplete}
            onChange={(e) => setOnlyIncomplete(e.target.checked)}
            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
          />
          <span className="text-sm font-medium whitespace-nowrap">仅看晾干中未装回</span>
        </label>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {hasActiveFilter ? '没有找到匹配的记录' : '还没有清洗记录'}
          </h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilter ? '试试调整搜索条件或清空筛选' : '从首页选择一台空调开始清洗吧'}
          </p>
          {hasActiveFilter && (
            <button
              onClick={handleClearFilter}
              className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              清空筛选
            </button>
          )}
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
