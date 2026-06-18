import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye,
  HandCoins,
  AlertCircle,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { StatsCard, HourlyTrendChart, CourierDelayChart } from '@/components/charts/Charts';
import { usePackageStore } from '@/store/packageStore';
import { useShelfStore } from '@/store/shelfStore';
import { useReminderStore } from '@/store/reminderStore';
import { getDelayLevel, getDelayLevelBgColor, getDelayLevelTextColor, formatDelayTime, formatDateTime, cn, getDelayLevelColor, sizeLabel } from '@/utils';
import type { PackageItem, DelayLevel } from '@/types';
import { REMINDER_TYPE_LABEL } from '@/types';

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const packages = usePackageStore((s) => s.packages);
  const shelves = useShelfStore((s) => s.shelves);
  const slots = useShelfStore((s) => s.slots);
  const logs = useReminderStore((s) => s.logs);
  const triggerManualRef = useRef(useReminderStore.getState().triggerManualReminder);
  const getLogsByIdRef = useRef(useReminderStore.getState().getLogsByPackageId);

  const stats = useMemo(() => usePackageStore.getState().getDashboardStats(), [packages, slots]);
  const delayed = useMemo(() => usePackageStore.getState().getDelayedPackages(), [packages]);
  const hourly = useMemo(() => usePackageStore.getState().getHourlyData(), [packages]);
  const courierData = useMemo(() => usePackageStore.getState().getCourierDelayData(), [packages]);
  const stored = useMemo(() => packages.filter((p) => p.status === 'stored'), [packages]);
  const recentLogs = useMemo(() => useReminderStore.getState().getRecentLogs(10), [logs]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const criticalList = delayed.filter(
    (p) => getDelayLevel(p.storedAt) === 'critical' || getDelayLevel(p.storedAt) === 'danger',
  );
  const warningList = delayed.filter((p) => getDelayLevel(p.storedAt) === 'warning');

  const shelfStats = shelves.map((s) => {
    const slots = useShelfStore.getState().getSlotsByShelfId(s.id);
    const occ = slots.filter((sl) => sl.isOccupied).length;
    return { shelf: s, total: slots.length, occ, rate: slots.length > 0 ? Math.round((occ / slots.length) * 100) : 0 };
  });

  const handleManualReminder = (pkg: PackageItem) => {
    triggerManualRef.current(pkg.id, '张建国', '已电话联系收件人，承诺今日内取件');
    setToast(`已对 [${pkg.recipientName}] 发起人工处理`);
  };

  const levelLabel: Record<DelayLevel, string> = {
    normal: '正常',
    warning: '滞留24h+',
    danger: '滞留48h+',
    critical: '滞留72h+',
  };

  const levelVariant: Record<DelayLevel, 'success' | 'warning' | 'danger' | 'critical'> = {
    normal: 'success',
    warning: 'warning',
    danger: 'danger',
    critical: 'critical',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">数据看板</h1>
          <p className="text-sm text-slate-500 mt-1">
          {formatDateTime(now.toISOString())} · 实时监控快递架运营状况
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/packages/register">
            <Button size="md" leftIcon={<Package className="w-4 h-4" />}>登记包裹</Button>
          </Link>
          <Link to="/pickup">
            <Button size="md" variant="success" leftIcon={<HandCoins className="w-4 h-4" />}>取件操作</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          stat={{
            label: '货架占用率',
            value: `${stats.occupancyRate}%`,
            delta: 12,
            deltaLabel: '较昨日',
            gradient: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700',
            iconBg: 'bg-white/20',
            icon: <Package className="w-5 h-5 text-white" />,
            trend: 'up',
          }}
        />
        <StatsCard
          stat={{
            label: '在架包裹',
            value: stats.storedCount,
            delta: stats.occupiedSlots,
            deltaLabel: `共 ${stats.totalSlots} 格口`,
            gradient: 'bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700',
            iconBg: 'bg-white/20',
            icon: <Users className="w-5 h-5 text-white" />,
          }}
        />
        <StatsCard
          stat={{
            label: '滞留包裹',
            value: delayed.length,
            delta: stats.delayed72hCount,
            deltaLabel: '超72h待处理',
            gradient: delayed.length > 0
              ? 'bg-gradient-to-br from-orange-500 via-rose-500 to-red-600'
              : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
            iconBg: 'bg-white/20',
            icon: <AlertTriangle className="w-5 h-5 text-white" />,
          }}
        />
        <StatsCard
          stat={{
            label: '今日取件',
            value: stats.todayPickedCount,
            delta: 8,
            deltaLabel: '较昨日',
            gradient: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
            iconBg: 'bg-white/20',
            icon: <CheckCircle2 className="w-5 h-5 text-white" />,
            trend: 'up',
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="📦 货架状态" subtitle="各货架实时占用情况" className="lg:col-span-1">
          <div className="space-y-4">
            {shelfStats.map(({ shelf, total, occ, rate }) => (
              <Link key={shelf.id} to={`/shelves/${shelf.id}`} className="block group">
                <div className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {shelf.name.slice(-1)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{shelf.name}</div>
                        <div className="text-[11px] text-slate-500">{shelf.area}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700">{occ}/{total}</div>
                      <div className="text-[10px] text-slate-500">{rate}%</div>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        rate >= 80 ? 'bg-gradient-to-r from-orange-400 to-red-500'
                          : rate >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gradient-to-r from-indigo-400 to-indigo-600',
                      )}
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                  </div>
                </div>
                </Link>
            ))}
          </div>
        </Card>

        <Card
          title="📈 24小时入架/取件趋势"
          subtitle="今日各时段运营数据"
          className="lg:col-span-2"
        >
          <HourlyTrendChart data={hourly} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="🚨 滞留包裹预警"
          subtitle={`${criticalList.length} 件需重点关注`}
          rightAction={
            <Link to="/packages?filter=delayed" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
              查看全部 <ArrowUpRight className="w-3 h-3" />
            </Link>
          }
          className="lg:col-span-2"
        >
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {delayed.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <p className="text-sm">太棒了，暂无滞留包裹</p>
              </div>
            ) : (
              delayed.slice(0, 12).map((pkg) => {
                const level = getDelayLevel(pkg.storedAt);
                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm',
                      getDelayLevelBgColor(level),
                    )}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={pkg.photoUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-white/60"
                      />
                      <span className={cn(
                        'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                        getDelayLevelColor(level),
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{pkg.recipientName}</span>
                        <Badge variant={levelVariant[level]} size="sm">
                          {levelLabel[level]}
                        </Badge>
                        <Badge variant="slate" size="sm">{sizeLabel(pkg.packageSize)}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                        <span>📍 {pkg.slotLabel}</span>
                        <span>🏷️ {pkg.courierCompany}</span>
                        <span>📱 ***{pkg.phoneLast4}</span>
                      </div>
                      <div className={cn('text-[11px] mt-0.5 font-semibold', getDelayLevelTextColor(level))}>
                        已滞留 {formatDelayTime(pkg.storedAt)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedPkg(pkg)}
                      >
                        详情
                      </Button>
                      {level === 'critical' && (
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<AlertCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleManualReminder(pkg)}
                        >
                          人工处理
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {warningList.length > 0 && criticalList.length === 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
              💡 {warningList.length} 件24h+滞留，请关注
            </div>
          )}
        </Card>

        <Card title="📊 快递公司滞留率" subtitle="按滞留率降序排列" className="lg:col-span-1">
          <CourierDelayChart data={courierData} />
          {courierData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              {courierData.slice(0, 3).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {i + 1}
                    </span>
                    <span className="font-medium text-slate-700">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{c.delayed}/{c.total}</span>
                    <span className={cn(
                      'font-bold',
                      c.rate >= 30 ? 'text-red-600' : c.rate >= 15 ? 'text-amber-600' : 'text-emerald-600',
                    )}>
                      {c.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        title="🔔 最近提醒记录"
        subtitle="自动提醒与人工处理日志"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="py-3 px-3 font-semibold">时间</th>
                <th className="py-3 px-3 font-semibold">收件人</th>
                <th className="py-3 px-3 font-semibold">格口</th>
                <th className="py-3 px-3 font-semibold">类型</th>
                <th className="py-3 px-3 font-semibold">操作人</th>
                <th className="py-3 px-3 font-semibold">结果</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">暂无记录</td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-600 text-xs whitespace-nowrap">
                      {formatDateTime(log.remindedAt)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{log.recipientName}</td>
                    <td className="py-3 px-3 text-slate-600">{log.slotLabel}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          log.level === 'critical' ? 'critical'
                            : log.level === 'danger' ? 'danger'
                            : 'warning'
                        }
                      >
                        {REMINDER_TYPE_LABEL[log.type]}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-xs">{log.operator || '系统自动'}</td>
                    <td className="py-3 px-3 text-slate-600 text-xs max-w-xs truncate">{log.result}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!selectedPkg}
        onClose={() => setSelectedPkg(null)}
        title="包裹详情"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedPkg(null)}>关闭</Button>
            <Link to="/pickup" onClick={() => setSelectedPkg(null)}>
              <Button leftIcon={<HandCoins className="w-4 h-4" />}>确认取件</Button>
            </Link>
          </>
        }
      >
        {selectedPkg && (
          <div className="space-y-5">
            <div className="flex gap-4">
              <img
              src={selectedPkg.photoUrl}
              alt=""
              className="w-28 h-28 rounded-xl object-cover shadow-md border border-slate-200"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-800">{selectedPkg.recipientName}</h3>
                <Badge variant={levelVariant[getDelayLevel(selectedPkg.storedAt)]}>
                  {levelLabel[getDelayLevel(selectedPkg.storedAt)]}
                </Badge>
              </div>
              <div className="text-sm text-slate-600">
                <div>🏷️ {selectedPkg.courierCompany} · {sizeLabel(selectedPkg.packageSize)}</div>
                <div>📍 {selectedPkg.slotLabel}</div>
                <div>📱 手机号尾号 {selectedPkg.phoneLast4}</div>
                <div>🔑 取件码 {selectedPkg.pickupCode}</div>
              </div>
            </div>
          </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-xs text-slate-500">入架时间</div>
                <div className="font-bold text-slate-700 mt-0.5">{formatDateTime(selectedPkg.storedAt)}</div>
              </div>
              <div className={cn('p-3 rounded-xl', getDelayLevelBgColor(getDelayLevel(selectedPkg.storedAt)))}>
                <div className="text-xs text-slate-500">滞留时长</div>
                <div className={cn('font-bold mt-0.5', getDelayLevelTextColor(getDelayLevel(selectedPkg.storedAt)))}>
                  {formatDelayTime(selectedPkg.storedAt)}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">提醒记录</div>
              <div className="space-y-2">
                {(() => {
                  const logs = getLogsByIdRef.current(selectedPkg.id);
                  return logs.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-lg">暂无提醒</div>
                  ) : (
                    logs.map((l) => (
                      <div key={l.id} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <Badge variant={l.level === 'critical' ? 'critical' : l.level === 'danger' ? 'danger' : 'warning'} size="sm">
                              {REMINDER_TYPE_LABEL[l.type]}
                            </Badge>
                            <span className="text-slate-500">{formatDateTime(l.remindedAt)}</span>
                          </div>
                          {l.result && <div className="text-slate-600 mt-0.5">{l.result}</div>}
                        </div>
                      </div>
                    ))
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-xl shadow-slate-900/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
