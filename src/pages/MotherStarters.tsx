import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStarterStore } from '@/store/useStarterStore';
import StarterCard from '@/components/StarterCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Filter, Search } from 'lucide-react';
import { StarterStatus } from '@/types';

export default function MotherStarters() {
  const navigate = useNavigate();
  const { starters } = useStarterStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StarterStatus | 'all'>('all');

  const filteredStarters = starters.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.flourType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: StarterStatus.HEALTHY, label: '合格' },
    { value: StarterStatus.LOCKED, label: '锁定' },
    { value: StarterStatus.COLD, label: '冷藏' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-bread-800">母种档案</h1>
          <p className="text-bread-500 mt-1">管理所有酸种母种的详细信息</p>
        </div>
        <button
          onClick={() => navigate('/starters/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建母种
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bread-400" />
          <input
            type="text"
            placeholder="搜索酸种名称或面粉类型..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-bread-400" />
          <div className="flex gap-2">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value as StarterStatus | 'all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === option.value
                    ? 'bg-bread-500 text-white'
                    : 'bg-white text-bread-600 hover:bg-bread-50 border border-bread-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredStarters.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-bread-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-bread-400" />
          </div>
          <p className="text-bread-500 text-lg">没有找到匹配的酸种</p>
          <p className="text-bread-400 mt-2">尝试调整搜索条件或筛选器</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStarters.map((starter, index) => (
            <StarterCard
              key={starter.id}
              starter={starter}
              delay={index * 50}
            />
          ))}
        </div>
      )}
    </div>
  );
}
