import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ClipboardList,
  AlertTriangle,
  Wrench,
  Trophy,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { DEVICE_STATUS_COLORS, DEVICE_STATUS_LABELS, BORROW_STATUS_COLORS, BORROW_STATUS_LABELS, REPAIR_STATUS_COLORS, REPAIR_STATUS_LABELS } from '@/types';

export default function Dashboard() {
  const { devices, borrows, repairs, getMostDamagedDevices } = useAppStore();

  const stats = useMemo(() => {
    const total = devices.length;
    const borrowed = borrows.filter((b) => b.status === 'borrowing').length;
    const overdue = borrows.filter((b) => b.status === 'overdue').length;
    const repairing = devices.filter((d) => d.status === 'repairing').length;
    return { total, borrowed, overdue, repairing };
  }, [devices, borrows]);

  const mostDamaged = useMemo(() => getMostDamagedDevices().slice(0, 5), [getMostDamagedDevices]);

  const deviceStatusDistribution = useMemo(() => {
    const counts: Record<string, number> = { available: 0, borrowed: 0, repairing: 0, scrapped: 0 };
    devices.forEach((d) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status: status as keyof typeof DEVICE_STATUS_LABELS,
      count,
      percent: devices.length > 0 ? Math.round((count / devices.length) * 100) : 0,
    }));
  }, [devices]);

  const recentActivity = useMemo(() => {
    const events = [
      ...borrows.slice(0, 3).map((b) => ({
        id: `b-${b.id}`,
        type: 'borrow' as const,
        title: `借用申请 - ${b.borrower}`,
        subtitle: b.purpose,
        date: b.borrowDate,
        status: b.status,
      })),
      ...repairs.slice(0, 2).map((r) => ({
        id: `r-${r.id}`,
        type: 'repair' as const,
        title: `维修单 - ${r.handler}`,
        subtitle: r.faultDescription,
        date: r.startDate,
        status: r.status,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    return events;
  }, [borrows, repairs]);

  const statCards = [
    {
      label: '借用中',
      value: stats.borrowed,
      icon: ClipboardList,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      link: '/borrows',
    },
    {
      label: '逾期未还',
      value: stats.overdue,
      icon: AlertTriangle,
      gradient: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-600',
      link: '/borrows',
    },
    {
      label: '维修中',
      value: stats.repairing,
      icon: Wrench,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      link: '/repairs',
    },
    {
      label: '设备总数',
      value: stats.total,
      icon: Package,
      gradient: 'from-brand-600 to-brand-700',
      bg: 'bg-brand-50',
      iconBg: 'bg-brand-600/10',
      iconColor: 'text-brand-600',
      link: '/devices',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="card p-5 group hover:shadow-md transition-all duration-300 animate-slide-up"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-400 group-hover:text-brand-600 transition-colors">
              查看详情
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800">设备状态分布</h3>
          </div>
          <div className="space-y-4">
            {deviceStatusDistribution.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className={`badge ${DEVICE_STATUS_COLORS[item.status]}`}>
                      {DEVICE_STATUS_LABELS[item.status]}
                    </span>
                    <span className="text-slate-500">{item.count} 台</span>
                  </span>
                  <span className="text-slate-600 font-medium">{item.percent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'available'
                        ? 'bg-emerald-500'
                        : item.status === 'borrowed'
                        ? 'bg-blue-500'
                        : item.status === 'repairing'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">最常损坏设备 TOP5</h3>
          </div>
          {mostDamaged.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">暂无维修记录</div>
          ) : (
            <div className="space-y-3">
              {mostDamaged.map((item, idx) => (
                <div
                  key={item.device.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                      idx === 0
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                        : idx === 1
                        ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                        : idx === 2
                        ? 'bg-gradient-to-br from-orange-400 to-orange-500'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <img
                    src={item.device.photo}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {item.device.code}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{item.device.category}</div>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-rose-500">{item.repairCount}</span>
                    <span className="text-xs text-slate-400 ml-1">次</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-slate-800">近期动态</h3>
        </div>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">暂无动态</div>
        ) : (
          <div className="relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
            <div className="space-y-4">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-start gap-3 pl-1">
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 ${
                      event.type === 'borrow'
                        ? event.status === 'overdue'
                          ? 'bg-rose-500'
                          : 'bg-blue-500'
                        : event.status === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  >
                    {event.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : event.status === 'overdue' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">{event.title}</span>
                      <span
                        className={`badge ${
                          event.type === 'borrow'
                            ? BORROW_STATUS_COLORS[event.status as keyof typeof BORROW_STATUS_COLORS]
                            : REPAIR_STATUS_COLORS[event.status as keyof typeof REPAIR_STATUS_COLORS]
                        }`}
                      >
                        {event.type === 'borrow'
                          ? BORROW_STATUS_LABELS[event.status as keyof typeof BORROW_STATUS_LABELS]
                          : REPAIR_STATUS_LABELS[event.status as keyof typeof REPAIR_STATUS_LABELS]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{event.subtitle}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
