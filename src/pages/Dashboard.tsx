import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ArrowRightLeft, 
  Clock, 
  Wallet, 
  Plus, 
  RotateCcw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatusTag } from '@/components/StatusTag';
import { formatDateTime, formatCurrency } from '@/utils/helpers';
import type { BorrowRecord } from '@/types';

export function Dashboard() {
  const { bags, records } = useAppStore();
  
  const stats = useMemo(() => {
    const totalBags = bags.length;
    const borrowedCount = bags.filter(b => b.status === 'borrowed').length;
    const overdueCount = records.filter(r => r.status === 'overdue').length;
    const totalDeposit = records
      .filter(r => r.status === 'active' || r.status === 'overdue')
      .reduce((sum, r) => {
        const bag = bags.find(b => b.id === r.bagId);
        return sum + (bag?.deposit || 0);
      }, 0);
    
    return { totalBags, borrowedCount, overdueCount, totalDeposit };
  }, [bags, records]);
  
  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [records]);
  
  const statCards = [
    {
      label: '保温袋总数',
      value: stats.totalBags,
      unit: '个',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      trend: '+0 本周',
    },
    {
      label: '借出中',
      value: stats.borrowedCount,
      unit: '个',
      icon: ArrowRightLeft,
      color: 'from-primary-500 to-primary-600',
      bg: 'bg-orange-50',
      text: 'text-primary-600',
      trend: '占比 ' + (stats.totalBags ? Math.round(stats.borrowedCount / stats.totalBags * 100) : 0) + '%',
    },
    {
      label: '超时未还',
      value: stats.overdueCount,
      unit: '个',
      icon: Clock,
      color: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      text: 'text-red-600',
      trend: '需催还',
    },
    {
      label: '在押金额',
      value: formatCurrency(stats.totalDeposit),
      unit: '',
      icon: Wallet,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      trend: '待退还',
    },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-800">{card.value}</span>
                    <span className="text-sm text-gray-400">{card.unit}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.text}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">{card.trend}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">最近动态</h3>
          <div className="space-y-3">
            {recentRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>暂无记录</p>
              </div>
            ) : (
              recentRecords.map((record) => (
                <RecentRecordItem key={record.id} record={record} />
              ))
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/borrow"
            className="block bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-warm-md hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">快速借出</h4>
                <p className="text-sm text-white/80">登记骑手信息</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/return"
            className="block bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">快速归还</h4>
                <p className="text-sm text-white/80">检查袋子状态</p>
              </div>
            </div>
          </Link>
          
          {stats.overdueCount > 0 && (
            <Link
              to="/overdue"
              className="block bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 animate-pulse-soft"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{stats.overdueCount} 个待催还</h4>
                  <p className="text-sm text-white/80">点击查看详情</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentRecordItem({ record }: { record: BorrowRecord }) {
  const bag = useAppStore(state => state.bags.find(b => b.id === record.bagId));
  
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50/50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
        {bag?.photo && (
          <img src={bag.photo} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 text-sm">{record.riderName}</span>
          <StatusTag type="borrow" status={record.status} size="sm" />
        </div>
        <p className="text-xs text-gray-500 truncate">
          {bag?.code} · {formatDateTime(record.createdAt)}
        </p>
      </div>
    </div>
  );
}
