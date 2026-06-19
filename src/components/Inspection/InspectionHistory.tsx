import { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  SOUND_OPTIONS,
  LIGHT_OPTIONS,
  VENTILATION_OPTIONS,
  HOSE_OPTIONS,
  VALVE_OPTIONS,
  BATTERY_OPTIONS,
  type Inspection,
} from '@/constants';
import type { StatusLevel } from './InspectionItem';
import {
  Volume2,
  Lightbulb,
  Wind,
  Fuel,
  CircleDot,
  BatteryFull,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  StickyNote,
  Calendar,
} from 'lucide-react';

interface InspectionHistoryProps {
  deviceId: string;
}

const statusConfig = {
  success: {
    label: '正常',
    className: 'bg-success-100 text-success-600 border-success-200',
    dotClass: 'bg-success-500',
  },
  warning: {
    label: '警告',
    className: 'bg-warning-100 text-warning-600 border-warning-200',
    dotClass: 'bg-warning-500',
  },
  danger: {
    label: '异常',
    className: 'bg-danger-100 text-danger-600 border-danger-200',
    dotClass: 'bg-danger-500',
  },
} as const;

const itemConfig = [
  {
    key: 'sound_status',
    label: '声响',
    icon: Volume2,
    options: SOUND_OPTIONS,
  },
  {
    key: 'light_status',
    label: '指示灯',
    icon: Lightbulb,
    options: LIGHT_OPTIONS,
  },
  {
    key: 'ventilation',
    label: '通风',
    icon: Wind,
    options: VENTILATION_OPTIONS,
  },
  {
    key: 'hose_status',
    label: '软管',
    icon: Fuel,
    options: HOSE_OPTIONS,
  },
  {
    key: 'valve_status',
    label: '阀门',
    icon: CircleDot,
    options: VALVE_OPTIONS,
  },
  {
    key: 'battery_level',
    label: '电池',
    icon: BatteryFull,
    options: BATTERY_OPTIONS,
  },
] as const;

type InspectionStatusKey = (typeof itemConfig)[number]['key'];

const getLevelByValue = (key: InspectionStatusKey, value: string): StatusLevel => {
  const item = itemConfig.find((c) => c.key === key);
  if (!item) return 'success';
  const opt = (item.options as Array<{ value: string; level: StatusLevel }>).find(
    (o) => o.value === value
  );
  return opt?.level ?? 'success';
};

const getLabelByValue = (key: InspectionStatusKey, value: string): string => {
  const item = itemConfig.find((c) => c.key === key);
  if (!item) return value;
  const opt = (item.options as Array<{ value: string; label: string }>).find(
    (o) => o.value === value
  );
  return opt?.label ?? value;
};

interface MonthGroup {
  key: string;
  label: string;
  inspections: Inspection[];
  hasAnomaly: boolean;
}

const formatMonth = (dateStr: string): { key: string; label: string } => {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  return {
    key: `${year}-${String(month).padStart(2, '0')}`,
    label: `${year}年${month}月`,
  };
};

export default function InspectionHistory({ deviceId }: InspectionHistoryProps) {
  const inspections = useAppStore((s) => s.getInspectionsByDevice(deviceId));
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const monthGroups = useMemo<MonthGroup[]>(() => {
    const groups = new Map<string, MonthGroup>();
    for (const ins of inspections) {
      const { key, label } = formatMonth(ins.inspect_date);
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label,
          inspections: [],
          hasAnomaly: false,
        });
      }
      const g = groups.get(key)!;
      g.inspections.push(ins);
      if (ins.has_anomaly) g.hasAnomaly = true;
    }
    return Array.from(groups.values());
  }, [inspections]);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (inspections.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Calendar className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">暂无自检记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {monthGroups.map((group, groupIndex) => {
        const isExpanded = expandedMonths.has(group.key) || groupIndex === 0;
        return (
          <div
            key={group.key}
            className={cn(
              'rounded-2xl border transition-colors',
              group.hasAnomaly ? 'border-danger-200 bg-danger-50/20' : 'border-slate-200 bg-white'
            )}
          >
            <button
              type="button"
              onClick={() => toggleMonth(group.key)}
              className="flex w-full items-center gap-3 px-5 py-4"
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  group.hasAnomaly ? 'bg-danger-100' : 'bg-brand-100'
                )}
              >
                <Calendar
                  className={cn(
                    'h-4 w-4',
                    group.hasAnomaly ? 'text-danger-500' : 'text-brand-500'
                  )}
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{group.label}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {group.inspections.length} 次
                  </span>
                  {group.hasAnomaly && (
                    <span className="flex items-center gap-1 rounded-full bg-danger-100 px-2 py-0.5 text-xs font-medium text-danger-600">
                      <AlertTriangle className="h-3 w-3" />
                      有异常
                    </span>
                  )}
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-5 pb-5">
                <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-4">
                  {group.inspections.map((ins, idx) => (
                    <div key={ins.id} className="relative">
                      <div
                        className={cn(
                          'absolute -left-[29px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white',
                          ins.has_anomaly ? 'bg-danger-500' : 'bg-success-500'
                        )}
                      />
                      <div
                        className={cn(
                          'rounded-xl border p-4',
                          ins.has_anomaly ? 'border-danger-200 bg-white' : 'border-slate-100 bg-slate-50/50'
                        )}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">
                              {ins.inspect_date}
                            </span>
                            <span className="text-xs text-slate-400">
                              第 {idx + 1} 次
                            </span>
                          </div>
                          {ins.has_anomaly && (
                            <div className="flex items-center gap-1 rounded-lg bg-danger-100 px-2.5 py-1 text-xs font-medium text-danger-600">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              发现 {ins.anomaly_types.length} 项异常
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {itemConfig.map((config) => {
                            const value = ins[config.key as InspectionStatusKey] as string;
                            const level = getLevelByValue(config.key, value);
                            const statusInfo = statusConfig[level];
                            const Icon = config.icon;
                            return (
                              <div
                                key={config.key}
                                className={cn(
                                  'flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs',
                                  statusInfo.className
                                )}
                                title={getLabelByValue(config.key, value)}
                              >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{config.label}</span>
                                <span className="ml-auto shrink-0 font-medium">
                                  {statusInfo.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {ins.remark && (
                          <div className="mt-3 flex items-start gap-2 rounded-lg bg-white p-3 border border-slate-100">
                            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {ins.remark}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
