import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Ruler,
  Gauge,
  Clock,
  MapPin,
  AlertTriangle,
  Check,
  Plus,
  FileText,
  Wallet,
  History,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  computeMaintenanceStatus,
} from '@/utils/maintenance';
import { formatDate, formatDuration } from '@/utils/date';
import {
  SPORT_TYPE_LABELS,
  MAINTENANCE_ACTION_LABELS,
  INTENSITY_LABELS,
  INTENSITY_COLORS,
  type UsageRecord,
} from '@/types';
import { SportIcon } from '@/components/SportIcon';
import { MaintenanceIcon } from '@/components/MaintenanceIcon';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const equipment = useAppStore((s) => s.equipment);
  const usageRecords = useAppStore((s) => s.usageRecords);
  const deleteEquipment = useAppStore((s) => s.deleteEquipment);
  const markMaintenanceDone = useAppStore((s) => s.markMaintenanceDone);
  const addUsageRecord = useAppStore((s) => s.addUsageRecord);

  if (!id) return null;

  const eq = equipment.find((e) => e.id === id);
  if (!eq) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-xl text-warm-700">装备不存在</h2>
        <Link to="/equipment" className="btn-primary mt-4 inline-flex">
          返回列表
        </Link>
      </div>
    );
  }

  const status = computeMaintenanceStatus(eq, usageRecords);
  const eqRecords = usageRecords.filter((r) => r.equipmentId === eq.id);

  const lifespanPct = eq.lifespanKm
    ? Math.min(100, (status.totalKm / eq.lifespanKm) * 100)
    : Math.min(100, (status.daysSincePurchase / eq.lifespanDays) * 100);

  const maintenancePct = eq.maintenanceCycleKm
    ? status.kmUntilNextMaintenance !== null && eq.maintenanceCycleKm > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((eq.maintenanceCycleKm - Math.max(0, status.kmUntilNextMaintenance)) /
              eq.maintenanceCycleKm) *
              100
          )
        )
      : 0
    : Math.max(
        0,
        Math.min(
          100,
          ((eq.maintenanceCycleDays - Math.max(0, status.daysUntilNextMaintenance)) /
            eq.maintenanceCycleDays) *
            100
        )
      );

  const handleDelete = () => {
    if (confirm(`确定要删除「${eq.name}」吗？相关使用记录也会一并删除。`)) {
      deleteEquipment(eq.id);
      navigate('/equipment');
    }
  };

  const handleMarkMaintained = () => {
    markMaintenanceDone(eq.id);
    addUsageRecord({
      equipmentId: eq.id,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 0,
      intensity: 'low',
      location: '保养维护',
      distanceKm: null,
      wearNotes: `执行了${MAINTENANCE_ACTION_LABELS[status.suggestedAction]}操作`,
      maintenanceCost: 0,
    });
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 90) return 'from-red-400 to-red-500';
    if (pct >= 70) return 'from-amber-400 to-amber-500';
    if (pct >= 40) return 'from-brand-400 to-brand-500';
    return 'from-emerald-400 to-emerald-500';
  };

  const getIntensityBadge = (record: UsageRecord) => {
    if (record.location === '保养维护') {
      return (
        <span className="badge bg-teal-100 text-teal-700">
          <Check size={10} />
          保养
        </span>
      );
    }
    return (
      <span className={`badge ${INTENSITY_COLORS[record.intensity]}`}>
        {INTENSITY_LABELS[record.intensity]}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost shrink-0">
            <ArrowLeft size={18} />
            返回
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl font-bold text-warm-900">
                {eq.name}
              </h1>
              <StatusBadge status={eq.status} />
            </div>
            <div className="flex items-center gap-2 mt-2 text-warm-500">
              <SportIcon type={eq.sportType} size={16} />
              <span>{SPORT_TYPE_LABELS[eq.sportType]}</span>
              <span className="text-warm-300">·</span>
              <Calendar size={14} />
              <span>购入于 {formatDate(eq.purchaseDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/usage/new?equipmentId=${eq.id}`} className="btn-secondary">
            <Plus size={16} />
            记录使用
          </Link>
          <Link to={`/equipment/${eq.id}/edit`} className="btn-secondary">
            <Edit3 size={16} />
            编辑
          </Link>
          <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200">
            <Trash2 size={16} />
            删除
          </button>
        </div>
      </div>

      {/* Hero Card + Maintenance Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hero */}
        <div className="card-base p-8 lg:col-span-2 animate-fade-in-up relative overflow-hidden" style={{ opacity: 0 }}>
          <div className="absolute top-0 right-0 w-64 h-64 -translate-y-24 translate-x-24 rounded-full bg-gradient-to-br from-brand-200/40 to-teal-200/30 blur-3xl" />
          <div className="relative">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50 border border-warm-200 flex items-center justify-center shrink-0 shadow-sm">
                <SportIcon type={eq.sportType} size={40} className="text-warm-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={eq.status} />
                  <span className="badge bg-warm-100 text-warm-600 border border-warm-200">
                    已使用 {status.daysSincePurchase} 天
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-warm-900 mb-1">
                  {eq.name}
                </h2>
                {eq.notes && (
                  <p className="text-warm-600 text-sm mt-2 leading-relaxed">
                    {eq.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="mt-8 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-warm-600 font-medium flex items-center gap-1.5">
                    <Ruler size={14} />
                    使用寿命进度
                  </span>
                  <span className="font-semibold text-warm-800">
                    {Math.round(lifespanPct)}%
                  </span>
                </div>
                <div className="h-2.5 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', getProgressColor(lifespanPct))}
                    style={{ width: `${lifespanPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-warm-500 mt-1.5">
                  <span>
                    {eq.lifespanKm
                      ? `已用 ${status.totalKm.toFixed(0)} / ${eq.lifespanKm} km`
                      : `剩余 ${Math.max(0, status.lifespanDaysRemaining)} 天`}
                  </span>
                  <span>
                    {status.isLifespanOverdue
                      ? '已超期'
                      : status.isLifespanUpcoming
                      ? '临近寿命期'
                      : '状态良好'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-warm-600 font-medium flex items-center gap-1.5">
                    <History size={14} />
                    保养进度（距离下次）
                  </span>
                  <span className="font-semibold text-warm-800">
                    {Math.round(maintenancePct)}%
                  </span>
                </div>
                <div className="h-2.5 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', getProgressColor(maintenancePct))}
                    style={{ width: `${maintenancePct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-warm-500 mt-1.5">
                  <span>
                    上次保养：{eq.lastMaintenanceDate ? formatDate(eq.lastMaintenanceDate) : '未记录'}
                  </span>
                  <span>
                    {status.isMaintenanceOverdue
                      ? `已超期 ${Math.abs(status.daysUntilNextMaintenance)} 天`
                      : `还剩 ${status.daysUntilNextMaintenance} 天`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Card */}
        <div
          className={cn(
            'card-base p-6 animate-fade-in-up relative overflow-hidden flex flex-col',
            status.isMaintenanceOverdue && 'animate-pulse-border'
          )}
          style={{ opacity: 0, animationDelay: '80ms' }}
        >
          <h3 className="font-display text-lg font-semibold text-warm-900 mb-4">
            保养建议
          </h3>

          {(status.isMaintenanceOverdue ||
            status.isLifespanOverdue ||
            status.isMaintenanceUpcoming ||
            status.isLifespanUpcoming) && (
            <div
              className={cn(
                'rounded-xl p-4 mb-4',
                status.isMaintenanceOverdue || status.isLifespanOverdue
                  ? 'bg-red-50 border border-red-100'
                  : 'bg-amber-50 border border-amber-100'
              )}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  size={18}
                  className={cn(
                    'shrink-0 mt-0.5',
                    status.isMaintenanceOverdue || status.isLifespanOverdue
                      ? 'text-red-500'
                      : 'text-amber-500'
                  )}
                />
                <div className="flex-1">
                  <p
                    className={cn(
                      'font-medium text-sm',
                      status.isMaintenanceOverdue || status.isLifespanOverdue
                        ? 'text-red-800'
                        : 'text-amber-800'
                    )}
                  >
                    {status.isLifespanOverdue
                      ? '超过使用寿命，建议退役更换'
                      : status.isLifespanUpcoming
                      ? '临近使用寿命，建议考虑更换'
                      : status.isMaintenanceOverdue
                      ? '保养已超期，请尽快处理'
                      : '保养即将到期，提前准备'}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      status.isMaintenanceOverdue || status.isLifespanOverdue
                        ? 'text-red-600'
                        : 'text-amber-600'
                    )}
                  >
                    {status.isLifespanOverdue
                      ? `超期 ${Math.abs(status.lifespanDaysRemaining)} 天`
                      : status.isLifespanUpcoming
                      ? `还剩 ${status.lifespanDaysRemaining} 天`
                      : status.daysUntilNextMaintenance < 0
                      ? `超期 ${Math.abs(status.daysUntilNextMaintenance)} 天`
                      : `还有 ${status.daysUntilNextMaintenance} 天`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-warm-50 rounded-xl p-4 mb-4 flex items-center gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                status.isMaintenanceOverdue
                  ? 'bg-red-100 text-red-600'
                  : 'bg-brand-100 text-brand-600'
              )}
            >
              <MaintenanceIcon action={status.suggestedAction} size={22} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-warm-500">建议操作</p>
              <p className="font-semibold text-warm-900">
                {MAINTENANCE_ACTION_LABELS[status.suggestedAction]}
              </p>
            </div>
          </div>

          <button
            onClick={handleMarkMaintained}
            className="btn-primary mt-auto w-full justify-center text-sm"
          >
            <Check size={16} />
            标记已保养
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: '120ms' }}>
          <div className="flex items-center gap-2 text-warm-500 text-sm mb-2">
            <Clock size={14} />
            使用次数
          </div>
          <p className="font-display text-2xl font-bold text-warm-900">
            {status.totalUsageCount}
            <span className="text-sm font-normal text-warm-500 ml-1">次</span>
          </p>
        </div>
        <div className="card-base p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: '160ms' }}>
          <div className="flex items-center gap-2 text-warm-500 text-sm mb-2">
            <Gauge size={14} />
            累计时长
          </div>
          <p className="font-display text-2xl font-bold text-warm-900">
            {formatDuration(status.totalMinutes)}
          </p>
        </div>
        <div className="card-base p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 text-warm-500 text-sm mb-2">
            <MapPin size={14} />
            累计里程
          </div>
          <p className="font-display text-2xl font-bold text-warm-900">
            {status.totalKm.toFixed(1)}
            <span className="text-sm font-normal text-warm-500 ml-1">km</span>
          </p>
        </div>
        <div className="card-base p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: '240ms' }}>
          <div className="flex items-center gap-2 text-warm-500 text-sm mb-2">
            <Wallet size={14} />
            累计花费
          </div>
          <p className="font-display text-2xl font-bold text-warm-900">
            ¥{status.totalCost}
          </p>
        </div>
      </div>

      {/* Usage Timeline */}
      <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '280ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <FileText size={16} className="text-brand-600" />
            </div>
            <h2 className="font-display text-lg font-semibold text-warm-900">
              使用记录
            </h2>
            <span className="badge bg-warm-100 text-warm-600 border border-warm-200">
              {eqRecords.length} 条
            </span>
          </div>
          <Link
            to={`/usage/new?equipmentId=${eq.id}`}
            className="btn-ghost text-brand-600 hover:bg-brand-50"
          >
            <Plus size={14} />
            添加记录
          </Link>
        </div>

        {eqRecords.length > 0 ? (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
            {eqRecords.map((record, i) => (
              <div
                key={record.id}
                className="group relative pl-10 pb-5 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-warm-200 flex items-center justify-center z-10 group-hover:border-brand-400 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-warm-300 group-hover:bg-brand-500 transition-colors" />
                </div>
                {/* Timeline line */}
                {i !== eqRecords.length - 1 && (
                  <div className="absolute left-[11px] top-7 w-px h-full bg-warm-100" />
                )}

                <div className="card-base p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-sm font-semibold text-warm-900">
                          {formatDate(record.date)}
                        </span>
                        {getIntensityBadge(record)}
                        {record.durationMinutes > 0 && (
                          <span className="badge bg-warm-100 text-warm-600">
                            <Clock size={10} />
                            {formatDuration(record.durationMinutes)}
                          </span>
                        )}
                        {record.distanceKm && (
                          <span className="badge bg-sky-50 text-sky-600">
                            <MapPin size={10} />
                            {record.distanceKm} km
                          </span>
                        )}
                      </div>
                      {record.location && record.location !== '保养维护' && (
                        <p className="text-sm text-warm-600 flex items-center gap-1.5">
                          <MapPin size={12} className="text-warm-400" />
                          {record.location}
                        </p>
                      )}
                      {record.wearNotes && (
                        <p className="text-sm text-warm-600 mt-2 bg-warm-50 rounded-lg px-3 py-2">
                          {record.wearNotes}
                        </p>
                      )}
                    </div>
                    {record.maintenanceCost > 0 && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-warm-500">花费</p>
                        <p className="font-semibold text-teal-700">
                          ¥{record.maintenanceCost}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-warm-400">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">还没有使用记录</p>
            <Link
              to={`/usage/new?equipmentId=${eq.id}`}
              className="btn-primary mt-4 inline-flex text-sm"
            >
              <Plus size={14} />
              记录第一次使用
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
