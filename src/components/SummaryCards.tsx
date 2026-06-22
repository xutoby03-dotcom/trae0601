import { useMemo, useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Wrench,
  Eye,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleDashed,
  CheckCircle2,
} from 'lucide-react';
import { useDutyStore } from '../store/useDutyStore';
import { getVisibilityLevel, formatTime, formatDateTime } from '../utils/helpers';
import type { MaintenanceOrder } from '../utils/types';

const STATUS_FLOW: { value: MaintenanceOrder['status']; label: string; chip: string; icon: React.ReactNode }[] = [
  { value: 'open', label: '待处理', chip: 'chip-warning', icon: <Circle size={10} className="animate-pulse" /> },
  { value: 'in_progress', label: '处理中', chip: 'chip-caution', icon: <CircleDashed size={10} className="animate-spin" /> },
  { value: 'completed', label: '已完成', chip: 'chip-safe', icon: <CheckCircle2 size={10} /> },
];

const PRIORITY_CONFIG: Record<string, { label: string; chip: string }> = {
  low: { label: '低', chip: 'chip-info' },
  medium: { label: '中', chip: 'chip-caution' },
  high: { label: '紧急', chip: 'chip-warning' },
};

function SummaryCard({
  icon,
  iconBg,
  value,
  label,
  subLabel,
  accent,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
  subLabel?: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-card p-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div
        className={`absolute top-0 right-0 w-24 h-24 opacity-10 -translate-y-8 translate-x-8 rounded-full ${
          accent || 'bg-ocean-300'
        } blur-2xl`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div
            className={`inline-flex items-center justify-center p-2 rounded-xl ${iconBg} mb-3`}
          >
            {icon}
          </div>
          <div className="text-3xl font-display font-bold text-ocean-50">
            {value}
          </div>
          <div className="text-sm text-ocean-300 mt-1">{label}</div>
          {subLabel && (
            <div className="text-xs text-ocean-400 mt-1">{subLabel}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function MaintenanceCard() {
  const maintenanceOrders = useDutyStore((s) => s.maintenanceOrders);
  const updateMaintenanceOrderStatus = useDutyStore((s) => s.updateMaintenanceOrderStatus);
  const [expanded, setExpanded] = useState(false);

  const pendingCount = maintenanceOrders.filter((o) => o.status !== 'completed').length;

  const sortedOrders = useMemo(
    () => [...maintenanceOrders].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return b.createdAt - a.createdAt;
    }),
    [maintenanceOrders]
  );

  const handleSetStatus = (orderId: string, status: MaintenanceOrder['status']) => {
    updateMaintenanceOrderStatus(orderId, status);
  };

  return (
    <SummaryCard
      icon={<Wrench size={20} className="text-alert-caution" />}
      iconBg="bg-alert-caution/15"
      value={pendingCount}
      label="待办维护"
      subLabel={pendingCount > 0 ? `${pendingCount} 项未完成` : '无待办工单'}
      accent="bg-alert-caution"
    >
      {maintenanceOrders.length > 0 && (
        <div className="mt-3 pt-3 border-t border-ocean-700/30">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-xs text-ocean-300 hover:text-ocean-100 transition-colors w-full"
          >
            <Wrench size={12} />
            <span>工单列表（{maintenanceOrders.length}）</span>
            <span className="ml-auto">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>

          {expanded && (
            <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-1 -mr-1">
              {sortedOrders.map((order) => {
                const currentStatus = STATUS_FLOW.find((s) => s.value === order.status);
                const priorityCfg = PRIORITY_CONFIG[order.priority];
                const isCompleted = order.status === 'completed';

                return (
                  <div
                    key={order.id}
                    className={`bg-ocean-950/60 rounded-lg p-3 border transition-all ${
                      isCompleted
                        ? 'border-ocean-700/20'
                        : 'border-ocean-700/40'
                    }`}
                    style={{ opacity: isCompleted ? 0.7 : 1 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-ocean-100 truncate">
                            {order.equipment}
                          </span>
                          {currentStatus && (
                            <span className={`chip ${currentStatus.chip} text-[10px]`}>
                              {currentStatus.icon}
                              {currentStatus.label}
                            </span>
                          )}
                          {priorityCfg && (
                            <span className={`chip ${priorityCfg.chip} text-[10px]`}>
                              {priorityCfg.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ocean-300 mt-1.5 line-clamp-2">
                          {order.issue}
                        </p>
                        <p className="text-[11px] text-ocean-500 mt-1">
                          {formatDateTime(order.createdAt)}
                        </p>
                        {order.description && (
                          <p className="text-[11px] text-ocean-400 mt-1 line-clamp-2">
                            {order.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                      {STATUS_FLOW.map((status) => {
                        const active = order.status === status.value;
                        return (
                          <button
                            key={status.value}
                            onClick={() => handleSetStatus(order.id, status.value)}
                            className={`text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all border ${
                              active
                                ? `${status.chip} border-current shadow-sm`
                                : 'bg-ocean-800/30 text-ocean-400 border-ocean-700/30 hover:bg-ocean-800/60 hover:text-ocean-200'
                            }`}
                          >
                            {status.icon}
                            <span>{status.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </SummaryCard>
  );
}

export default function SummaryCards() {
  const records = useDutyStore((s) => s.records);
  const alerts = useDutyStore((s) => s.alerts);
  const maintenanceOrders = useDutyStore((s) => s.maintenanceOrders);
  const shiftStartTime = useDutyStore((s) => s.shiftStartTime);
  const latestRecord = records[records.length - 1];

  const summary = useMemo(() => {
    const shiftRecords = records.filter((r) => r.timestamp >= shiftStartTime);
    const shiftAlerts = alerts.filter((a) => a.timestamp >= shiftStartTime);
    const visibilities = shiftRecords.map((r) => r.visibility);

    return {
      recordCount: shiftRecords.length,
      alertCount: shiftAlerts.length,
      unresolvedAlertCount: shiftAlerts.filter((a) => a.status !== 'resolved').length,
      maintenanceOrderCount: maintenanceOrders.filter((o) => o.status !== 'completed').length,
      avgVisibility:
        visibilities.length > 0
          ? Math.round(visibilities.reduce((a, b) => a + b, 0) / visibilities.length)
          : 0,
      minVisibility: visibilities.length > 0 ? Math.min(...visibilities) : 0,
    };
  }, [records, alerts, maintenanceOrders, shiftStartTime]);

  const visLevel = summary.minVisibility > 0
    ? getVisibilityLevel(summary.minVisibility)
    : { level: '—', color: 'chip-info', description: '暂无数据' };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        icon={<FileText size={20} className="text-alert-safe" />}
        iconBg="bg-alert-safe/15"
        value={summary.recordCount}
        label="值守记录"
        subLabel="当前班次总记录数"
        accent="bg-alert-safe"
      />

      <SummaryCard
        icon={<AlertTriangle size={20} className="text-alert-warning" />}
        iconBg="bg-alert-warning/15"
        value={summary.alertCount}
        label="告警总数"
        subLabel={
          summary.unresolvedAlertCount > 0
            ? `${summary.unresolvedAlertCount} 项待处理`
            : '全部已处理'
        }
        accent="bg-alert-warning"
      />

      <SummaryCard
        icon={<Eye size={20} className="text-ocean-300" />}
        iconBg="bg-ocean-300/15"
        value={
          summary.avgVisibility > 0
            ? `${(summary.avgVisibility / 1000).toFixed(1)}km`
            : '—'
        }
        label="平均能见度"
        subLabel={
          summary.minVisibility > 0
            ? `最低 ${summary.minVisibility}m · ${visLevel.level}`
            : '暂无数据'
        }
        accent="bg-ocean-300"
      />

      <MaintenanceCard />
    </div>
  );
}
