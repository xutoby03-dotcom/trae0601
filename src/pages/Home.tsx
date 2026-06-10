import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Archive,
  Sparkles,
  Gift,
  Plus,
  AlertTriangle,
  BarChart3,
  CloudRain,
  Heart,
  Moon,
} from 'lucide-react';
import { useToyStore } from '@/store/useToyStore';
import { ToyCard } from '@/components/ToyCard';
import { cn } from '@/lib/utils';
import type { ToyStatus, ToyTag } from '@/types';
import { STATUS_LABELS, TAG_LABELS } from '@/types';

const statusGroups: { status: ToyStatus; icon: typeof Play; color: string; bgColor: string }[] = [
  { status: 'playing', icon: Play, color: 'text-mint-600', bgColor: 'bg-mint-100' },
  { status: 'stored', icon: Archive, color: 'text-sky-600', bgColor: 'bg-sky-100' },
  { status: 'cleaning', icon: Sparkles, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { status: 'giving', icon: Gift, color: 'text-pink-600', bgColor: 'bg-pink-100' },
];

const tagFilters: { tag: ToyTag; icon: typeof CloudRain }[] = [
  { tag: 'rainy', icon: CloudRain },
  { tag: 'parent-child', icon: Heart },
  { tag: 'quiet', icon: Moon },
];

export default function Home() {
  const { toys, getToysByStatus, getToysByTag } = useToyStore();
  const [activeFilter, setActiveFilter] = useState<ToyStatus | 'all' | ToyTag>('all');
  const [filterType, setFilterType] = useState<'status' | 'tag'>('status');

  const hasSmallPartsToys = toys.filter((t) => t.hasSmallParts && t.status === 'playing');
  const showSafetyWarning = hasSmallPartsToys.length > 0;

  const getFilteredToys = () => {
    if (activeFilter === 'all') {
      return toys.filter((t) => t.status !== 'away');
    }
    if (filterType === 'status') {
      return getToysByStatus(activeFilter as ToyStatus);
    }
    return getToysByTag(activeFilter as ToyTag).filter((t) => t.status !== 'away');
  };

  const filteredToys = getFilteredToys();

  const handleStatusClick = (status: ToyStatus) => {
    setFilterType('status');
    setActiveFilter(status === activeFilter ? 'all' : status);
  };

  const handleTagClick = (tag: ToyTag) => {
    setFilterType('tag');
    setActiveFilter(tag === activeFilter ? 'all' : tag);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-mint-50">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🧸 玩具轮换箱</h1>
            <p className="text-sm text-gray-500 mt-1">让每一件玩具都被好好利用</p>
          </div>
          <Link
            to="/stats"
            className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <BarChart3 className="text-primary-500" size={22} />
          </Link>
        </div>

        {/* 安全提醒 */}
        {showSafetyWarning && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-red-800 text-sm">安全提醒</p>
                <p className="text-red-600 text-xs mt-0.5">
                  当前有 {hasSmallPartsToys.length} 件含小零件的玩具正在玩，请注意看护小龄儿童，避免误食风险。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 状态分组卡片 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {statusGroups.map(({ status, icon: Icon, color, bgColor }) => {
            const count = getToysByStatus(status).length;
            const isActive = filterType === 'status' && activeFilter === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300',
                  isActive
                    ? `${bgColor} ring-2 ring-offset-2 ring-primary-400 scale-105`
                    : 'bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
                )}
              >
                <div className={cn('p-2.5 rounded-xl', bgColor)}>
                  <Icon className={color} size={24} />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{STATUS_LABELS[status]}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 场景筛选标签 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tagFilters.map(({ tag, icon: Icon }) => {
            const isActive = filterType === 'tag' && activeFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                )}
              >
                <Icon size={16} />
                {TAG_LABELS[tag]}
              </button>
            );
          })}
          {(activeFilter !== 'all') && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* 玩具列表标题 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">
            {activeFilter === 'all'
              ? '全部玩具'
              : filterType === 'status'
              ? STATUS_LABELS[activeFilter as ToyStatus]
              : TAG_LABELS[activeFilter as ToyTag]}
            <span className="text-gray-400 font-normal text-sm ml-2">
              ({filteredToys.length})
            </span>
          </h2>
        </div>

        {/* 玩具卡片网格 */}
        {filteredToys.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredToys.map((toy) => (
              <ToyCard key={toy.id} toy={toy} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">这里还没有玩具</p>
            <p className="text-gray-400 text-sm mt-1">点击下方按钮添加第一件玩具吧</p>
          </div>
        )}
      </div>

      {/* 底部添加按钮 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Link
          to="/add"
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          <span className="font-medium">添加玩具</span>
        </Link>
      </div>
    </div>
  );
}
