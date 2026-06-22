import { useState } from 'react';
import {
  Eye,
  Wind,
  Waves,
  Lightbulb,
  Volume2,
  Ship,
  MessageSquarePlus,
  CloudRain,
  CheckCircle2,
} from 'lucide-react';
import type { DutyFormData, WindDirection, SeaState, VesselFeedback } from '../utils/types';
import {
  WIND_DIRECTIONS,
  SEA_STATE_LABELS,
  VESSEL_FEEDBACK_OPTIONS,
  NORMAL_LIGHT_PERIOD,
  NORMAL_FOG_INTERVAL,
} from '../utils/constants';
import { getVisibilityLevel } from '../utils/helpers';
import { useDutyStore } from '../store/useDutyStore';

const DEFAULT_FORM: DutyFormData = {
  visibility: 500,
  windDirection: 'NE',
  windSpeed: 15,
  seaState: 3,
  humidity: 75,
  lightPeriod: 4,
  fogInterval: 60,
  vesselFeedback: 'none',
  vesselCount: 0,
  remarks: '',
};

interface Props {
  onRecordAdded?: (newAlertsCount: number) => void;
}

export default function DutyForm({ onRecordAdded }: Props) {
  const addRecord = useDutyStore((s) => s.addRecord);
  const [form, setForm] = useState<DutyFormData>(DEFAULT_FORM);
  const [success, setSuccess] = useState(false);

  const visLevel = getVisibilityLevel(form.visibility);
  const lightNormal =
    form.lightPeriod >= NORMAL_LIGHT_PERIOD.min &&
    form.lightPeriod <= NORMAL_LIGHT_PERIOD.max;
  const fogNormal =
    form.fogInterval >= NORMAL_FOG_INTERVAL.min &&
    form.fogInterval <= NORMAL_FOG_INTERVAL.max;

  const update = <K extends keyof DutyFormData>(key: K, value: DutyFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addRecord(form);
    setSuccess(true);
    onRecordAdded?.(result.newAlerts.length);

    setTimeout(() => setSuccess(false), 2000);
    setForm({
      ...DEFAULT_FORM,
      windDirection: form.windDirection,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ocean-100">值守记录录入</h2>
        <span className="chip chip-info text-xs">
          <CheckCircle2 size={12} />
          实时校验
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <Eye size={16} className="text-alert-safe" />
            能见度（米）
          </label>
          <input
            type="number"
            min={10}
            max={10000}
            value={form.visibility}
            onChange={(e) => update('visibility', Number(e.target.value))}
            className={`glow-input ${
              form.visibility < 200 ? 'glow-input-warning' : ''
            }`}
          />
          <div className="flex items-center gap-2">
            <span className={`chip ${visLevel.color} text-xs`}>{visLevel.level}</span>
            <span className="text-xs text-ocean-300">{visLevel.description}</span>
          </div>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={form.visibility}
            onChange={(e) => update('visibility', Number(e.target.value))}
            className="w-full accent-alert-safe"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <CloudRain size={16} className="text-ocean-300" />
            相对湿度（%）
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.humidity}
            onChange={(e) => update('humidity', Number(e.target.value))}
            className={`glow-input ${
              form.humidity >= 85 ? 'glow-input-warning' : ''
            }`}
          />
          <div className="text-xs text-ocean-300">
            {form.humidity >= 85
              ? '⚠️ 高湿度，注意设备结露'
              : form.humidity >= 70
              ? '湿度偏高'
              : '湿度正常'}
          </div>
          <input
            type="range"
            min={30}
            max={100}
            value={form.humidity}
            onChange={(e) => update('humidity', Number(e.target.value))}
            className="w-full accent-ocean-300"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <Wind size={16} className="text-ocean-300" />
            风向
          </label>
          <div className="grid grid-cols-4 gap-2">
            {WIND_DIRECTIONS.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => update('windDirection', w.value as WindDirection)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  form.windDirection === w.value
                    ? 'bg-ocean-400 text-white shadow-glow'
                    : 'bg-ocean-900/50 text-ocean-200 hover:bg-ocean-800/60 border border-ocean-700/40'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <Wind size={16} className="text-ocean-300" />
            风速（节）
          </label>
          <input
            type="number"
            min={0}
            max={80}
            value={form.windSpeed}
            onChange={(e) => update('windSpeed', Number(e.target.value))}
            className="glow-input"
          />
          <input
            type="range"
            min={0}
            max={60}
            value={form.windSpeed}
            onChange={(e) => update('windSpeed', Number(e.target.value))}
            className="w-full accent-ocean-300"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <Waves size={16} className="text-alert-caution" />
            海况（蒲福氏浪级）
          </label>
          <div className="grid grid-cols-5 gap-2">
            {SEA_STATE_LABELS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => update('seaState', s.value as SeaState)}
                className={`p-3 rounded-lg text-xs transition-all border ${
                  form.seaState === s.value
                    ? 'bg-alert-caution/20 text-alert-caution border-alert-caution/40 shadow-glow-caution'
                    : 'bg-ocean-900/50 text-ocean-300 hover:bg-ocean-800/60 border-ocean-700/40'
                }`}
              >
                <div className="font-bold text-sm">{s.value}</div>
                <div>{s.label}</div>
              </button>
            ))}
          </div>
          <div className="text-xs text-ocean-300">
            {SEA_STATE_LABELS.find((s) => s.value === form.seaState)?.desc}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <Lightbulb size={16} className="text-alert-caution" />
            灯光周期（秒）
            <span className="text-xs text-ocean-400 ml-auto">
              标准 {NORMAL_LIGHT_PERIOD.min}-{NORMAL_LIGHT_PERIOD.max}s
            </span>
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={form.lightPeriod}
            onChange={(e) => update('lightPeriod', Number(e.target.value))}
            className={`glow-input ${!lightNormal ? 'glow-input-warning' : ''}`}
          />
          <div className={`text-xs ${lightNormal ? 'text-alert-safe' : 'text-alert-warning'}`}>
            {lightNormal ? '✓ 周期正常' : '⚠ 周期异常，请检查设备'}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <Volume2 size={16} className="text-alert-warning" />
            雾号间隔（秒）
            <span className="text-xs text-ocean-400 ml-auto">
              标准 {NORMAL_FOG_INTERVAL.min}-{NORMAL_FOG_INTERVAL.max}s
            </span>
          </label>
          <input
            type="number"
            min={10}
            max={240}
            value={form.fogInterval}
            onChange={(e) => update('fogInterval', Number(e.target.value))}
            className={`glow-input ${!fogNormal ? 'glow-input-warning' : ''}`}
          />
          <div className={`text-xs ${fogNormal ? 'text-alert-safe' : 'text-alert-warning'}`}>
            {fogNormal ? '✓ 间隔正常' : '⚠ 间隔异常，请检查设备'}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <Ship size={16} className="text-ocean-200" />
            船只反馈
          </label>
          <div className="grid grid-cols-3 gap-3">
            {VESSEL_FEEDBACK_OPTIONS.map((v) => {
              const active = form.vesselFeedback === v.value;
              const colorMap: Record<string, string> = {
                safe: 'border-alert-safe/50 bg-alert-safe/10 text-alert-safe',
                warning: 'border-alert-warning/50 bg-alert-warning/10 text-alert-warning',
                info: 'border-ocean-400/50 bg-ocean-400/10 text-ocean-200',
              };
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => update('vesselFeedback', v.value as VesselFeedback)}
                  className={`p-3 rounded-xl border transition-all text-left ${
                    active
                      ? `${colorMap[v.color]} shadow-lg`
                      : 'border-ocean-700/40 bg-ocean-900/30 text-ocean-300 hover:bg-ocean-800/50'
                  }`}
                >
                  <div className="font-semibold">{v.label}</div>
                  <div className="text-xs opacity-80 mt-1">{v.desc}</div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-ocean-300 whitespace-nowrap">反馈船只数：</label>
            <input
              type="number"
              min={0}
              max={50}
              value={form.vesselCount}
              onChange={(e) => update('vesselCount', Number(e.target.value))}
              className="glow-input max-w-[120px]"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-ocean-200">
            <MessageSquarePlus size={16} className="text-ocean-300" />
            备注
          </label>
          <textarea
            value={form.remarks}
            onChange={(e) => update('remarks', e.target.value)}
            placeholder="其他需要记录的情况..."
            rows={2}
            className="glow-input resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="h-5">
          {success && (
            <span className="chip chip-safe animate-pulse">
              <CheckCircle2 size={12} />
              记录已保存
            </span>
          )}
        </div>
        <button type="submit" className="btn-primary">
          提交值守记录
        </button>
      </div>
    </form>
  );
}
