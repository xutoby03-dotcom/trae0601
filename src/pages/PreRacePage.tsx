import { useState, useMemo } from 'react';
import { Header } from '../components/layout/Header';
import { useIssueStore } from '../stores/useIssueStore';
import { iceRinkConfig } from '../data/mockData';
import { sortIssuesByPriority, getSeverityColor, getIssueTypeLabel, getSeverityLabel, calculatePriority } from '../utils/severityCalc';
import { IssueMarkerDot } from '../components/ice-rink/IssueMarkerDot';
import { Flag, AlertTriangle, Check, Clock, Shield, Target, Zap, Droplets, Snowflake, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IssueMarker } from '../types';

const SCALE = 10;

const checklistItems = [
  { id: 'ice', label: '冰面整体平整度检查', category: '冰面' },
  { id: 'grooves', label: '起槽区域处理', category: '冰面' },
  { id: 'water', label: '积水区域处理', category: '冰面' },
  { id: 'debris', label: '门口碎冰清理', category: '安全' },
  { id: 'closed', label: '临时封区标识', category: '安全' },
  { id: 'edges', label: '冰场边角检查', category: '冰面' },
  { id: 'boards', label: '护板稳固性检查', category: '安全' },
  { id: 'zamboni', label: '磨冰车状态确认', category: '设备' },
];

export default function PreRacePage() {
  const { issues, resolveIssue } = useIssueStore();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const unresolvedIssues = issues.filter((i) => !i.resolved);
  const sortedIssues = sortIssuesByPriority(unresolvedIssues, true);

  const criticalTypes = new Set(['groove', 'water', 'closed_area']);
  const criticalIssues = unresolvedIssues.filter(
    (i) => i.severity === 'high' && criticalTypes.has(i.type)
  );
  const normalIssues = unresolvedIssues.filter(
    (i) => !(i.severity === 'high' && criticalTypes.has(i.type))
  );
  const topCritical = criticalIssues[0] || sortedIssues[0];

  const filteredIssues = useMemo(() => {
    if (filter === 'all') return sortedIssues;
    return sortedIssues.filter((i) => i.severity === filter);
  }, [sortedIssues, filter]);

  const highPriorityCount = unresolvedIssues.filter((i) => i.severity === 'high').length;
  const mediumPriorityCount = unresolvedIssues.filter((i) => i.severity === 'medium').length;
  const lowPriorityCount = unresolvedIssues.filter((i) => i.severity === 'low').length;

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const checklistProgress = (checkedCount / checklistItems.length) * 100;

  const width = iceRinkConfig.width * SCALE;
  const height = iceRinkConfig.height * SCALE;

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const typeIcons: Record<string, React.ReactNode> = {
    groove: <Zap className="w-4 h-4" />,
    water: <Droplets className="w-4 h-4" />,
    ice_debris: <Snowflake className="w-4 h-4" />,
    closed_area: <Ban className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="赛前模式" subtitle="重点检视危险点，确保比赛安全" />

      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 border border-red-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center animate-pulse">
                <Flag className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  赛前安全检查
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                    进行中
                  </span>
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  还有 {unresolvedIssues.length} 个待处理问题，{checklistItems.length - checkedCount} 项检查未完成
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-400 font-mono">
                {unresolvedIssues.length}
              </div>
              <p className="text-sm text-slate-400">危险点总数</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <DangerStat
            label="高危"
            value={highPriorityCount}
            color="text-red-400"
            bg="bg-red-500/10"
            border="border-red-500/30"
            icon={<AlertTriangle className="w-5 h-5" />}
            pulse={highPriorityCount > 0}
          />
          <DangerStat
            label="中危"
            value={mediumPriorityCount}
            color="text-amber-400"
            bg="bg-amber-500/10"
            border="border-amber-500/30"
            icon={<AlertTriangle className="w-5 h-5" />}
            pulse={mediumPriorityCount > 0}
          />
          <DangerStat
            label="低危"
            value={lowPriorityCount}
            color="text-emerald-400"
            bg="bg-emerald-500/10"
            border="border-emerald-500/30"
            icon={<Shield className="w-5 h-5" />}
            pulse={false}
          />
          <DangerStat
            label="检查进度"
            value={`${Math.round(checklistProgress)}%`}
            color="text-sky-400"
            bg="bg-sky-500/10"
            border="border-sky-500/30"
            icon={<Target className="w-5 h-5" />}
            pulse={false}
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" />
                  危险点地图
                </h3>
                <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
                  {(['all', 'high', 'medium', 'low'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        'px-3 py-1 text-xs rounded-md font-medium transition-all',
                        filter === f
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-slate-300'
                      )}
                    >
                      {f === 'all' ? '全部' : f === 'high' ? '高危' : f === 'medium' ? '中危' : '低危'}
                    </button>
                  ))}
                </div>
              </div>

              {criticalIssues.length > 0 && (
                <div className="mb-4 rounded-xl bg-red-500/15 border border-red-500/40 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-red-300 mb-2">
                        关键风险 · 赛前必须处理 ({criticalIssues.length} 处)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {criticalIssues.slice(0, 5).map((issue, idx) => (
                          <span
                            key={issue.id}
                            onClick={() => setSelectedIssue(issue.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/30 border border-red-500/50 text-red-200 text-xs font-medium cursor-pointer hover:bg-red-500/50 transition-colors"
                          >
                            <span>{idx + 1}.</span>
                            <span>{getIssueTypeLabel(issue.type)}</span>
                            <span className="text-red-300/80">
                              ({issue.x.toFixed(0)}, {issue.y.toFixed(0)})
                            </span>
                          </span>
                        ))}
                        {criticalIssues.length > 5 && (
                          <span className="text-xs text-red-300/70 self-center px-2">
                            +{criticalIssues.length - 5} 处
                          </span>
                        )}
                      </div>
                      {topCritical && (
                        <p className="mt-3 text-xs text-red-200/90 bg-red-500/10 rounded-md px-3 py-2 inline-block">
                          <span className="text-red-300 font-semibold">优先处理：</span>
                          {getIssueTypeLabel(topCritical.type)}
                          {topCritical.description ? ` · ${topCritical.description}` : ''}
                          <span className="text-red-300/80"> · 位置 ({topCritical.x.toFixed(1)}, {topCritical.y.toFixed(1)})</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_60%)] pointer-events-none" />

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                  <defs>
                    <linearGradient id="iceGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                  </defs>

                  <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    rx={SCALE * 2}
                    ry={SCALE * 2}
                    fill="url(#iceGradient2)"
                    stroke="#ef4444"
                    strokeWidth={3}
                    opacity={0.8}
                  />

                  <g stroke="rgba(239, 68, 68, 0.2)" strokeWidth={1} fill="none">
                    <circle cx={width / 2} cy={height / 2} r={SCALE * 4.5} strokeDasharray="5,5" />
                    <line x1={width / 2} y1={0} x2={width / 2} y2={height} strokeDasharray="10,5" />
                  </g>

                  {filter !== 'high' &&
                    normalIssues
                      .filter((i) => filter === 'all' || i.severity === filter)
                      .map((issue) => (
                        <IssueMarkerDot
                          key={issue.id}
                          issue={issue}
                          scale={SCALE}
                          selected={selectedIssue === issue.id}
                          onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                          pulse={true}
                          critical={false}
                        />
                      ))}

                  {(filter === 'all' || filter === 'high') &&
                    criticalIssues.map((issue) => (
                      <IssueMarkerDot
                        key={`crit-${issue.id}`}
                        issue={issue}
                        scale={SCALE}
                        selected={selectedIssue === issue.id}
                        onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                        pulse={true}
                        critical={true}
                      />
                    ))}
                </svg>

                {selectedIssue && (
                  <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 border border-slate-600 w-64 shadow-xl">
                    {(() => {
                      const issue = issues.find((i) => i.id === selectedIssue);
                      if (!issue) return null;
                      return (
                        <SelectedIssueDetail
                          issue={issue}
                          onResolve={() => {
                            resolveIssue(issue.id);
                            setSelectedIssue(null);
                          }}
                        />
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                优先级排序
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredIssues.map((issue, index) => (
                  <PriorityIssueCard
                    key={issue.id}
                    issue={issue}
                    rank={index + 1}
                    selected={selectedIssue === issue.id}
                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    onResolve={() => resolveIssue(issue.id)}
                  />
                ))}
                {filteredIssues.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    没有待处理问题
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              赛前检查清单
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
              <span className="text-sm text-slate-400">
                {checkedCount}/{checklistItems.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {checklistItems.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all group',
                  checkedItems[item.id]
                    ? 'bg-emerald-500/20 border-emerald-500/50'
                    : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      checkedItems[item.id]
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-500 group-hover:border-slate-400'
                    )}
                  >
                    {checkedItems[item.id] && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        checkedItems[item.id] ? 'text-emerald-300 line-through' : 'text-slate-200'
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DangerStat({
  label,
  value,
  color,
  bg,
  border,
  icon,
  pulse,
}: {
  label: string;
  value: number | string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <div className={cn('rounded-2xl p-4 border', bg, border)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <div className={cn(color, pulse && 'animate-pulse')}>{icon}</div>
      </div>
      <div className={cn('text-2xl font-bold font-mono', color)}>{value}</div>
    </div>
  );
}

function PriorityIssueCard({
  issue,
  rank,
  selected,
  onClick,
  onResolve,
}: {
  issue: IssueMarker;
  rank: number;
  selected: boolean;
  onClick: () => void;
  onResolve: () => void;
}) {
  const priority = calculatePriority(issue, true);

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-xl border cursor-pointer transition-all',
        selected
          ? 'bg-slate-700/50 border-sky-500/50'
          : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: getSeverityColor(issue.severity) }}
        >
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200 text-sm">
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
          <p className="text-xs text-slate-500 mt-1 truncate">
            {issue.description || '点击查看详情'}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResolve();
          }}
          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          优先级 {priority.toFixed(1)}
        </div>
        <span className="text-xs text-slate-500">
          位置 ({issue.x.toFixed(1)}, {issue.y.toFixed(1)})
        </span>
      </div>
    </div>
  );
}

function SelectedIssueDetail({ issue, onResolve }: { issue: IssueMarker; onResolve: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: getSeverityColor(issue.severity) + '30' }}
        >
          {issue.type === 'groove' && <Zap className="w-5 h-5" style={{ color: getSeverityColor(issue.severity) }} />}
          {issue.type === 'water' && <Droplets className="w-5 h-5" style={{ color: getSeverityColor(issue.severity) }} />}
          {issue.type === 'ice_debris' && <Snowflake className="w-5 h-5" style={{ color: getSeverityColor(issue.severity) }} />}
          {issue.type === 'closed_area' && <Ban className="w-5 h-5" style={{ color: getSeverityColor(issue.severity) }} />}
        </div>
        <div>
          <p className="font-semibold text-white">{getIssueTypeLabel(issue.type)}</p>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{
              backgroundColor: getSeverityColor(issue.severity) + '20',
              color: getSeverityColor(issue.severity),
            }}
          >
            {getSeverityLabel(issue.severity)}优先级
          </span>
        </div>
      </div>
      {issue.description && (
        <p className="text-sm text-slate-300 mb-3">{issue.description}</p>
      )}
      <div className="text-xs text-slate-400 space-y-1 mb-4">
        <p>位置：({issue.x.toFixed(1)}m, {issue.y.toFixed(1)}m)</p>
        <p>记录时间：{new Date(issue.createdAt).toLocaleTimeString()}</p>
      </div>
      <button
        onClick={onResolve}
        className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4" />
        标记为已处理
      </button>
    </div>
  );
}
