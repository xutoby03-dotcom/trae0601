import { useState, useMemo } from 'react';
import {
  Clock,
  BatteryCharging,
  Droplets,
  Wrench,
  Filter,
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle2,
  Circle,
  CircleDashed,
} from 'lucide-react';
import type { AlertEvent, AlertType, AlertLevel, ProcessStatus } from '../utils/types';
import { useDutyStore } from '../store/useDutyStore';
import { formatTime, formatDateTime, timeAgo } from '../utils/helpers';

const TYPE_CONFIG: Record<
  AlertType,
  { label: string; icon: React.ReactNode; dotColor: string; lineColor: string }
> = {
  interval_abnormal: {
    label: '间隔异常',
    icon: <Clock size={14} />,
    dotColor: 'bg-alert-warning border-alert-warning/50',
    lineColor: 'bg-alert-warning/30',
  },
  power_switch: {
    label: '电源切换',
    icon: <BatteryCharging size={14} />,
    dotColor: 'bg-alert-caution border-alert-caution/50',
    lineColor: 'bg-alert-caution/30',
  },
  condensation: {
    label: '设备结露',
    icon: <Droplets size={14} />,
    dotColor: 'bg-ocean-300 border-ocean-300/50',
    lineColor: 'bg-ocean-300/30',
  },
  maintenance: {
    label: '维护工单',
    icon: <Wrench size={14} />,
    dotColor: 'bg-alert-safe border-alert-safe/50',
    lineColor: 'bg-alert-safe/30',
  },
};

const LEVEL_CONFIG: Record<AlertLevel, { label: string; chip: string }> = {
  info: { label: '提示', chip: 'chip-info' },
  warning: { label: '警告', chip: 'chip-caution' },
  critical: { label: '严重', chip: 'chip-warning' },
};

const STATUS_CONFIG: Record<
  ProcessStatus,
  { label: string; chip: string; icon: React.ReactNode }
> = {
  pending: {
    label: '待处理',
    chip: 'chip-warning',
    icon: <Circle size={10} className="animate-pulse" />,
  },
  processing: {
    label: '处理中',
    chip: 'chip-caution',
    icon: <CircleDashed size={10} className="animate-spin" />,
  },
  resolved: {
    label: '已解决',
    chip: 'chip-safe',
    icon: <CheckCircle2 size={10} />,
  },
};

const TYPE_FILTERS: { value: AlertType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'interval_abnormal', label: '间隔异常' },
  { value: 'power_switch', label: '电源切换' },
  { value: 'condensation', label: '结露预警' },
  { value: 'maintenance', label: '维护工单' },
];

const STATUS_FILTERS: { value: ProcessStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
];

function AlertItem({ alert, index, total }: { alert: AlertEvent; index: number; total: number }) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useDutyStore((s) => s.updateAlertStatus);
  const config = TYPE_CONFIG[alert.type];
  const levelCfg = LEVEL_CONFIG[alert.level];
  const statusCfg = STATUS_CONFIG[alert.status];

  const isLast = index === total - 1;

  const handleAction = (action: 'process' | 'resolve') => {
    if (action === 'process') {
      updateStatus(alert.id, 'processing');
    } else {
      updateStatus(alert.id, 'resolved', '时间线处理');
    }
  };

  return (
    <div className="relative pl-8">
      {!isLast && (
        <div
          className={`absolute left-[6px] top-6 w-px h-[calc(100%-12px)] ${config.lineColor}`}
        />
      )}
      <div
        className={`timeline-dot flex items-center justify-center border-2 ${config.dotColor} ${
          alert.status !== 'resolved' ? 'animate-pulse-slow' : ''
        }`}
      >
        <div className="text-[8px] text-white [&>svg]:w-3 [&>svg]:h-3 [&>svg]:-mt-0.5">
          {config.icon}
        </div>
      </div>

      <div
        className={`glass-card p-4 mb-4 cursor-pointer transition-all hover:bg-ocean-700/20 ${
          alert.status === 'pending'
            ? 'ring-1 ring-alert-warning/30'
            : alert.status === 'processing'
            ? 'ring-1 ring-alert-caution/30'
            : ''
        }`}
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`chip ${levelCfg.chip}`}>{levelCfg.label}</span>
              <span className="text-sm font-medium text-ocean-100">{alert.title}</span>
              <span className={`chip ${statusCfg.chip}`}>
                {statusCfg.icon}
                {statusCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-ocean-400">
              <span>{formatDateTime(alert.timestamp)}</span>
              <span>·</span>
              <span>{timeAgo(alert.timestamp)}</span>
              {alert.handler && (
                <>
                  <span>·</span>
                  <span>处理人: {alert.handler}</span>
                </>
              )}
            </div>
          </div>
          <button className="text-ocean-400 hover:text-ocean-200 transition-colors flex-shrink-0">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <p className="text-sm text-ocean-200 mt-3 line-clamp-2">{alert.description}</p>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-ocean-700/40 space-y-3">
            <div>
              <div className="text-xs text-ocean-400 mb-1">告警详情</div>
              <p className="text-sm text-ocean-200 bg-ocean-950/50 rounded-lg p-3">
                {alert.description}
              </p>
            </div>

            {alert.resolvedAt && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-ocean-950/50 rounded-lg p-3">
                  <div className="text-ocean-400">解决时间</div>
                  <div className="text-ocean-100 mt-1">{formatDateTime(alert.resolvedAt)}</div>
                </div>
                {alert.resolution && (
                  <div className="bg-ocean-950/50 rounded-lg p-3">
                    <div className="text-ocean-400">处理方式</div>
                    <div className="text-ocean-100 mt-1">{alert.resolution}</div>
                  </div>
                )}
              </div>
            )}

            {alert.status !== 'resolved' && (
              <div className="flex gap-2 pt-1">
                {alert.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction('process');
                    }}
                    className="flex-1 py-2 text-sm rounded-lg bg-alert-caution/20 text-alert-caution hover:bg-alert-caution/30 transition-colors"
                  >
                    开始处理
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('resolve');
                  }}
                  className="flex-1 py-2 text-sm rounded-lg bg-alert-safe/20 text-alert-safe hover:bg-alert-safe/30 transition-colors"
                >
                  标记已解决
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlertTimeline() {
  const alerts = useDutyStore((s) => s.alerts);
  const shiftStartTime = useDutyStore((s) => s.shiftStartTime);
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProcessStatus | 'all'>('all');

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((a) => a.timestamp >= shiftStartTime)
      .filter((a) => (typeFilter === 'all' ? true : a.type === typeFilter))
      .filter((a) => (statusFilter === 'all' ? true : a.status === statusFilter))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [alerts, shiftStartTime, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const shiftAlerts = alerts.filter((a) => a.timestamp >= shiftStartTime);
    return {
      total: shiftAlerts.length,
      pending: shiftAlerts.filter((a) => a.status === 'pending').length,
      processing: shiftAlerts.filter((a) => a.status === 'processing').length,
      resolved: shiftAlerts.filter((a) => a.status === 'resolved').length,
      critical: shiftAlerts.filter((a) => a.level === 'critical').length,
    };
  }, [alerts, shiftStartTime]);

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History size={22} className="text-ocean-200" />
            <h2 className="font-display text-2xl text-ocean-100">当晚告警时间线</h2>
          </div>
          <span className="text-xs text-ocean-400">
            开始于 {formatTime(shiftStartTime)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-ocean-900/50 rounded-lg p-2.5 text-center border border-ocean-700/30">
            <div className="text-xl font-bold text-ocean-100">{stats.total}</div>
            <div className="text-[10px] text-ocean-400">总告警</div>
          </div>
          <div className="bg-alert-warning/10 rounded-lg p-2.5 text-center border border-alert-warning/20">
            <div className="text-xl font-bold text-alert-warning">{stats.pending}</div>
            <div className="text-[10px] text-ocean-400">待处理</div>
          </div>
          <div className="bg-alert-caution/10 rounded-lg p-2.5 text-center border border-alert-caution/20">
            <div className="text-xl font-bold text-alert-caution">{stats.processing}</div>
            <div className="text-[10px] text-ocean-400">处理中</div>
          </div>
          <div className="bg-alert-safe/10 rounded-lg p-2.5 text-center border border-alert-safe/20">
            <div className="text-xl font-bold text-alert-safe">{stats.resolved}</div>
            <div className="text-[10px] text-ocean-400">已解决</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-ocean-400" />
            <span className="text-xs text-ocean-400">筛选:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  typeFilter === f.value
                    ? 'bg-ocean-400/30 text-ocean-100 border border-ocean-400/50'
                    : 'bg-ocean-900/50 text-ocean-400 border border-ocean-700/30 hover:bg-ocean-800/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  statusFilter === f.value
                    ? 'bg-ocean-400/30 text-ocean-100 border border-ocean-400/50'
                    : 'bg-ocean-900/50 text-ocean-400 border border-ocean-700/30 hover:bg-ocean-800/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 -mr-2">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 text-ocean-400">
            <History size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-sm">暂无告警记录</p>
            <p className="text-xs mt-1 opacity-70">保持值守，系统自动监测异常</p>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              index={idx}
              total={filteredAlerts.length}
            />
          ))
        )}
      </div>
    </div>
  );
}
