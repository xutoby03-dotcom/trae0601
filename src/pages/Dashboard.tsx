import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, ShoppingCart, ChefHat } from 'lucide-react';
import StatusFilter from '@/components/seasoning/StatusFilter';
import SeasoningCard from '@/components/seasoning/SeasoningCard';
import { useSeasoningStore } from '@/store/useSeasoningStore';
import type { SeasoningStatusFilter, Seasoning } from '@/types';
import { getSeasoningStatus, needsRestock, getDaysRemaining } from '@/utils/seasoningUtils';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { seasonings } = useSeasoningStore();
  const [filter, setFilter] = useState<SeasoningStatusFilter>('all');

  const filteredSeasonings = useMemo(() => {
    const active = seasonings.filter((s) => s.status === 'active');

    return active
      .filter((s) => {
        const status = getSeasoningStatus(s);
        const restock = needsRestock(s);

        switch (filter) {
          case 'all':
            return status !== 'expired';
          case 'fresh':
            return status === 'fresh' && !restock;
          case 'soon':
            return status === 'soon';
          case 'expired':
            return status === 'expired';
          case 'restock':
            return restock && status !== 'expired';
          default:
            return true;
        }
      })
      .sort((a: Seasoning, b: Seasoning) => {
        const aDays = getDaysRemaining(a);
        const bDays = getDaysRemaining(b);
        return aDays - bDays;
      });
  }, [seasonings, filter]);

  const stats = useMemo(() => {
    const active = seasonings.filter((s) => s.status === 'active');
    let fresh = 0;
    let soon = 0;
    let expired = 0;
    let restock = 0;

    active.forEach((s) => {
      const status = getSeasoningStatus(s);
      if (status === 'expired') expired++;
      else if (status === 'soon') soon++;
      else fresh++;

      if (needsRestock(s) && status !== 'expired') restock++;
    });

    return { total: active.length, fresh, soon, expired, restock };
  }, [seasonings]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-gray-50 pb-24">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30">
                <ChefHat size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">厨房调料管家</h1>
                <p className="text-xs text-gray-500">共 {stats.total} 种调料在使用中</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/stats')}
              className="p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
            >
              <BarChart3 size={22} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <StatCard label="正常" value={stats.fresh} color="status-fresh" icon="✅" />
            <StatCard label="快到期" value={stats.soon} color="status-soon" icon="⏰" />
            <StatCard label="已过期" value={stats.expired} color="status-expired" icon="⚠️" />
            <StatCard label="需补货" value={stats.restock} color="status-restock" icon="🛒" />
          </div>

          <StatusFilter current={filter} onChange={setFilter} />
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6">
        {filteredSeasonings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧂</div>
            <p className="text-gray-500 mb-2">还没有{filter === 'all' ? '' : filterLabel(filter)}的调料</p>
            <p className="text-sm text-gray-400">点击右下角按钮添加第一个调料</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSeasonings.map((seasoning, index) => (
              <SeasoningCard key={seasoning.id} seasoning={seasoning} index={index} />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => navigate('/add')}
        className="fixed right-6 bottom-24 z-30 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg shadow-primary-500/40 flex items-center justify-center hover:bg-primary-600 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-lg border-t border-gray-100">
        <div className="container max-w-lg mx-auto px-4">
          <div className="grid grid-cols-3 py-2">
            <NavItem icon={<ChefHat size={20} />} label="看板" active onClick={() => navigate('/')} />
            <NavItem
              icon={<ShoppingCart size={20} />}
              label="补货"
              badge={stats.restock > 0 ? stats.restock : undefined}
              onClick={() => navigate('/restock')}
            />
            <NavItem
              icon={<BarChart3 size={20} />}
              label="统计"
              onClick={() => navigate('/stats')}
            />
          </div>
        </div>
      </nav>
    </div>
  );
}

function filterLabel(filter: string) {
  const labels: Record<string, string> = {
    fresh: '正常',
    soon: '快到期',
    expired: '已过期',
    restock: '需补货',
  };
  return labels[filter] || '';
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
      <div className="text-lg mb-1">{icon}</div>
      <div className={cn('text-lg font-bold', `text-${color}`)}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 py-2 relative transition-colors',
        active ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
      )}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-status-restock text-white text-xs rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
