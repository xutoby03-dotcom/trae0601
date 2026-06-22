import React from 'react';
import {
  OBSERVATION_POINTS,
  CARDINAL_DIRECTIONS,
  LIGHTNING_TYPE_LABELS,
  BRIGHTNESS_LABELS,
  RAIN_INTENSITY_LABELS,
  LightningType,
  BrightnessLevel,
  RainIntensity,
  CardinalDirection,
} from '../types';

interface ObservationFormProps {
  observationPoint: string;
  setObservationPoint: (v: string) => void;
  viewDirection: CardinalDirection;
  setViewDirection: (v: CardinalDirection) => void;
  lightningAzimuth: number | null;
  setLightningAzimuth: (v: number | null) => void;
  lightningType: LightningType;
  setLightningType: (v: LightningType) => void;
  brightness: BrightnessLevel;
  setBrightness: (v: BrightnessLevel) => void;
  thunderDelaySeconds: number | null;
  setThunderDelaySeconds: (v: number | null) => void;
  rainIntensity: RainIntensity;
  setRainIntensity: (v: RainIntensity) => void;
  onSubmit: () => void;
  onReset: () => void;
  estimatedDistance: number | null;
  isValid: boolean;
}

const ObservationForm: React.FC<ObservationFormProps> = ({
  observationPoint,
  setObservationPoint,
  viewDirection,
  setViewDirection,
  lightningAzimuth,
  setLightningAzimuth,
  lightningType,
  setLightningType,
  brightness,
  setBrightness,
  thunderDelaySeconds,
  setThunderDelaySeconds,
  rainIntensity,
  setRainIntensity,
  onSubmit,
  onReset,
  estimatedDistance,
  isValid,
}) => {
  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          观测记录
        </h2>
        <button onClick={onReset} className="btn-secondary text-sm py-2 px-4">
          重置
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="form-label">📍 观测点</label>
          <select
            className="form-select"
            value={observationPoint}
            onChange={(e) => setObservationPoint(e.target.value)}
          >
            <option value="">请选择观测点...</option>
            {OBSERVATION_POINTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">🧭 视野方向</label>
          <div className="grid grid-cols-4 gap-2">
            {CARDINAL_DIRECTIONS.filter((_, i) => i % 2 === 0).map((dir) => (
              <button
                key={dir.code}
                type="button"
                onClick={() => setViewDirection(dir.code)}
                className={`py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                  viewDirection === dir.code
                    ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/60 shadow-lg shadow-yellow-500/10'
                    : 'bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">{dir.code}</div>
                <div className="text-[10px] opacity-75">{dir.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">
            ⚡ 闪电方位 (点击罗盘图或输入角度 0°-360°)
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              className="form-input flex-1"
              min={0}
              max={360}
              value={lightningAzimuth ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '') {
                  setLightningAzimuth(null);
                } else {
                  const n = parseFloat(v);
                  if (!isNaN(n) && n >= 0 && n <= 360) {
                    setLightningAzimuth(n);
                  }
                }
              }}
              placeholder="0° - 正北, 90° - 正东..."
            />
            <div className="w-24 flex items-center justify-center bg-slate-900/70 border border-slate-600 rounded-xl">
              {lightningAzimuth !== null ? (
                <div className="text-center">
                  <div className="text-yellow-400 font-mono text-sm">{lightningAzimuth}°</div>
                  <div className="text-[10px] text-slate-400">
                    {CARDINAL_DIRECTIONS[Math.round(lightningAzimuth / 22.5) % 16].label}
                  </div>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">未设定</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="form-label">🌩️ 闪电类型</label>
          <select
            className="form-select"
            value={lightningType}
            onChange={(e) => setLightningType(e.target.value as LightningType)}
          >
            {(Object.entries(LIGHTNING_TYPE_LABELS) as [LightningType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">💡 亮度等级</label>
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as BrightnessLevel[]).map((lvl) => {
                const cfg = BRIGHTNESS_LABELS[lvl];
                const colors: Record<number, string> = {
                  1: 'from-slate-600 to-slate-500',
                  2: 'from-violet-700 to-violet-500',
                  3: 'from-indigo-600 to-indigo-400',
                  4: 'from-yellow-500 to-yellow-300',
                  5: 'from-orange-500 to-orange-300',
                };
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setBrightness(lvl)}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      brightness === lvl
                        ? `bg-gradient-to-br ${colors[lvl]} text-slate-900 scale-105 shadow-lg`
                        : 'bg-slate-900/50 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-lg">{'⚡'.repeat(Math.ceil(lvl / 2))}</div>
                    <div className="text-xs mt-1">{cfg.label}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg">
              {BRIGHTNESS_LABELS[brightness].description}
            </div>
          </div>
        </div>

        <div>
          <label className="form-label">🔊 雷声到达延迟 (秒)</label>
          <div className="flex gap-3">
            <input
              type="number"
              className="form-input flex-1"
              min={0}
              max={120}
              step="0.1"
              value={thunderDelaySeconds ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '') {
                  setThunderDelaySeconds(null);
                } else {
                  const n = parseFloat(v);
                  if (!isNaN(n) && n >= 0) {
                    setThunderDelaySeconds(n);
                  }
                }
              }}
              placeholder="看到闪电后按秒表计时..."
            />
            <div className="w-28 flex flex-col items-center justify-center bg-slate-900/70 border border-slate-600 rounded-xl px-2">
              {estimatedDistance !== null ? (
                <>
                  <div className="text-storm-400 font-bold text-lg">{estimatedDistance}</div>
                  <div className="text-[10px] text-slate-400">估算距离 (km)</div>
                </>
              ) : (
                <span className="text-slate-500 text-xs text-center">输入延迟<br />自动计算</span>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            提示：每延迟 3 秒约等于 1 公里距离 (声速 ≈ 343m/s)
          </div>
        </div>

        <div>
          <label className="form-label">🌧️ 降雨强度</label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(RAIN_INTENSITY_LABELS) as [RainIntensity, { label: string; icon: string }][]).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setRainIntensity(k)}
                className={`py-3 px-1 rounded-xl transition-all ${
                  rainIntensity === k
                    ? 'bg-blue-500/30 text-blue-200 border border-blue-500/60 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/50 border border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl">{v.icon}</div>
                <div className="text-[11px] mt-1">{v.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          isValid
            ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          <span className="text-2xl animate-pulse">⚡</span>
          记录这次闪电
          <span className="text-2xl animate-pulse">⚡</span>
        </span>
      </button>

      {!isValid && (
        <div className="text-xs text-amber-400/80 text-center px-4 -mt-3">
          请填写观测点、闪电方位和雷声延迟
        </div>
      )}
    </div>
  );
};

export default ObservationForm;
