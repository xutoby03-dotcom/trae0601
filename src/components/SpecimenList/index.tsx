import { useState, useMemo } from 'react';
import { Search, Filter, Leaf, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useSpecimenStore } from '@/store/useSpecimenStore';
import SpecimenCard from '@/components/SpecimenCard';

type FilterType = 'all' | 'drying' | 'completed' | 'alert';

export default function SpecimenList() {
  const specimens = useSpecimenStore((s) => s.specimens);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredSpecimens = useMemo(() => {
    return specimens.filter((s) => {
      const matchSearch =
        s.plantName.toLowerCase().includes(search.toLowerCase()) ||
        s.collectionLocation.toLowerCase().includes(search.toLowerCase());

      let matchFilter = true;
      switch (filter) {
        case 'drying':
          matchFilter = !s.isCompleted;
          break;
        case 'completed':
          matchFilter = s.isCompleted;
          break;
        case 'alert':
          matchFilter =
            s.hasMold || s.hasEdgeRoll || s.hasColorFade || s.hasMissingLabel;
          break;
      }

      return matchSearch && matchFilter;
    });
  }, [specimens, search, filter]);

  const filters: { key: FilterType; label: string; icon: typeof Leaf; color: string }[] = [
    { key: 'all', label: '全部', icon: Leaf, color: 'text-forest-600 bg-forest-100' },
    { key: 'drying', label: '干燥中', icon: Clock, color: 'text-forest-500 bg-forest-50' },
    { key: 'completed', label: '已完成', icon: CheckCircle2, color: 'text-warning-gold bg-amber-50' },
    { key: 'alert', label: '异常', icon: AlertTriangle, color: 'text-warning-danger bg-red-50' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索植物名称或采集地点..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-white/80 backdrop-blur"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur rounded-xl border border-forest-100">
          <Filter className="w-4 h-4 text-gray-400 ml-2 mr-1" />
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive ? f.color + ' shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1">
        {filteredSpecimens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Leaf className="w-16 h-16 mb-4 opacity-30" />
            <p className="font-serif text-lg">暂无标本记录</p>
            <p className="text-sm mt-1">请在左侧录入新的植物标本</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-4">
            {filteredSpecimens.map((specimen) => (
              <SpecimenCard key={specimen.id} specimen={specimen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
