import { GitCompare } from 'lucide-react';
import type { CalibrationRecord } from '@/types/calibration';

interface AdjustmentComparisonProps {
  records: CalibrationRecord[];
}

export default function AdjustmentComparison({ records }: AdjustmentComparisonProps) {
  if (records.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <GitCompare size={16} className="text-[#D4A847]" />
          <h3 className="text-sm font-serif text-[#D4A847] tracking-widest">微调对比</h3>
        </div>
        <div className="text-center py-6 text-[rgba(245,240,232,0.3)] text-xs">
          录入参数后自动记录对比
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitCompare size={16} className="text-[#D4A847]" />
          <h3 className="text-sm font-serif text-[#D4A847] tracking-widest">微调对比</h3>
        </div>
        <span className="text-xs text-[rgba(245,240,232,0.4)]">{records.length} 次记录</span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-[rgba(212,168,71,0.15)]">
              <th className="text-left py-1.5 pr-2 text-[rgba(212,168,71,0.6)] font-normal">#</th>
              <th className="text-right py-1.5 px-1 text-[rgba(212,168,71,0.6)] font-normal">误差</th>
              <th className="text-right py-1.5 px-1 text-[rgba(212,168,71,0.6)] font-normal">摆长</th>
              <th className="text-right py-1.5 px-1 text-[rgba(212,168,71,0.6)] font-normal">叉位</th>
              <th className="text-right py-1.5 px-1 text-[rgba(212,168,71,0.6)] font-normal">弦度</th>
              <th className="text-center py-1.5 px-1 text-[rgba(212,168,71,0.6)] font-normal">变化</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, i) => {
              const prevError = i > 0 ? records[i - 1].hourlyError : null;
              const errorDiff = prevError !== null ? record.hourlyError - prevError : null;
              const isImproved = errorDiff !== null && Math.abs(record.hourlyError) < Math.abs(prevError!);
              const isWorsened = errorDiff !== null && Math.abs(record.hourlyError) > Math.abs(prevError!);

              return (
                <tr
                  key={record.id}
                  className="border-b border-[rgba(212,168,71,0.06)] hover:bg-[rgba(212,168,71,0.04)] transition-colors"
                >
                  <td className="py-1.5 pr-2 text-[rgba(245,240,232,0.5)]">{i + 1}</td>
                  <td className={`py-1.5 px-1 text-right font-mono ${Math.abs(record.hourlyError) < 1 ? 'text-emerald-400' : Math.abs(record.hourlyError) > 5 ? 'text-[#C44536]' : 'text-[#F5F0E8]'}`}>
                    {record.hourlyError > 0 ? '+' : ''}{record.hourlyError.toFixed(1)}
                  </td>
                  <td className="py-1.5 px-1 text-right text-[rgba(245,240,232,0.6)] font-mono">
                    {record.pendulumLength.toFixed(1)}
                  </td>
                  <td className="py-1.5 px-1 text-right text-[rgba(245,240,232,0.6)] font-mono">
                    {record.escapementPosition.toFixed(1)}°
                  </td>
                  <td className="py-1.5 px-1 text-right text-[rgba(245,240,232,0.6)] font-mono">
                    {record.windingDegree}%
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    {errorDiff !== null ? (
                      <span
                        className={`text-[10px] font-mono ${
                          isImproved ? 'text-emerald-400' : isWorsened ? 'text-[#C44536]' : 'text-[rgba(245,240,232,0.4)]'
                        }`}
                      >
                        {isImproved ? '↓' : isWorsened ? '↑' : '→'}
                        {Math.abs(errorDiff).toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-[rgba(245,240,232,0.2)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {records.length >= 2 && (
        <div className="mt-3 pt-3 border-t border-[rgba(212,168,71,0.1)]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[rgba(245,240,232,0.4)]">误差变化趋势</span>
            <span className={`font-mono ${
              Math.abs(records[records.length - 1].hourlyError) < Math.abs(records[0].hourlyError)
                ? 'text-emerald-400'
                : Math.abs(records[records.length - 1].hourlyError) > Math.abs(records[0].hourlyError)
                ? 'text-[#C44536]'
                : 'text-[rgba(245,240,232,0.5)]'
            }`}>
              {Math.abs(records[records.length - 1].hourlyError) < Math.abs(records[0].hourlyError)
                ? '改善中 ✓'
                : Math.abs(records[records.length - 1].hourlyError) > Math.abs(records[0].hourlyError)
                ? '恶化中 ✗'
                : '无变化 —'}
            </span>
          </div>

          <div className="mt-2 flex items-end gap-[2px] h-8">
            {records.map((record, i) => {
              const maxErr = Math.max(...records.map((r) => Math.abs(r.hourlyError)), 1);
              const height = Math.max(4, (Math.abs(record.hourlyError) / maxErr) * 100);
              const isLast = i === records.length - 1;
              return (
                <div
                  key={record.id}
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${height}%`,
                    backgroundColor: isLast
                      ? '#D4A847'
                      : 'rgba(212,168,71,0.25)',
                    minWidth: 4,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {records.length > 0 && records[records.length - 1].note && (
        <div className="mt-2 px-2 py-1.5 rounded bg-[rgba(212,168,71,0.06)] text-[11px] text-[rgba(245,240,232,0.5)]">
          💡 {records[records.length - 1].note}
        </div>
      )}
    </div>
  );
}
