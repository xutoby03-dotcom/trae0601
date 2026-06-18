import type { AirQuality } from '../types';
import { useAppStore } from '../store';
import dayjs from 'dayjs';

const airQualityMap: Record<AirQuality, { label: string; color: string; bg: string; bar: string }> = {
  excellent: { label: '优', color: 'text-air-excellent', bg: 'bg-air-excellent/10', bar: 'bg-air-excellent' },
  good: { label: '良', color: 'text-air-good', bg: 'bg-air-good/10', bar: 'bg-air-good' },
  moderate: { label: '轻度污染', color: 'text-air-moderate', bg: 'bg-air-moderate/10', bar: 'bg-air-moderate' },
  poor: { label: '中度污染', color: 'text-air-poor', bg: 'bg-air-poor/10', bar: 'bg-air-poor' },
  severe: { label: '重度污染', color: 'bg-air-severe', bg: 'bg-air-severe/10', bar: 'bg-air-severe' },
};

export function AirQualityBadge({ level, pm25 }: { level: AirQuality; pm25: number }) {
  const cfg = airQualityMap[level];
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.bar} animate-pulse`}></span>
      <span className="text-xs font-bold">{cfg.label}</span>
      <span className="text-xs font-mono opacity-75">PM2.5 {pm25}</span>
    </div>
  );
}

export function AirQualityBar({ level }: { level: AirQuality }) {
  const cfg = airQualityMap[level];
  return <div className={`h-2 w-full ${cfg.bar}`} />;
}

export function FilterProgress({ percent }: { percent: number }) {
  let color =
    percent > 50
      ? 'bg-gradient-to-r from-brand-400 to-brand-500'
      : percent > 20
      ? 'bg-gradient-to-r from-warn-400 to-warn-500'
      : 'bg-gradient-to-r from-danger-500 to-danger-600';
  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-1.5">
      <span className="text-xs font-medium text-brand-600">滤芯寿命</span>
      <span className={`text-2xl font-black font-mono ${
        percent > 50 ? 'text-brand-600' : percent > 20 ? 'text-warn-600' : 'text-danger-600'
      }`}>
        {percent}%
      </span>
    </div>
    <div className="h-2.5 w-full bg-brand-100/60 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${percent}%` }}
      />
    </div>
    </div>
  );
}

export function SectionTitle({
  icon: Icon, title, desc, action }: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <Icon className="w-5 h-5" strokeWidth={1.8} />
          </div>
        )}
        <div>
          <h3 className="text-lg font-black text-brand-800">{title}</h3>
          {desc && <p className="text-sm text-brand-500 mt-0.5">{desc}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function DeviceAlertBadge({ deviceId }: { deviceId: string }) {
  const alerts = useAppStore((s) => s.alerts);
  const deviceAlerts = alerts.filter(
    (a) => !a.resolved && a.deviceId === deviceId,
  );
  if (deviceAlerts.length === 0) return null;
  const isDanger = deviceAlerts.some((a) => a.level === 'danger');

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
        isDanger
          ? 'bg-danger-50 text-danger-600 border border-danger-500/30 animate-breathe'
          : 'bg-warn-50 text-warn-600 border border-warn-400/40 animate-breathe'
      }`}
    >
      <span className="text-xs font-bold leading-none">⚠</span>
      <span className="text-[11px] font-bold leading-none">
        {deviceAlerts.length} 项提醒
      </span>
    </div>
  );
}

export function DaysRemainingChip({ days, label = '剩余' }: { days: number; label?: string }) {
  const urgent = days <= 15;
  const danger = days <= 7;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
        danger
          ? 'bg-danger-50 text-danger-600 border border-danger-500/30 animate-breathe'
          : urgent
          ? 'bg-warn-50 text-warn-600 border border-warn-400/40 animate-breathe'
          : 'bg-brand-50 text-brand-600 border border-brand-100'
      }`}
    >
      <span className="font-mono">{days}</span>
      <span>天{label}</span>
    </div>
  );
}

export function formatDate(d: string) {
  return dayjs(d).format('YYYY-MM-DD');
}

export function formatDateShort(d: string) {
  return dayjs(d).format('MM/DD');
}
