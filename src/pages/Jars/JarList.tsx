import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ArrowRight, Calendar, User } from 'lucide-react';
import { useJarStore } from '@/store/jarStore';
import { useBatchStore } from '@/store/batchStore';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/date';
import { JarStatus } from '@/types';

const statusFilters: { value: JarStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'sealed', label: '封存中' },
  { value: 'open', label: '已开罐' },
  { value: 'sold', label: '已售完' },
  { value: 'damaged', label: '已报损' },
];

export default function JarList() {
  const navigate = useNavigate();
  const { jars } = useJarStore();
  const { batches } = useBatchStore();
  const [statusFilter, setStatusFilter] = useState<JarStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const batchMap = useMemo(() => new Map(batches.map((b) => [b.id, b])), [batches]);

  const filteredJars = useMemo(() => {
    return jars.filter((j) => {
      const matchStatus = statusFilter === 'all' || j.status === statusFilter;
      const batch = batchMap.get(j.batchId);
      const matchSearch =
        j.jarNo.toLowerCase().includes(search.toLowerCase()) ||
        (batch && batch.name.toLowerCase().includes(search.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [jars, statusFilter, search, batchMap]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索罐号或茶品..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-72 rounded-lg border border-tea-200 bg-white focus:outline-none focus:border-teaGreen-400 focus:ring-2 focus:ring-teaGreen-100 transition-all"
            />
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex items-center gap-1 p-1 bg-tea-50 rounded-lg">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-white text-teaGreen-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => navigate('/jars/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增封罐
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {filteredJars.map((jar) => {
          const batch = batchMap.get(jar.batchId);
          return (
            <div
              key={jar.id}
              onClick={() => navigate(`/jars/${jar.id}`)}
              className="card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">{jar.jarNo}</p>
                  <p className="font-serif text-lg font-bold text-gray-800 mt-1">
                    {batch?.name || '未知批次'}
                  </p>
                </div>
                <StatusBadge status={jar.status} />
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  <span>{jar.operator}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(jar.sealedAt)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-tea-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">当前重量</p>
                  <p className="text-xl font-bold text-teaGreen-600 font-serif">
                    {jar.currentWeight}
                    <span className="text-sm font-normal text-gray-400 ml-1">g</span>
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teaGreen-500 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredJars.length === 0 && (
        <div className="card text-center py-16 text-gray-400">暂无匹配的封罐记录</div>
      )}
    </div>
  );
}
