import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGearStore } from '../stores/useGearStore';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import {
  Package,
  ArrowRightLeft,
  Sun,
  Wrench,
  AlertTriangle,
  Plus,
  LogOut,
  LogIn,
  Clock,
  User,
  MapPin,
} from 'lucide-react';
import { formatDateTime, getOverdueHours } from '../utils/date';
import { cn } from '../lib/utils';

interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, color, bgColor, delay = 0 }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick, gradient, delay = 0 }: {
  icon: any;
  label: string;
  onClick: () => void;
  gradient: string;
  delay?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-6 rounded-2xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 animate-in fade-in slide-in-from-bottom-4',
        gradient
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="w-8 h-8" />
      <span className="text-base">{label}</span>
    </button>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { fetchAll, summary, overdueItems, gears, loading } = useGearStore();
  const [showLendModal, setShowLendModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const statCards = [
    { icon: Package, label: '在柜数量', value: summary?.inCabinetCount || 0, color: 'text-green-600', bgColor: 'bg-green-100', delay: 100 },
    { icon: ArrowRightLeft, label: '借出中', value: summary?.lentCount || 0, color: 'text-purple-600', bgColor: 'bg-purple-100', delay: 200 },
    { icon: Sun, label: '待晾干', value: summary?.dryingCount || 0, color: 'text-orange-600', bgColor: 'bg-orange-100', delay: 300 },
    { icon: Wrench, label: '待维修', value: summary?.damagedCount || 0, color: 'text-red-600', bgColor: 'bg-red-100', delay: 400 },
    { icon: AlertTriangle, label: '超时未归', value: summary?.overdueCount || 0, color: 'text-red-600', bgColor: 'bg-red-100', delay: 500 },
  ];

  const availableGears = gears.filter((g) => g.status === 'in_cabinet');
  const lentGears = gears.filter((g) => g.status === 'lent');

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">雨具概览</h1>
        <p className="text-slate-500">管理所有雨具，让每一件都能及时归位</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionButton
          icon={Plus}
          label="新增雨具"
          onClick={() => navigate('/archive?action=add')}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={100}
        />
        <QuickActionButton
          icon={LogOut}
          label="借出登记"
          onClick={() => navigate('/lend-return?mode=lend')}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          delay={200}
        />
        <QuickActionButton
          icon={LogIn}
          label="归还登记"
          onClick={() => navigate('/lend-return?mode=return')}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          delay={300}
        />
      </div>

      {overdueItems.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-800">超时未归提醒</h2>
                <p className="text-sm text-red-600">以下雨具借出已超过24小时</p>
              </div>
            </div>
            <div className="space-y-3">
              {overdueItems.map((item, index) => (
                <div
                  key={item.record.id}
                  className="bg-white rounded-xl p-4 border border-red-200 animate-in fade-in slide-in-from-left-4"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.gear.photoUrl}
                        alt={item.gear.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.gear.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {item.record.borrower}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {item.record.destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(item.record.lendTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        已超时 {getOverdueHours(item.record.lendTime)} 小时
                      </div>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => navigate(`/lend-return?mode=return&gearId=${item.gear.id}`)}
                      >
                        立即归还
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms' }}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">可借出雨具 ({availableGears.length})</h2>
          {availableGears.length === 0 ? (
            <p className="text-slate-500 text-center py-8">暂无可借出的雨具</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {availableGears.slice(0, 5).map((gear, index) => (
                <div
                  key={gear.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-left-4"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <img
                    src={gear.photoUrl}
                    alt={gear.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900">{gear.name}</h3>
                    <p className="text-sm text-slate-500">{gear.location}</p>
                  </div>
                  <StatusBadge status={gear.status} />
                </div>
              ))}
              {availableGears.length > 5 && (
                <button
                  onClick={() => navigate('/archive')}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  查看全部 {availableGears.length} 件 →
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '600ms' }}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">借出中 ({lentGears.length})</h2>
          {lentGears.length === 0 ? (
            <p className="text-slate-500 text-center py-8">暂无借出中的雨具</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {lentGears.slice(0, 5).map((gear, index) => {
                const record = useGearStore.getState().records.find(
                  (r) => r.gearId === gear.id && r.status === 'active'
                );
                return (
                  <div
                    key={gear.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${700 + index * 100}ms` }}
                  >
                    <img
                      src={gear.photoUrl}
                      alt={gear.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900">{gear.name}</h3>
                      {record && (
                        <p className="text-sm text-slate-500">
                          {record.borrower} · {record.destination}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={gear.status} />
                  </div>
                );
              })}
              {lentGears.length > 5 && (
                <button
                  onClick={() => navigate('/lend-return')}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  查看全部 {lentGears.length} 件 →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
