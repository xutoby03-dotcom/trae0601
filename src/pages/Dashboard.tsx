import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  HandHeart,
  Clock,
  AlertTriangle,
  Package,
  TrendingUp,
  Calendar,
  ChevronRight,
  AlertCircle,
  MapPin,
  User,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { BORROW_STATUS_LABEL, CATEGORY_LABEL } from '@/types';
import { daysUntil, formatDate, isExpiringSoon, isLowStock, isToday } from '@/utils';

const stats = [
  { key: 'today', label: '今日借用', icon: HandHeart, color: 'from-primary-400 to-primary-600', bg: 'bg-primary-50', text: 'text-primary-700' },
  { key: 'pending', label: '待归还', icon: Clock, color: 'from-warning-400 to-warning-600', bg: 'bg-warning-50', text: 'text-warning-700' },
  { key: 'expiring', label: '临期物品', icon: AlertTriangle, color: 'from-orange-400 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700' },
  { key: 'lowstock', label: '低库存物品', icon: Package, color: 'from-rose-400 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-700' },
];

export default function Dashboard() {
  const { boxes, items, borrows } = useAppStore();

  const { todayCount, pendingCount, expiringCount, lowStockCount } = useMemo(() => {
    const todayCount = borrows.filter(b => isToday(b.borrowDate)).length;
    const pendingCount = borrows.filter(b => !b.actualReturnDate).length;
    const expiringCount = items.filter(i => isExpiringSoon(i.expiryDate) || dayjs(i.expiryDate).isBefore(dayjs(), 'day')).length;
    const lowStockCount = items.filter(i => isLowStock(i.quantity) && i.status !== 'damaged').length;
    return { todayCount, pendingCount, expiringCount, lowStockCount };
  }, [borrows, items]);

  const todayBorrows = useMemo(
    () => borrows.filter(b => isToday(b.borrowDate)).slice(0, 6),
    [borrows]
  );

  const pendingReturns = useMemo(
    () =>
      borrows
        .filter(b => !b.actualReturnDate)
        .sort((a, b) => dayjs(a.expectedReturnDate).valueOf() - dayjs(b.expectedReturnDate).valueOf())
        .slice(0, 6),
    [borrows]
  );

  const expiringItems = useMemo(
    () =>
      items
        .filter(i => isExpiringSoon(i.expiryDate) || dayjs(i.expiryDate).isBefore(dayjs(), 'day'))
        .sort((a, b) => dayjs(a.expiryDate).valueOf() - dayjs(b.expiryDate).valueOf())
        .slice(0, 6),
    [items]
  );

  const lowStockItems = useMemo(
    () =>
      items
        .filter(i => isLowStock(i.quantity) && i.status !== 'damaged')
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 6),
    [items]
  );

  const getCount = (key: string) => {
    switch (key) {
      case 'today': return todayCount;
      case 'pending': return pendingCount;
      case 'expiring': return expiringCount;
      case 'lowstock': return lowStockCount;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">数据看板</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {formatDate(new Date())} · 社区活动室便民药箱总览
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="bg-white rounded-xl border border-zinc-100 p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-zinc-900 mt-2 font-mono">{getCount(stat.key)}</p>
                </div>
                <div className={'w-11 h-11 rounded-xl bg-gradient-to-br ' + stat.color + ' flex items-center justify-center text-white shadow-md'}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-zinc-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              今日借用
            </h3>
            <Link to="/borrows/new" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              新增借用 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-50 max-h-[320px] overflow-auto">
            {todayBorrows.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-sm">今日暂无借用记录</div>
            ) : (
              todayBorrows.map(b => (
                <div key={b.id} className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{b.residentName}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {b.building} · {b.itemName} × {b.quantity}
                    </p>
                  </div>
                  <span className={'badge-neutral ' + (b.status === 'overdue' ? 'bg-danger-50 text-danger-700' : '')}>
                    {BORROW_STATUS_LABEL[b.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning-600" />
              待归还
            </h3>
            <Link to="/borrows" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-50 max-h-[320px] overflow-auto">
            {pendingReturns.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-sm">暂无待归还物品</div>
            ) : (
              pendingReturns.map(b => {
                const daysLeft = daysUntil(b.expectedReturnDate);
                const isOverdue = daysLeft < 0;
                return (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900">{b.residentName} - {b.itemName}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        预计归还: {b.expectedReturnDate}
                      </p>
                    </div>
                    <span className={isOverdue ? 'badge-danger' : 'badge-warning'}>
                      {isOverdue ? '逾期 ' + Math.abs(daysLeft) + ' 天' : '剩余 ' + daysLeft + ' 天'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              临期物品
            </h3>
            <Link to="/inventory" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              库存管理 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-50 max-h-[320px] overflow-auto">
            {expiringItems.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-sm">暂无临期物品</div>
            ) : (
              expiringItems.map(i => {
                const days = daysUntil(i.expiryDate);
                const isExpired = days < 0;
                const box = boxes.find(b => b.id === i.boxId);
                const searchQuery = encodeURIComponent(i.storageCell || i.name);
                return (
                  <Link
                    key={i.id}
                    to={'/inventory?search=' + searchQuery + '&boxId=' + i.boxId}
                    className="block px-5 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900">{i.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {box?.location ?? '未知位置'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {box?.manager ?? '-'}
                          </span>
                          <span>存放格: {i.storageCell}</span>
                        </p>
                      </div>
                      <span className={isExpired ? 'badge-danger' : 'badge-warning'}>
                        {isExpired ? '已过期' : days + ' 天后过期'}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              补货建议
            </h3>
            <Link to="/inventory/new" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              新增入库 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-50 max-h-[320px] overflow-auto">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-sm">暂无需要补货的物品</div>
            ) : (
              lowStockItems.map(i => {
                const suggestedQty = Math.max(10, i.quantity * 3);
                const box = boxes.find(b => b.id === i.boxId);
                const searchQuery = encodeURIComponent(i.storageCell || i.name);
                return (
                  <Link
                    key={i.id}
                    to={'/inventory?search=' + searchQuery + '&boxId=' + i.boxId}
                    className="block px-5 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900">
                          {CATEGORY_LABEL[i.category]} · {i.name}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {box?.location ?? '未知位置'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {box?.manager ?? '-'}
                          </span>
                          <span>当前库存: {i.quantity} · 建议补货 ≥ {suggestedQty}</span>
                        </p>
                      </div>
                      <span className={i.quantity <= 2 ? 'badge-danger' : 'badge-warning'}>
                        库存 {i.quantity}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
