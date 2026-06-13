import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  Pill,
  Users,
  Plane,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Package,
  Sparkles,
  Heart,
  TrendingUp,
  Plus,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { isExpired, isExpiringSoon, getLowStockMedicines } from '@/utils/medicine';
import { formatDate, daysUntil } from '@/utils/date';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CATEGORY_LABELS } from '@/types';

export default function Dashboard() {
  const { familyMembers, medicines, trips, tripItems } = useAppStore();

  const stats = useMemo(() => {
    const total = medicines.length;
    const expired = medicines.filter(isExpired);
    const expiring = medicines.filter(isExpiringSoon);
    const lowStock = getLowStockMedicines(medicines, 3);
    const upcomingTrips = trips
      .filter((t) => t.status === 'planning' || t.status === 'ongoing')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3);

    const totalConsumedAllTime = tripItems.reduce((s, ti) => s + ti.consumedQuantity, 0);
    const completedTrips = trips.filter((t) => t.status === 'completed').length;

    const categoryStats = Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
      key: k,
      ...v,
      count: medicines.filter((m) => m.category === k).length,
    }));

    return {
      total,
      expired,
      expiring,
      lowStock,
      upcomingTrips,
      totalConsumedAllTime,
      completedTrips,
      categoryStats,
    };
  }, [medicines, trips, tripItems]);

  const warningsCount =
    stats.expired.length + stats.expiring.length + stats.lowStock.length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-6 lg:p-8 text-white">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute right-20 top-10 w-24 h-24 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-sand-400/20" />
        <Heart className="absolute right-8 bottom-4 text-white/20" size={120} />

        <div className="relative z-10">
          <p className="text-brand-100 text-sm mb-2">🏥 家庭健康管家</p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2 leading-tight">
            让每一次旅行，
            <br className="sm:hidden" />
            都安心无忧
          </h1>
          <p className="text-brand-100/90 max-w-lg text-sm">
            管理家庭常备药、智能生成旅行清单、追踪打包和消耗，再也不担心漏带药、带错药
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/trips/new">
              <Button className="!bg-white !text-brand-700 hover:!bg-brand-50 shadow-lg" leftIcon={<Plus size={16} />}>
                规划新旅行
              </Button>
            </Link>
            <Link to="/medicines">
              <Button
                variant="ghost"
                className="!text-white/90 hover:!bg-white/10 border-2 border-white/20"
                leftIcon={<Pill size={16} />}
              >
                查看药品档案
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          {
            label: '家庭成员',
            value: familyMembers.length,
            sub: '位家人',
            icon: Users,
            color: 'from-violet-400 to-violet-600',
          },
          {
            label: '药品档案',
            value: stats.total,
            sub: '份常备药',
            icon: Pill,
            color: 'from-brand-400 to-brand-600',
          },
          {
            label: '完成旅行',
            value: stats.completedTrips,
            sub: '次健康出行',
            icon: Plane,
            color: 'from-blue-400 to-blue-600',
          },
          {
            label: '历史消耗',
            value: stats.totalConsumedAllTime,
            sub: '份药品',
            icon: TrendingUp,
            color: 'from-sand-400 to-sand-500',
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card !p-5 !rounded-2xl card-hover">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-sm`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <p className="font-display text-3xl font-bold text-slate-900 leading-none">
                {s.value}
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                {s.label} · {s.sub}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={18} />
                健康提醒
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {warningsCount > 0 ? `共 ${warningsCount} 条需要关注` : '一切正常，继续保持！'}
              </p>
            </div>
            <Link to="/medicines">
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />}>
                查看全部
              </Button>
            </Link>
          </div>

          {warningsCount === 0 ? (
            <div className="py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <p className="font-semibold text-emerald-700">状态良好！</p>
              <p className="text-sm text-slate-500 mt-1">
                暂无过期、临期或低库存药品
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
              {stats.expired.map((m) => (
                <Link
                  key={m.id}
                  to="/medicines"
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100/70 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-white">
                    <AlertCircle size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{m.name}</p>
                    <p className="text-xs text-red-600">已过期 · 有效期至 {formatDate(m.expiryDate)}</p>
                  </div>
                  <Badge variant="danger">过期</Badge>
                </Link>
              ))}
              {stats.expiring.map((m) => (
                <Link
                  key={m.id}
                  to="/medicines"
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100/70 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{m.name}</p>
                    <p className="text-xs text-amber-700">
                      即将到期 · 还剩 {daysUntil(m.expiryDate)} 天
                    </p>
                  </div>
                  <Badge variant="warning">临期</Badge>
                </Link>
              ))}
              {stats.lowStock
                .filter((m) => !isExpired(m) && !isExpiringSoon(m))
                .map((m) => (
                  <Link
                    key={m.id}
                    to="/medicines"
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100/70 transition"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                      <Package size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{m.name}</p>
                      <p className="text-xs text-blue-600">库存偏低 · 仅剩 {m.stockQuantity} 份</p>
                    </div>
                    <Badge variant="info">低库存</Badge>
                  </Link>
                ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-sand-500" size={18} />
              药品分类
            </h3>
          </div>

          <div className="space-y-2.5">
            {stats.categoryStats.map((cat) => {
              const max = Math.max(...stats.categoryStats.map((c) => c.count), 1);
              const pct = max > 0 ? (cat.count / max) * 100 : 0;
              return (
                <div key={cat.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700">{cat.label}</span>
                    <span className="font-bold text-slate-900">{cat.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all',
                        cat.count > 0 ? 'bg-gradient-to-r from-brand-400 to-brand-500' : 'bg-transparent'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Plane className="text-brand-500" size={18} />
              即将出发 / 进行中
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {stats.upcomingTrips.length > 0 ? '准备好迎接下一次旅行了吗？' : '暂时没有规划中的旅行'}
            </p>
          </div>
          <Link to="/trips/new">
            <Button size="sm" leftIcon={<Plus size={14} />}>
              规划新旅行
            </Button>
          </Link>
        </div>

        {stats.upcomingTrips.length === 0 ? (
          <div className="py-8 text-center">
            <Plane size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              点击「规划新旅行」创建第一次出行计划吧
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.upcomingTrips.map((trip) => {
              const items = tripItems.filter((ti) => ti.tripId === trip.id);
              const packed = items.filter((i) => i.isPacked).length;
              const percent = items.length > 0 ? Math.round((packed / items.length) * 100) : 0;
              const companions = familyMembers.filter((fm) => trip.companionIds.includes(fm.id));
              const dTo = daysUntil(trip.startDate);
              return (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="block p-4 rounded-2xl bg-gradient-to-br from-white to-brand-50/30 border border-brand-100/60 hover:shadow-card hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{trip.destination}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(trip.startDate)} · {trip.days}天
                        </p>
                      </div>
                    </div>
                    {trip.status === 'ongoing' ? (
                      <Badge variant="warning">旅行中</Badge>
                    ) : (
                      <Badge variant="info">
                        {dTo > 0 ? `${dTo}天后` : dTo === 0 ? '今天' : '已逾期'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-600 truncate">
                      {companions.map((c) => c.name).join('、')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">打包 {percent}%</span>
                    <span className="font-bold text-slate-700">
                      {packed}/{items.length}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
