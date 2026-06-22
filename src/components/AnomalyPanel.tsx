import { AlertTriangle } from 'lucide-react';
import type { AnomalyMark } from '@/types/calibration';
import { ANOMALY_LABELS, ANOMALY_COLORS } from '@/types/calibration';

interface AnomalyPanelProps {
  anomalies: AnomalyMark[];
}

const SEVERITY_LABELS: Record<string, string> = {
  low: '轻微',
  medium: '中等',
  high: '严重',
};

export default function AnomalyPanel({ anomalies }: AnomalyPanelProps) {
  if (anomalies.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-[#D4A847]" />
          <h3 className="text-sm font-serif text-[#D4A847] tracking-widest">异常检测</h3>
        </div>
        <div className="text-center py-6 text-[rgba(245,240,232,0.3)] text-xs">
          暂无异常 — 节拍正常
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[#C44536]" />
          <h3 className="text-sm font-serif text-[#C44536] tracking-widest">异常检测</h3>
        </div>
        <span className="text-xs text-[rgba(245,240,232,0.4)]">{anomalies.length} 项异常</span>
      </div>

      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
        {anomalies.map((anomaly) => {
          const color = ANOMALY_COLORS[anomaly.type];
          return (
            <div
              key={anomaly.id}
              className="relative rounded-lg border-l-2 bg-[rgba(26,22,18,0.8)] px-3 py-2"
              style={{ borderLeftColor: color }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color }}>
                  {ANOMALY_LABELS[anomaly.type]}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${color}20`,
                    color,
                  }}
                >
                  {SEVERITY_LABELS[anomaly.severity]}
                </span>
              </div>
              <p className="text-[11px] text-[rgba(245,240,232,0.5)] mt-1 leading-relaxed">
                {anomaly.description}
              </p>
              <p className="text-[10px] text-[rgba(245,240,232,0.25)] mt-1">
                {new Date(anomaly.detectedAt).toLocaleTimeString('zh-CN')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
