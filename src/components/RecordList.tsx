import React from 'react';
import { LightningRecord, RISK_CONFIG, CARDINAL_DIRECTIONS, LIGHTNING_TYPE_LABELS, BRIGHTNESS_LABELS, RAIN_INTENSITY_LABELS } from '../types';

interface RecordListProps {
  records: LightningRecord[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const RecordList: React.FC<RecordListProps> = ({ records, onDelete, onClearAll }) => {
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  if (records.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>
          观测记录
          <span className="text-sm font-normal text-slate-500">(0)</span>
        </h2>
        <div className="bg-slate-900/60 rounded-xl p-10 text-center border border-dashed border-slate-700">
          <div className="text-6xl mb-4 opacity-50">🌩️</div>
          <div className="text-slate-400 text-lg font-medium">暂无观测记录</div>
          <div className="text-slate-500 text-sm mt-2">
            观测到闪电后，填写上方表单并点击 "记录这次闪电"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          观测记录
          <span className="badge bg-storm-500/20 text-storm-300 border border-storm-500/30">
            {records.length} 条
          </span>
        </h2>
        <button
          onClick={onClearAll}
          className="text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
        >
          🗑️ 清空全部
        </button>
      </div>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {sorted.map((record, idx) => {
          const risk = RISK_CONFIG[record.riskLevel];
          const azimuthIdx = Math.round(record.lightningAzimuth / 22.5) % 16;
          const dir = CARDINAL_DIRECTIONS[azimuthIdx];
          const realIdx = records.length - idx;
          const isRecent = (Date.now() - record.timestamp) < 60000;

          return (
            <div
              key={record.id}
              className={`bg-slate-900/50 rounded-xl p-4 border transition-all hover:bg-slate-900/70 ${
                isRecent ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/5' : 'border-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-lg font-bold text-slate-300">#{realIdx}</span>
                    <span className={`badge ${risk.bgColor} ${risk.color} border`}>
                      {risk.label}
                    </span>
                    <span className="badge bg-slate-700/50 text-slate-400 border border-slate-600/50">
                      {LIGHTNING_TYPE_LABELS[record.lightningType]}
                    </span>
                    {isRecent && (
                      <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 animate-pulse">
                        ⚡ 刚刚
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500 text-xs">时间</div>
                      <div className="text-slate-200 font-medium">
                        {formatTime(record.timestamp)}
                        <span className="text-xs text-slate-500 ml-1">{formatDate(record.timestamp)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">方位 / 距离</div>
                      <div className="text-slate-200 font-medium">
                        <span className="text-yellow-400">{dir.code}</span>
                        <span className="text-slate-500 mx-1">·</span>
                        <span className="text-storm-400">{record.estimatedDistanceKm}km</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">亮度 / 延迟</div>
                      <div className="text-slate-200 font-medium">
                        <span className="text-orange-400">{BRIGHTNESS_LABELS[record.brightness].label}</span>
                        <span className="text-slate-500 mx-1">·</span>
                        <span className="text-blue-400">{record.thunderDelaySeconds}s</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">观测点 / 降雨</div>
                      <div className="text-slate-200 font-medium truncate">
                        <span>{record.observationPoint}</span>
                        <span className="ml-1">{RAIN_INTENSITY_LABELS[record.rainIntensity].icon}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDelete(record.id)}
                  className="flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="删除记录"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecordList;
