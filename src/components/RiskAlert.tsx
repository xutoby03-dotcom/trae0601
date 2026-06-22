import React from 'react';
import { LightningRecord, RISK_CONFIG, CARDINAL_DIRECTIONS, LIGHTNING_TYPE_LABELS, BRIGHTNESS_LABELS, RAIN_INTENSITY_LABELS } from '../types';

interface RiskAlertProps {
  latestRecord: LightningRecord | null;
}

const RiskAlert: React.FC<RiskAlertProps> = ({ latestRecord }) => {
  if (!latestRecord) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          <span className="text-2xl">🛡️</span>
          安全状态
        </h2>
        <div className="bg-slate-900/60 rounded-xl p-6 text-center border border-emerald-500/30">
          <div className="text-5xl mb-3">🌤️</div>
          <div className="text-emerald-400 font-bold text-lg">暂无闪电记录</div>
          <div className="text-slate-400 text-sm mt-2">
            观测到闪电后，此处将显示风险评估
          </div>
        </div>
      </div>
    );
  }

  const risk = RISK_CONFIG[latestRecord.riskLevel];
  const timeAgo = Math.floor((Date.now() - latestRecord.timestamp) / 1000);
  const timeAgoText = timeAgo < 60
    ? `${timeAgo}秒前`
    : timeAgo < 3600
    ? `${Math.floor(timeAgo / 60)}分${timeAgo % 60}秒前`
    : `${Math.floor(timeAgo / 3600)}小时前`;

  const azimuthDir = CARDINAL_DIRECTIONS.find(
    d => d.code === CARDINAL_DIRECTIONS[Math.round(latestRecord.lightningAzimuth / 22.5) % 16].code
  );

  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <span className="text-2xl">🛡️</span>
        安全状态
      </h2>

      <div className={`rounded-xl p-5 border-2 ${risk.bgColor}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-sm font-medium ${risk.color} opacity-80`}>当前风险等级</div>
            <div className={`text-3xl font-extrabold ${risk.color} mt-1`}>
              {risk.label}
            </div>
          </div>
          <div className="text-5xl">
            {latestRecord.riskLevel === 'extreme' && '🚨'}
            {latestRecord.riskLevel === 'danger' && '⚠️'}
            {latestRecord.riskLevel === 'caution' && '⚡'}
            {latestRecord.riskLevel === 'safe' && '✅'}
          </div>
        </div>
        <div className="mt-4 text-slate-200 text-sm leading-relaxed p-3 bg-slate-900/40 rounded-lg">
          💡 {risk.advice}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">距离</div>
          <div className="text-2xl font-bold text-storm-400">
            {latestRecord.estimatedDistanceKm}
            <span className="text-sm text-slate-400 font-normal ml-1">km</span>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">方位</div>
          <div className="text-2xl font-bold text-yellow-400">
            {azimuthDir?.label ?? '--'}
            <span className="text-sm text-slate-400 font-normal ml-1">
              {latestRecord.lightningAzimuth}°
            </span>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">雷声延迟</div>
          <div className="text-2xl font-bold text-blue-400">
            {latestRecord.thunderDelaySeconds}
            <span className="text-sm text-slate-400 font-normal ml-1">秒</span>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">记录时间</div>
          <div className="text-lg font-bold text-slate-300">
            {timeAgoText}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/30 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">闪电类型</span>
          <span className="text-slate-200 font-medium">{LIGHTNING_TYPE_LABELS[latestRecord.lightningType]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">亮度</span>
          <span className="text-slate-200 font-medium">
            {BRIGHTNESS_LABELS[latestRecord.brightness].label} ({latestRecord.brightness}/5)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">降雨</span>
          <span className="text-slate-200 font-medium">
            {RAIN_INTENSITY_LABELS[latestRecord.rainIntensity].icon} {RAIN_INTENSITY_LABELS[latestRecord.rainIntensity].label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">观测点</span>
          <span className="text-slate-200 font-medium">{latestRecord.observationPoint}</span>
        </div>
      </div>

      {latestRecord.riskLevel === 'extreme' || latestRecord.riskLevel === 'danger' ? (
        <div className="animate-pulse">
          <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <span className="text-xl">⛔</span>
              30-30 安全规则提醒
            </div>
            <div className="text-red-200/80 text-sm mt-2">
              闪电到雷声间隔少于 30 秒 → 立即进入室内！<br />
              最后一声雷后等待 30 分钟再外出！
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RiskAlert;
