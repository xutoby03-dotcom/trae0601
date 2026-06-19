import { Plus, ArrowLeft, Droplets, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PitcherCard } from '../components/PitcherCard';
import { useState } from 'react';
import { cn } from '../lib/utils';

type FilterType = 'all' | 'healthy' | 'warning' | 'expired';

export default function PitcherList() {
  const navigate = useNavigate();
  const pitchers = useStore((state) => state.pitchers);
  const getFilterStatus = useStore((state) => state.getFilterStatus);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredPitchers = pitchers.filter((pitcher) => {
    if (filter === 'all') return true;
    const status = getFilterStatus(pitcher.id);
    if (filter === 'healthy') return status === 'healthy' || status === 'normal';
    if (filter === 'warning') return status === 'warning';
    if (filter === 'expired') return status === 'expired';
    return true;
  });

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'healthy', label: '正常' },
    { key: 'warning', label: '即将到期' },
    { key: 'expired', label: '已过期' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">水壶管理</h1>
              <p className="text-sm text-gray-500">共 {pitchers.length} 个水壶</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/pitchers/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-all shadow-sm shadow-sky-200 hover:shadow-md hover:shadow-sky-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            新增水壶
          </button>
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0',
                filter === option.key
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 水壶卡片网格 */}
        {filteredPitchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPitchers.map((pitcher) => (
              <PitcherCard key={pitcher.id} pitcher={pitcher} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无水壶</h3>
            <p className="text-gray-500 mb-6">点击上方按钮添加你的第一个水壶吧</p>
            <button
              onClick={() => navigate('/pitchers/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              新增水壶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
