import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wind, Clock, Package, Activity, Plus, Check } from 'lucide-react';
import dayjs from 'dayjs';
import Header from '../components/Header';
import {
  AirQualityBadge,
  AirQualityBar,
  FilterProgress,
  SectionTitle,
  DaysRemainingChip,
  DeviceAlertBadge,
  formatDate,
  formatDateShort,
} from '../components/ui';
import { useAppStore } from '../store';
import type { Device, ReplacementRecord, Alert, CleanRecord } from '../types';

type TimelineType = 'replacement' | 'alert' | 'clean';

type TimelineItem = {
  date: string;
  type: TimelineType;
  message: string;
  alertId?: string;
  resolved?: boolean;
};

function getFilterProgressColor(percent: number) {
  if (percent > 50) return 'bg-gradient-to-t from-brand-400 to-brand-500';
  if (percent > 20) return 'bg-gradient-to-t from-warn-400 to-warn-500';
  return 'bg-gradient-to-t from-danger-500 to-danger-600';
}

export default function Home() {
  const devices = useAppStore((s) => s.devices);
  const replacements = useAppStore((s) => s.replacements);
  const alerts = useAppStore((s) => s.alerts);
  const cleanRecords = useAppStore((s) => s.cleanRecords);
  const batches = useAppStore((s) => s.batches);
  const thresholds = useAppStore((s) => s.thresholds);
  const getRemainingFilterDays = useAppStore((s) => s.getRemainingFilterDays);
  const getFilterPercent = useAppStore((s) => s.getFilterPercent);
  const getTotalStockBySpec = useAppStore((s) => s.getTotalStockBySpec);
  const resolveAlert = useAppStore((s) => s.resolveAlert);

  const sortedByRemainingDays = useMemo(() => {
    return [...devices]
      .map((device) => ({
        device,
        remainingDays: getRemainingFilterDays(device.id),
        percent: getFilterPercent(device.id),
      }))
      .sort((a, b) => a.remainingDays - b.remainingDays);
  }, [devices, getRemainingFilterDays, getFilterPercent]);

  const stockBySpec = useMemo(() => {
    const specSet = new Set(devices.map((d) => d.filterSpec));
    const specsInBatches = new Set(batches.map((b) => b.spec));
    const allSpecs = new Set([...specSet, ...specsInBatches]);
    return Array.from(allSpecs).map((spec) => ({
      spec,
      total: getTotalStockBySpec(spec),
      safeStock: thresholds.safeStockPerSpec,
      gap: Math.max(0, thresholds.safeStockPerSpec - getTotalStockBySpec(spec)),
      isLow: getTotalStockBySpec(spec) < thresholds.safeStockPerSpec,
    }));
  }, [devices, batches, thresholds, getTotalStockBySpec]);

  const timelineItems = useMemo(() => {
    const replacementItems: TimelineItem[] = replacements.map((r: ReplacementRecord) => ({
      date: r.date,
      type: 'replacement' as TimelineType,
      message: `${r.deviceName} · 更换「${r.newFilterSpec}」· 操作人：${r.installer}`,
    }));

    const alertItems: TimelineItem[] = alerts
      .filter((a: Alert) => !a.resolved)
      .map((a: Alert) => ({
        date: a.triggeredAt,
        type: 'alert' as TimelineType,
        message: a.message,
        alertId: a.id,
        resolved: a.resolved,
      }));

    const cleanItems: TimelineItem[] = cleanRecords.map((c: CleanRecord) => {
      const device = devices.find((d) => d.id === c.deviceId);
      const deviceName = device ? `${device.room}-${device.model}` : c.deviceId;
      return {
        date: c.date,
        type: 'clean' as TimelineType,
        message: `${deviceName} · 清灰维护 · 操作人：${c.operator}${c.note ? ` · ${c.note}` : ''}`,
      };
    });

    const allItems = [...replacementItems, ...alertItems, ...cleanItems];
    allItems.sort((a, b) => (dayjs(b.date).isAfter(dayjs(a.date)) ? 1 : -1));
    return allItems.slice(0, 10);
  }, [replacements, alerts, cleanRecords, devices]);

  const getTimelineColor = (type: TimelineType) => {
    switch (type) {
      case 'replacement':
        return 'bg-air-excellent';
      case 'alert':
        return 'bg-warn-500';
      case 'clean':
        return 'bg-brand-400';
    }
  };

  const getTimelineTagStyle = (type: TimelineType) => {
    switch (type) {
      case 'replacement':
        return 'bg-air-excellent/10 text-air-excellent border border-air-excellent/30';
      case 'alert':
        return 'bg-warn-50 text-warn-600 border border-warn-300';
      case 'clean':
        return 'bg-brand-50 text-brand-600 border border-brand-100';
    }
  };

  const getTimelineLabel = (type: TimelineType) => {
    switch (type) {
      case 'replacement':
        return '滤芯更换';
      case 'alert':
        return '告警提醒';
      case 'clean':
        return '清灰维护';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="滤芯管理仪表盘" subtitle="实时追踪每台设备健康状态与库存" />

      <div className="flex flex-col px-8 py-6 gap-8 flex-1">
        <section>
          <SectionTitle
            icon={Wind}
            title="房间空气状态"
            desc="各房间净化器实时监测"
            action={
              <Link to="/devices" className="ghost-btn">
                <Plus className="w-4 h-4" strokeWidth={1.8} />
                <span>添加设备</span>
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {devices.map((device: Device, index: number) => {
              const percent = getFilterPercent(device.id);
              const remainingDays = getRemainingFilterDays(device.id);
              const staggerClass = `stagger-${(index % 6) + 1}` as const;

              return (
                <div
                  key={device.id}
                  className={`base-card overflow-hidden animate-fade-in-up ${staggerClass}`}
                >
                  <AirQualityBar level={device.airQuality} />

                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-black text-brand-800">{device.room}</h4>
                        <p className="text-xs text-brand-500 mt-0.5">{device.model}</p>
                      </div>
                      <DeviceAlertBadge deviceId={device.id} />
                    </div>

                    <div className="mt-3">
                      <AirQualityBadge level={device.airQuality} pm25={device.pm25} />
                    </div>

                    <div className="rounded-xl overflow-hidden mt-4 h-40 w-full">
                      <img
                        src={device.photo}
                        alt={device.room}
                        className="h-40 w-full object-cover"
                      />
                    </div>

                    <div className="mt-4">
                      <FilterProgress percent={percent} />
                    </div>

                    <div className="flex justify-between mt-4 items-center">
                      <DaysRemainingChip days={remainingDays} />
                      <span className="tag bg-brand-50 text-brand-600 border border-brand-100">
                        {device.filterSpec}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <SectionTitle
              icon={Clock}
              title="滤芯更换倒计时"
              desc="按剩余天数排序，临期自动标黄"
            />

            <div>
              {sortedByRemainingDays.map(({ device, remainingDays, percent }, index) => {
                const isUrgent = remainingDays <= thresholds.filterExpiringDays;
                const usedDays = dayjs('2026-06-19').diff(device.currentFilterStartDate, 'day');

                return (
                  <div
                    key={device.id}
                    className={`flex items-center gap-4 p-4 rounded-xl mb-3 ${
                      isUrgent
                        ? 'warn-card'
                        : 'bg-brand-50/60 border border-brand-100'
                    }`}
                  >
                    <div className="w-24 h-16 shrink-0 rounded-xl bg-white p-2 border border-surface-border">
                      <div className="flex flex-col-reverse h-full rounded-lg overflow-hidden bg-brand-50">
                        <div
                          className={`w-full ${getFilterProgressColor(percent)} transition-all duration-700 ease-out`}
                          style={{ height: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="text-base font-bold text-brand-800 truncate">
                        {device.room}
                      </h5>
                      <p className="text-xs text-brand-500 truncate">{device.model}</p>
                      <p className="text-xs text-brand-400 font-mono mt-1">
                        已用 {usedDays} 天 / 总 {device.expectedFilterDays} 天
                      </p>
                    </div>

                    <DaysRemainingChip days={remainingDays} />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-1">
            <SectionTitle
              icon={Package}
              title="库存缺口"
              desc="低于安全库存自动标黄"
            />

            <div>
              {stockBySpec.map(({ spec, total, safeStock, gap, isLow }) => (
                <div
                  key={spec}
                  className={`p-4 rounded-xl mb-3 ${
                    isLow
                      ? 'warn-card'
                      : 'bg-white border border-surface-border'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-brand-800 truncate mr-2">
                      {spec}
                    </span>
                    <span
                      className={`tag shrink-0 ${
                        isLow ? 'bg-warn-500 text-white' : 'bg-air-excellent text-white'
                      }`}
                    >
                      {isLow ? '缺口' : '正常'}
                    </span>
                  </div>

                  <div
                    className={`text-3xl font-black font-mono mt-2 ${
                      isLow ? 'text-warn-600' : 'text-brand-700'
                    }`}
                  >
                    {total}
                  </div>

                  <div className="text-xs text-brand-500 mt-1">
                    安全库存 {safeStock} 件 · 缺口 {gap} 件
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="base-card p-6 animate-fade-in-up stagger-6">
          <SectionTitle
            icon={Activity}
            title="最近事件时间线"
            desc="更换、告警、清灰记录一览"
          />

          <div>
            {timelineItems.map((item, index) => {
              const isLast = index === timelineItems.length - 1;
              const color = getTimelineColor(item.type);

              return (
                <div key={`${item.date}-${item.type}-${index}`} className={`flex gap-4 ${isLast ? 'pb-0' : 'pb-5'}`}>
                  <div className="w-16 shrink-0 text-right">
                    <div className="text-sm font-mono font-bold text-brand-700">
                      {formatDate(item.date)}
                    </div>
                    <div className="text-xs text-brand-400">
                      {formatDateShort(item.date)}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${color}`}
                    />
                    {!isLast && (
                      <div className="flex-1 w-0.5 bg-brand-100 mt-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className={`tag ${getTimelineTagStyle(item.type)}`}>
                          {getTimelineLabel(item.type)}
                        </span>
                        <p className="text-sm text-brand-700 mt-1 break-words">
                          {item.message}
                        </p>
                      </div>
                      {item.type === 'alert' && item.alertId && !item.resolved && (
                        <button
                          onClick={() => resolveAlert(item.alertId!)}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-500 bg-brand-50 border border-brand-100 hover:bg-brand-100 hover:text-brand-600 transition-all duration-200 group"
                        >
                          <Check className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" strokeWidth={2} />
                          <span>已处理</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
