import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ChevronDown, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CLEAN_ACTION_OPTIONS, DAMAGE_LABEL_MAP, MATERIAL_LABEL_MAP, formatDateShort, daysBetween } from '@/utils/constants';
import type { CleaningRecord, CleanMethodAction, Toy } from '@/types';
import { cn } from '@/lib/utils';

type TimeRange = '7d' | '30d' | 'all';

interface GroupedRecords {
  groupLabel: string;
  dateKey: string;
  records: (CleaningRecord & { toy: Toy })[];
}

function getToyMaterialInfo(toy: Toy) {
  return MATERIAL_LABEL_MAP.get(toy.material) || { label: '其他', icon: '📦', color: 'bg-gray-100 text-gray-600' };
}

function getGroupLabel(dateStr: string): { label: string; key: string } {
  const days = daysBetween(dateStr);
  const date = new Date(dateStr);
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (days === 0) return { label: '今天', key };
  if (days === 1) return { label: '昨天', key };
  return { label: formatDateShort(dateStr), key };
}

export default function CleaningPage() {
  const navigate = useNavigate();
  const { cleaningRecords, toys } = useAppStore();

  const [selectedToyId, setSelectedToyId] = useState<string>('');
  const [selectedMethods, setSelectedMethods] = useState<CleanMethodAction[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [toyDropdownOpen, setToyDropdownOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const totalRecords = cleaningRecords.length;
  const monthlyRecords = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return cleaningRecords.filter(r => r.date >= firstDayOfMonth).length;
  }, [cleaningRecords]);

  const filteredRecords = useMemo(() => {
    let result = [...cleaningRecords];

    if (selectedToyId) {
      result = result.filter(r => r.toyId === selectedToyId);
    }

    if (selectedMethods.length > 0) {
      result = result.filter(r =>
        selectedMethods.some(m => r.methods.includes(m))
      );
    }

    if (timeRange !== 'all') {
      const days = timeRange === '7d' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      result = result.filter(r => new Date(r.date) >= cutoffDate);
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(r => {
        const toy = toys.find(t => t.id === r.toyId);
        if (!toy) return false;
        return (
          toy.name.toLowerCase().includes(kw) ||
          (r.notes && r.notes.toLowerCase().includes(kw))
        );
      });
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cleaningRecords, selectedToyId, selectedMethods, timeRange, searchKeyword, toys]);

  const groupedRecords = useMemo<GroupedRecords[]>(() => {
    const groups = new Map<string, GroupedRecords>();

    for (const record of filteredRecords) {
      const toy = toys.find(t => t.id === record.toyId);
      if (!toy) continue;

      const { label, key } = getGroupLabel(record.date);
      if (!groups.has(key)) {
        groups.set(key, {
          groupLabel: label,
          dateKey: key,
          records: [],
        });
      }
      groups.get(key)!.records.push({ ...record, toy });
    }

    return Array.from(groups.values());
  }, [filteredRecords, toys]);

  const toggleMethod = (method: CleanMethodAction) => {
    setSelectedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const selectedToy = toys.find(t => t.id === selectedToyId);

  return (
    <div className="min-h-screen">
      <div className="container max-w-5xl py-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-display flex items-center gap-2">
                清洁记录中心 <span className="text-baby-400">📝</span>
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-baby-300"></span>
                  <span className="text-sm text-gray-500">
                    总记录 <span className="font-semibold text-gray-700">{totalRecords}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mint-300"></span>
                  <span className="text-sm text-gray-500">
                    本月 <span className="font-semibold text-gray-700">{monthlyRecords}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/cleaning/new')}
              className="btn-primary"
            >
              <Plus size={18} />
              新增记录
            </button>
          </div>

          <div className="card-base p-4 md:p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索玩具名称或备注..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="input-base pl-10"
                />
              </div>

              <div className="relative min-w-[200px]">
                <button
                  onClick={() => setToyDropdownOpen(!toyDropdownOpen)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border-2 transition-all',
                    selectedToyId
                      ? 'border-baby-200 bg-baby-50 text-baby-500'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Filter size={16} className="shrink-0" />
                    <span className="truncate">
                      {selectedToy ? selectedToy.name : '按玩具筛选'}
                    </span>
                  </span>
                  <ChevronDown size={16} className={cn('shrink-0 transition-transform', toyDropdownOpen && 'rotate-180')} />
                </button>

                {toyDropdownOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-card border border-gray-100 max-h-64 overflow-y-auto animate-fade-in">
                    <button
                      onClick={() => {
                        setSelectedToyId('');
                        setToyDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100',
                        !selectedToyId && 'text-baby-500 bg-baby-50 font-medium'
                      )}
                    >
                      全部玩具
                    </button>
                    {toys.map(toy => {
                      const matInfo = getToyMaterialInfo(toy);
                      return (
                        <button
                          key={toy.id}
                          onClick={() => {
                            setSelectedToyId(toy.id);
                            setToyDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-b-0',
                            selectedToyId === toy.id && 'text-baby-500 bg-baby-50'
                          )}
                        >
                          <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0', matInfo.color)}>
                            {matInfo.icon}
                          </span>
                          <span className="truncate text-sm font-medium">{toy.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 font-medium mr-1">清洁方式:</span>
                {CLEAN_ACTION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleMethod(opt.value)}
                    className={cn(
                      'chip-select text-sm',
                      selectedMethods.includes(opt.value) && 'active'
                    )}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
                {(['7d', '30d', 'all'] as TimeRange[]).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                      timeRange === range
                        ? 'bg-white text-baby-500 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {range === '7d' ? '7天' : range === '30d' ? '30天' : '全部'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="card-base p-16 text-center">
            <div className="text-6xl mb-4">🧹</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">还没有清洁记录</h3>
            <p className="text-gray-500 mb-6">去记录第一次清洁吧！</p>
            <button
              onClick={() => navigate('/cleaning/new')}
              className="btn-primary"
            >
              <Plus size={18} />
              新增清洁记录
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedRecords.map(group => (
              <div key={group.dateKey}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3.5 py-1.5 bg-gray-100 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {group.groupLabel}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                  <span className="text-xs text-gray-400">{group.records.length} 条记录</span>
                </div>

                <div className="space-y-3">
                  {group.records.map((record, idx) => {
                    const matInfo = getToyMaterialInfo(record.toy);
                    const date = new Date(record.date);
                    const damageInfo = record.hasDamage && record.damageType
                      ? DAMAGE_LABEL_MAP.get(record.damageType)
                      : null;

                    return (
                      <div
                        key={record.id}
                        className={cn(
                          'card-base card-hover p-4 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in-up',
                        )}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1 shrink-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-baby-100 to-mint-50 flex flex-col items-center justify-center shrink-0">
                            <span className="text-xl sm:text-2xl font-bold text-baby-500 leading-none">
                              {date.getDate()}
                            </span>
                            <span className="text-[10px] sm:text-xs text-baby-400 font-semibold mt-0.5">
                              {date.getMonth() + 1}月
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => {}}
                            className="flex items-center gap-2.5 mb-2 hover:opacity-80 transition-opacity text-left w-full"
                          >
                            <span className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0',
                              matInfo.color
                            )}>
                              {matInfo.icon}
                            </span>
                            <span className="font-semibold text-gray-800 truncate">
                              {record.toy.name}
                            </span>
                          </button>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {record.methods.map(method => {
                              const opt = CLEAN_ACTION_OPTIONS.find(o => o.value === method);
                              if (!opt) return null;
                              return (
                                <span
                                  key={method}
                                  className={cn('tag', opt.color)}
                                >
                                  {opt.icon} {opt.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end sm:items-end gap-3 sm:gap-2 shrink-0 max-w-[180px]">
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {record.hasDamage && damageInfo && (
                              <span className="tag bg-alert-100 text-alert-400 shadow-glow-red/50">
                                <AlertTriangle size={12} />
                                {damageInfo.icon} {damageInfo.label}
                              </span>
                            )}
                            {record.hasOdor && (
                              <span className="tag bg-amber-100 text-amber-600">
                                👃 异味
                              </span>
                            )}
                          </div>
                          {record.notes && (
                            <p className="text-xs text-gray-400 line-clamp-2 text-right max-w-[180px]">
                              {record.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
