import { useMemo } from 'react';
import {
  FileText,
  AlertTriangle,
  Wrench,
  Eye,
} from 'lucide-react';
import { useDutyStore } from '../store/useDutyStore';
import { getVisibilityLevel, formatTime } from '../utils/helpers';

function SummaryCard({
  icon,
  iconBg,
  value,
  label,
  subLabel,
  accent,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
  subLabel?: string;
  accent?: string;
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
    </div>
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

      <SummaryCard
        icon={<Wrench size={20} className="text-alert-caution" />}
        iconBg="bg-alert-caution/15"
        value={summary.maintenanceOrderCount}
        label="待办维护"
        subLabel={
          latestRecord
            ? `最近更新: ${formatTime(latestRecord.timestamp)}`
            : '暂无记录'
        }
        accent="bg-alert-caution"
      />
    </div>
  );
}
