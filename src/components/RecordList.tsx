import {
  Clock,
  Eye,
  Wind,
  Waves,
  Lightbulb,
  Volume2,
  Ship,
  Droplets,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { useDutyStore } from '../store/useDutyStore';
import { formatTime, getVisibilityLevel } from '../utils/helpers';
import { WIND_DIRECTIONS, SEA_STATE_LABELS, VESSEL_FEEDBACK_OPTIONS } from '../utils/constants';
import type { DutyRecord } from '../utils/types';

function RecordItem({ record, index }: { record: DutyRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const visLevel = getVisibilityLevel(record.visibility);
  const windDir = WIND_DIRECTIONS.find((w) => w.value === record.windDirection);
  const seaState = SEA_STATE_LABELS.find((s) => s.value === record.seaState);
  const vesselFb = VESSEL_FEEDBACK_OPTIONS.find(
    (v) => v.value === record.vesselFeedback
  );

  const hasAbnormal = !record.lightPeriodNormal || !record.fogIntervalNormal;

  return (
    <div
      className={`glass-card p-4 transition-all ${
        hasAbnormal ? 'ring-1 ring-alert-warning/30' : ''
      }`}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ocean-800/60 flex items-center justify-center text-ocean-200 font-display font-bold">
            {index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ocean-100">
                {formatTime(record.timestamp)}
              </span>
              {hasAbnormal && (
                <span className="chip chip-warning text-[10px]">设备异常</span>
              )}
              {record.humidity >= 85 && (
                <span className="chip chip-info text-[10px]">高湿</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-ocean-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {record.visibility}m
              </span>
              <span className="flex items-center gap-1">
                <Wind size={11} />
                {windDir?.label} {record.windSpeed}节
              </span>
              <span className="flex items-center gap-1">
                <Waves size={11} />
                {seaState?.label}
              </span>
            </div>
          </div>
        </div>
        <button className="text-ocean-400 hover:text-ocean-200 transition-colors">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-ocean-700/30 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-ocean-950/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
              <Eye size={12} />
              能见度
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-ocean-100">
                {record.visibility}m
              </span>
              <span className={`chip ${visLevel.color} text-[10px]`}>
                {visLevel.level}
              </span>
            </div>
          </div>

          <div className="bg-ocean-950/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
              <Wind size={12} />
              风况
            </div>
            <div className="text-lg font-bold text-ocean-100">
              {windDir?.label} {record.windSpeed} 节
            </div>
          </div>

          <div className="bg-ocean-950/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
              <Waves size={12} />
              海况
            </div>
            <div className="text-lg font-bold text-ocean-100">
              {seaState?.value} 级 · {seaState?.label}
            </div>
          </div>

          <div className="bg-ocean-950/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
              <Droplets size={12} />
              湿度
            </div>
            <div
              className={`text-lg font-bold ${
                record.humidity >= 85 ? 'text-alert-warning' : 'text-ocean-100'
              }`}
            >
              {record.humidity}%
            </div>
          </div>

          <div className="bg-ocean-950/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
              <Lightbulb size={12} />
              灯光周期
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-bold ${
                  record.lightPeriodNormal
                    ? 'text-alert-safe'
                    : 'text-alert-warning'
                }`}
              >
                {record.lightPeriod}s
              </span>
              {record.lightPeriodNormal ? (
                <span className="chip chip-safe text-[10px]">正常</span>
              ) : (
                <span className="chip chip-warning text-[10px]">异常</span>
              )}
            </div>
          </div>

          <div className="bg-ocean-950/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
              <Volume2 size={12} />
              雾号间隔
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-bold ${
                  record.fogIntervalNormal
                    ? 'text-alert-safe'
                    : 'text-alert-warning'
                }`}
              >
                {record.fogInterval}s
              </span>
              {record.fogIntervalNormal ? (
                <span className="chip chip-safe text-[10px]">正常</span>
              ) : (
                <span className="chip chip-warning text-[10px]">异常</span>
              )}
            </div>
          </div>

          <div className="bg-ocean-950/50 rounded-lg p-3 md:col-span-3">
            <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
              <Ship size={12} />
              船只反馈
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`chip ${
                  vesselFb?.color === 'safe'
                    ? 'chip-safe'
                    : vesselFb?.color === 'warning'
                    ? 'chip-warning'
                    : 'chip-info'
                }`}
              >
                {vesselFb?.label}
              </span>
              <span className="text-sm text-ocean-300">
                反馈船只: {record.vesselCount} 艘
              </span>
              {record.remarks && (
                <span className="text-xs text-ocean-400 ml-auto">
                  备注: {record.remarks}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecordList() {
  const records = useDutyStore((s) => s.records);
  const shiftStartTime = useDutyStore((s) => s.shiftStartTime);

  const shiftRecords = records
    .filter((r) => r.timestamp >= shiftStartTime)
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock size={22} className="text-ocean-200" />
          <h2 className="font-display text-2xl text-ocean-100">值守记录历史</h2>
        </div>
        <span className="text-sm text-ocean-400">
          共 {shiftRecords.length} 条记录
        </span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2 -mr-2">
        {shiftRecords.length === 0 ? (
          <div className="text-center py-12 text-ocean-400">
            <Clock size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">暂无值守记录</p>
            <p className="text-xs mt-1 opacity-70">请在上方表单中录入数据</p>
          </div>
        ) : (
          shiftRecords.map((r, i) => <RecordItem key={r.id} record={r} index={i} />)
        )}
      </div>
    </div>
  );
}
