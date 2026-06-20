import { useState, useMemo } from 'react';
import { Header } from '../components/layout/Header';
import { useIssueStore } from '../stores/useIssueStore';
import { useMaintenanceStore } from '../stores/useMaintenanceStore';
import { calculateIceScore, getIssueTypeLabel, getSeverityColor, getSeverityLabel } from '../utils/severityCalc';
import { FileText, User, Calendar, Clock, AlertTriangle, Check, Download, Share2, Edit3 } from 'lucide-react';
import { mockShiftReports } from '../data/mockData';
import { cn } from '@/lib/utils';
import type { ShiftType } from '../types';

export default function ReportPage() {
  const { issues } = useIssueStore();
  const { session, completedSessions } = useMaintenanceStore();
  const [operatorName, setOperatorName] = useState('张师傅');
  const [notes, setNotes] = useState('');
  const [nextShiftNotes, setNextShiftNotes] = useState('');
  const [currentShift, setCurrentShift] = useState<ShiftType>('afternoon');
  const [isEditing, setIsEditing] = useState(false);

  const iceScore = calculateIceScore(issues);
  const unresolvedIssues = issues.filter((i) => !i.resolved);
  const resolvedIssues = issues.filter((i) => i.resolved);

  const lastMaintenance = session.status === 'completed' ? session : completedSessions[completedSessions.length - 1];
  const lastCoverage = lastMaintenance?.coveredArea ?? 0;
  const lastDuration = lastMaintenance && lastMaintenance.endTime && lastMaintenance.startTime
    ? Math.round((lastMaintenance.endTime - lastMaintenance.startTime) / 60000)
    : 0;
  const maintenanceCount = completedSessions.length;

  const issueStats = useMemo(() => {
    const stats = {
      groove: { total: 0, unresolved: 0 },
      water: { total: 0, unresolved: 0 },
      ice_debris: { total: 0, unresolved: 0 },
      closed_area: { total: 0, unresolved: 0 },
    };
    issues.forEach((issue) => {
      stats[issue.type].total++;
      if (!issue.resolved) stats[issue.type].unresolved++;
    });
    return stats;
  }, [issues]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 60) return '一般';
    return '较差';
  };

  const shiftLabels: Record<ShiftType, string> = {
    morning: '早班',
    afternoon: '中班',
    evening: '晚班',
  };

  const shiftTimes: Record<ShiftType, string> = {
    morning: '06:00 - 14:00',
    afternoon: '14:00 - 22:00',
    evening: '22:00 - 06:00',
  };

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (iceScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="交接报告" subtitle="班次工作交接与冰面状态摘要" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  冰面状态摘要
                </h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    导出
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-sm hover:bg-sky-400 transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    发送
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-700"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="url(#scoreGradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(iceScore)}`}>
                        {iceScore}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">{getScoreLabel(iceScore)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4">冰面健康评分</p>
                </div>

                <div className="col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatItem label="总问题数" value={issues.length.toString()} unit="个" />
                    <StatItem label="已解决" value={resolvedIssues.length.toString()} unit="个" color="text-emerald-400" />
                    <StatItem label="待处理" value={unresolvedIssues.length.toString()} unit="个" color="text-amber-400" />
                    <StatItem label="维护次数" value={maintenanceCount.toString()} unit="次" color="text-sky-400" />
                  </div>

                  <div className="pt-3 border-t border-slate-700/50 space-y-2">
                    <p className="text-sm text-slate-400 mb-1">最近一次维护</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/30 rounded-lg p-2">
                        <span className="text-lg font-bold text-sky-400 font-mono">{lastCoverage}%</span>
                        <p className="text-xs text-slate-500">覆盖率</p>
                      </div>
                      <div className="bg-slate-900/30 rounded-lg p-2">
                        <span className="text-lg font-bold text-emerald-400 font-mono">{lastDuration > 0 ? `${lastDuration}` : '--'}</span>
                        <p className="text-xs text-slate-500">时长 (分钟)</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">问题类型分布</p>
                    <div className="space-y-2">
                      {Object.entries(issueStats).map(([type, stat]) => (
                        <div key={type} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-16">{getIssueTypeLabel(type as any)}</span>
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full"
                              style={{ width: `${issues.length > 0 ? (stat.total / issues.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-300 w-16 text-right">
                            {stat.unresolved} / {stat.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                待处理问题清单
              </h3>

              {unresolvedIssues.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Check className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
                  <p>所有问题均已处理完毕</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unresolvedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center gap-4"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: getSeverityColor(issue.severity) + '20' }}
                      >
                        {issue.type === 'groove' && '⚡'}
                        {issue.type === 'water' && '💧'}
                        {issue.type === 'ice_debris' && '❄️'}
                        {issue.type === 'closed_area' && '🚫'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200">
                            {getIssueTypeLabel(issue.type)}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: getSeverityColor(issue.severity) + '20',
                              color: getSeverityColor(issue.severity),
                            }}
                          >
                            {getSeverityLabel(issue.severity)}
                          </span>
                        </div>
                        {issue.description && (
                          <p className="text-sm text-slate-400 mt-1">{issue.description}</p>
                        )}
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>位置 ({issue.x.toFixed(1)}, {issue.y.toFixed(1)})</p>
                        <p className="mt-1">{new Date(issue.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-400" />
                  班次信息
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sky-400 hover:text-sky-300 text-sm flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">值班人员</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border text-white text-sm',
                      isEditing
                        ? 'border-sky-500/50 focus:border-sky-400 focus:outline-none'
                        : 'border-slate-700/50 cursor-default'
                    )}
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-2">班次</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['morning', 'afternoon', 'evening'] as const).map((shift) => (
                      <button
                        key={shift}
                        onClick={() => isEditing && setCurrentShift(shift)}
                        className={cn(
                          'py-2 rounded-lg text-sm font-medium transition-all',
                          currentShift === shift
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700/50'
                        )}
                        disabled={!isEditing}
                      >
                        {shiftLabels[shift]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    {shiftTimes[currentShift]}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                本班次记录
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">工作备注</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="记录本班次的工作内容和注意事项..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white text-sm resize-none focus:border-sky-500/50 focus:outline-none placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-2">交接给下一班</label>
                  <textarea
                    value={nextShiftNotes}
                    onChange={(e) => setNextShiftNotes(e.target.value)}
                    placeholder="需要下一班次注意的事项..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white text-sm resize-none focus:border-sky-500/50 focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              确认交接
            </button>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            历史交接记录
          </h3>

          <div className="space-y-3">
            {mockShiftReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center gap-4 hover:border-slate-600/50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {shiftLabels[report.shift]} · {report.operatorName}
                    </span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                      {report.date}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-1">{report.notes}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={cn('text-2xl font-bold font-mono', getScoreColor(report.iceConditionScore))}>
                    {report.iceConditionScore}
                  </div>
                  <p className="text-xs text-slate-500">冰面评分</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, unit, color = 'text-white' }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <div className="bg-slate-900/30 rounded-xl p-3">
      <div className="flex items-baseline gap-1">
        <span className={cn('text-xl font-bold font-mono', color)}>{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
