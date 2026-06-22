import { useState } from 'react';
import { FileText, Printer, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { StabilityReport as StabilityReportType } from '@/types/calibration';
import { ANOMALY_LABELS, ANOMALY_COLORS } from '@/types/calibration';

interface StabilityReportProps {
  report: StabilityReportType | null;
  onGenerate: () => void;
  onReset: () => void;
  recordCount: number;
}

export default function StabilityReport({ report, onGenerate, onReset, recordCount }: StabilityReportProps) {
  const [showReport, setShowReport] = useState(false);

  const handleGenerate = () => {
    onGenerate();
    setShowReport(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!showReport || !report) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-[#D4A847]" />
          <h3 className="text-sm font-serif text-[#D4A847] tracking-widest">走时稳定报告</h3>
        </div>

        <p className="text-xs text-[rgba(245,240,232,0.4)] leading-relaxed">
          完成所有微调后，生成走时稳定性报告。报告将包含误差趋势、稳定性评分和交付建议。
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={recordCount === 0}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#8B6914] to-[#D4A847] text-[#1A1612] font-serif text-xs font-semibold tracking-wider hover:from-[#D4A847] hover:to-[#8B6914] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            生成报告
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg border border-[rgba(212,168,71,0.2)] text-[rgba(212,168,71,0.6)] hover:bg-[rgba(212,168,71,0.08)] transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    );
  }

  const scoreColor =
    report.stabilityScore >= 80
      ? '#4CAF50'
      : report.stabilityScore >= 60
      ? '#D4A847'
      : report.stabilityScore >= 40
      ? '#E8943A'
      : '#C44536';

  const pieData = [
    { name: '稳定', value: report.stabilityScore },
    { name: '偏差', value: 100 - report.stabilityScore },
  ];
  const PIE_COLORS = [scoreColor, 'rgba(245,240,232,0.08)'];

  const trendData = report.recordSummaries.map((s, i) => ({
    name: `#${i + 1}`,
    error: s.hourlyError,
  }));

  const anomalyEntries = Object.entries(report.anomalyBreakdown).filter(([, count]) => count > 0);

  return (
    <div className="space-y-4 print:text-black print:bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[#D4A847]" />
          <h3 className="text-sm font-serif text-[#D4A847] tracking-widest">走时稳定报告</h3>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[rgba(212,168,71,0.6)] border border-[rgba(212,168,71,0.15)] hover:bg-[rgba(212,168,71,0.08)] transition-colors"
        >
          <Printer size={10} /> 打印
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={40}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {pieData.map((_entry, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-2">
            <div className="text-2xl font-serif font-bold" style={{ color: scoreColor }}>
              {report.stabilityScore}
            </div>
            <div className="text-[10px] text-[rgba(245,240,232,0.4)]">稳定评分</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-[rgba(245,240,232,0.4)]">平均误差</span>
            <span className="text-[#F5F0E8] font-mono">{report.averageError}s/h</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[rgba(245,240,232,0.4)]">最大误差</span>
            <span className="text-[#C44536] font-mono">{report.maxError}s/h</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[rgba(245,240,232,0.4)]">最小误差</span>
            <span className="text-emerald-400 font-mono">{report.minError}s/h</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[rgba(245,240,232,0.4)]">趋势</span>
            <span
              className={`font-mono ${
                report.errorTrend === 'improving'
                  ? 'text-emerald-400'
                  : report.errorTrend === 'worsening'
                  ? 'text-[#C44536]'
                  : 'text-[#D4A847]'
              }`}
            >
              {report.errorTrend === 'improving'
                ? '改善 ↓'
                : report.errorTrend === 'worsening'
                ? '恶化 ↑'
                : '稳定 →'}
            </span>
          </div>
        </div>
      </div>

      {report.totalAnomalies > 0 && (
        <div className="p-3 rounded-lg border border-[rgba(212,168,71,0.12)] bg-[rgba(212,168,71,0.04)]">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-[#C44536]" />
            <span className="text-[11px] font-semibold text-[#C44536]">异常检测汇总</span>
            <span className="ml-auto text-[10px] text-[rgba(245,240,232,0.4)] font-mono">
              共 {report.totalAnomalies} 项
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {anomalyEntries.map(([type, count]) => {
              const color = ANOMALY_COLORS[type as keyof typeof ANOMALY_COLORS];
              return (
                <div
                  key={type}
                  className="flex items-center justify-between px-2 py-1.5 rounded"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px]" style={{ color }}>
                      {ANOMALY_LABELS[type as keyof typeof ANOMALY_LABELS]}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#F5F0E8]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {trendData.length >= 2 && (
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,71,0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(245,240,232,0.3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(245,240,232,0.3)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1612',
                  border: '1px solid rgba(212,168,71,0.3)',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                labelStyle={{ color: '#D4A847' }}
              />
              <Line
                type="monotone"
                dataKey="error"
                stroke="#D4A847"
                strokeWidth={2}
                dot={{ fill: '#D4A847', r: 3 }}
                activeDot={{ r: 5, fill: '#D4A847' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {report.recordSummaries.length >= 2 && (
        <div className="rounded-lg border border-[rgba(212,168,71,0.12)] overflow-hidden">
          <div className="px-3 py-2 bg-[rgba(212,168,71,0.04)] border-b border-[rgba(212,168,71,0.12)]">
            <span className="text-[11px] font-serif text-[#D4A847] tracking-wide">调校前后误差对比</span>
          </div>
          <div className="max-h-[140px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-[#1A1612]">
                <tr className="text-[rgba(245,240,232,0.35)]">
                  <th className="text-left py-1.5 px-2 font-normal">次序</th>
                  <th className="text-right py-1.5 px-2 font-normal">上次误差</th>
                  <th className="text-right py-1.5 px-2 font-normal">当前误差</th>
                  <th className="text-right py-1.5 px-2 font-normal">变化</th>
                </tr>
              </thead>
              <tbody>
                {report.recordSummaries.slice(1).map((summary, i) => {
                  const prevError = report.recordSummaries[i].hourlyError;
                  const currError = summary.hourlyError;
                  const diff = currError - prevError;
                  const absImproved = Math.abs(currError) < Math.abs(prevError);
                  const absWorsened = Math.abs(currError) > Math.abs(prevError);
                  const diffColor = absImproved
                    ? 'text-emerald-400'
                    : absWorsened
                    ? 'text-[#C44536]'
                    : 'text-[rgba(245,240,232,0.35)]';

                  return (
                    <tr
                      key={summary.recordId}
                      className="border-t border-[rgba(212,168,71,0.06)] hover:bg-[rgba(212,168,71,0.04)] transition-colors"
                    >
                      <td className="py-1.5 px-2 text-[rgba(245,240,232,0.45)]">
                        第{i + 2}次微调
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-[rgba(245,240,232,0.5)]">
                        {prevError > 0 ? '+' : ''}{prevError.toFixed(1)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-[#F5F0E8]">
                        {currError > 0 ? '+' : ''}{currError.toFixed(1)}
                      </td>
                      <td className={`py-1.5 px-2 text-right font-mono font-medium ${diffColor}`}>
                        {absImproved ? '↓' : absWorsened ? '↑' : '→'}
                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="p-3 rounded-lg bg-[rgba(212,168,71,0.06)] border border-[rgba(212,168,71,0.12)]">
        <p className="text-xs text-[#F5F0E8] leading-relaxed font-serif">
          {report.conclusion}
        </p>
        <p className="text-[10px] text-[rgba(245,240,232,0.25)] mt-2">
          生成时间：{new Date(report.generatedAt).toLocaleString('zh-CN')}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowReport(false)}
          className="flex-1 py-2 rounded-lg border border-[rgba(212,168,71,0.2)] text-[rgba(212,168,71,0.6)] text-xs hover:bg-[rgba(212,168,71,0.08)] transition-colors"
        >
          返回继续调校
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2 rounded-lg border border-[rgba(212,168,71,0.2)] text-[rgba(212,168,71,0.6)] hover:bg-[rgba(212,168,71,0.08)] transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
