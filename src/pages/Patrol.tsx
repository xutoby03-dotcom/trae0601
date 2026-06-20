import React, { useState } from 'react';
import { WallMap } from '@/components/WallMap';
import { IssueModal } from '@/components/IssueModal';
import { useHoldStore, useRouteStore } from '@/store';
import type { Hold } from '@/types';
import { ISSUE_TYPE_LABELS, SEVERITY_LABELS } from '@/data/mockData';
import { formatDateTime, cn } from '@/utils/helpers';
import { AlertTriangle, Search, CheckCircle, Clock, Filter } from 'lucide-react';

export const PatrolPage: React.FC = () => {
  const {
    holds,
    issues,
    selectedHoldId,
    setSelectedHold,
    showIssueModal,
    setShowIssueModal,
    getHoldById,
    getUnresolvedIssues,
    resolveIssue,
  } = useHoldStore();
  const { getRouteById } = useRouteStore();

  const [selectedHold, setSelectedHoldState] = useState<Hold | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);

  const unresolvedIssues = getUnresolvedIssues();
  const resolvedIssues = issues.filter((i) => i.resolved);
  const displayIssues = showResolved
    ? issues
    : unresolvedIssues;

  const filteredIssues = displayIssues.filter((issue) => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  const handleHoldClick = (hold: Hold) => {
    setSelectedHold(hold.id);
    setSelectedHoldState(hold);
    setShowIssueModal(true);
  };

  const handleResolve = (issueId: string) => {
    resolveIssue(issueId);
  };

  const selectedHoldData = selectedHoldId ? getHoldById(selectedHoldId) : null;

  const severityColors: Record<string, string> = {
    low: 'text-green-400 bg-green-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    high: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div>
          <h1 className="text-xl font-bold text-white">巡场记录</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            点击墙面岩点记录问题
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{unresolvedIssues.length}</div>
              <div className="text-xs text-slate-500">待解决</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{resolvedIssues.length}</div>
              <div className="text-xs text-slate-500">已解决</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="h-full min-h-[500px]">
            <WallMap
              mode="patrol"
              onHoldClick={handleHoldClick}
              highlightRouteId={null}
              showGrid={true}
            />
          </div>
        </div>

        <aside className="w-96 border-l border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-400" />
              <h2 className="font-semibold text-white">问题记录</h2>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer"
                >
                  <option value="all">全部严重程度</option>
                  <option value="high">严重</option>
                  <option value="medium">中等</option>
                  <option value="low">轻微</option>
                </select>
              </div>
              <button
                onClick={() => setShowResolved(!showResolved)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  showResolved
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                )}
              >
                {showResolved ? '显示全部' : '只看待解决'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">暂无问题记录</p>
                <p className="text-xs mt-1">点击墙面岩点开始记录</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const hold = getHoldById(issue.holdId);
                const route = issue.routeId ? getRouteById(issue.routeId) : null;

                return (
                  <div
                    key={issue.id}
                    className={cn(
                      'p-3 rounded-xl border transition-all',
                      issue.resolved
                        ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            severityColors[issue.severity]
                          )}
                        >
                          {SEVERITY_LABELS[issue.severity]}
                        </span>
                        <span className="text-sm text-white font-medium">
                          {ISSUE_TYPE_LABELS[issue.type]}
                        </span>
                      </div>
                      {!issue.resolved && (
                        <button
                          onClick={() => handleResolve(issue.id)}
                          className="text-xs text-green-400 hover:text-green-300 font-medium"
                        >
                          标记解决
                        </button>
                      )}
                      {issue.resolved && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle size={12} />
                          已解决
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 mb-2">{issue.note || '无备注'}</p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        {route && (
                          <span
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{ backgroundColor: route.color + '20', color: route.color }}
                          >
                            {route.name}
                          </span>
                        )}
                        <span>岩点 #{issue.holdId.replace('hold-', '')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatDateTime(issue.createdAt)}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 mt-1.5 pt-2 border-t border-slate-700/30">
                      记录人：{issue.reporter}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      <IssueModal
        isOpen={showIssueModal}
        onClose={() => {
          setShowIssueModal(false);
          setSelectedHold(null);
        }}
        hold={selectedHoldData}
      />
    </div>
  );
};
