import { AlertTriangle, Check, Trash2, Clock } from 'lucide-react';
import { useIssueStore } from '../../stores/useIssueStore';
import { getIssueTypeLabel, getSeverityLabel, getSeverityColor, sortIssuesByPriority } from '../../utils/severityCalc';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function IssueList() {
  const { issues, resolveIssue, removeIssue, clearResolved } = useIssueStore();
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !issue.resolved;
    return issue.resolved;
  });

  const sortedIssues = sortIssuesByPriority(filteredIssues);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 60) return `${minutes}分钟前`;
    return `${hours}小时前`;
  };

  const typeIcons: Record<string, string> = {
    groove: '⚡',
    water: '💧',
    ice_debris: '❄️',
    closed_area: '🚫',
  };

  const unresolvedCount = issues.filter((i) => !i.resolved).length;
  const highPriorityCount = issues.filter((i) => !i.resolved && i.severity === 'high').length;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex flex-col h-full">
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            问题标记
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
              {unresolvedCount} 待处理
            </span>
            {highPriorityCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                {highPriorityCount} 高危
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
          {(['unresolved', 'resolved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 text-xs py-1.5 rounded-md font-medium transition-all',
                filter === f
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              {f === 'unresolved' ? '待处理' : f === 'resolved' ? '已解决' : '全部'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {sortedIssues.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            暂无{filter === 'unresolved' ? '待处理' : filter === 'resolved' ? '已解决' : ''}问题
          </div>
        ) : (
          sortedIssues.map((issue) => (
            <div
              key={issue.id}
              className={cn(
                'p-3 rounded-xl border transition-all hover:border-slate-600',
                issue.resolved
                  ? 'bg-slate-900/30 border-slate-800 opacity-60'
                  : 'bg-slate-900/50 border-slate-700/50'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: getSeverityColor(issue.severity) + '30' }}
                >
                  {typeIcons[issue.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                  {issue.description && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{issue.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(issue.createdAt)}
                    <span className="mx-1">·</span>
                    位置: ({issue.x.toFixed(1)}, {issue.y.toFixed(1)})
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {!issue.resolved ? (
                  <button
                    onClick={() => resolveIssue(issue.id)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1 font-medium"
                  >
                    <Check className="w-3.5 h-3.5" />
                    标记解决
                  </button>
                ) : null}
                <button
                  onClick={() => removeIssue(issue.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={clearResolved}
          className="w-full text-xs text-slate-500 hover:text-slate-400 py-2 transition-colors"
        >
          清除已解决的问题
        </button>
      </div>
    </div>
  );
}
