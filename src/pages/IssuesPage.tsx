import { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  MapPinOff,
  CheckCircle2,
  Clock,
  X,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { IssueType } from '@/types';

type FilterType = 'all' | 'unresolved' | 'resolved';

export default function IssuesPage() {
  const { getIssues, resolveIssue } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('unresolved');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const allIssues = getIssues();

  const filteredIssues = allIssues.filter((issue) => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !issue.resolved;
    if (filter === 'resolved') return issue.resolved;
    return true;
  });

  const unresolvedCount = allIssues.filter((i) => !i.resolved).length;
  const resolvedCount = allIssues.filter((i) => i.resolved).length;

  const issueTypeConfig: Record<
    IssueType,
    { label: string; icon: typeof AlertOctagon; color: string; bgColor: string }
  > = {
    lost: {
      label: '道具遗失',
      icon: AlertOctagon,
      color: 'text-neon-red',
      bgColor: 'bg-neon-red/10 border-neon-red/30',
    },
    damaged: {
      label: '道具损坏',
      icon: AlertCircle,
      color: 'text-neon-yellow',
      bgColor: 'bg-neon-yellow/10 border-neon-yellow/30',
    },
    wrong_position: {
      label: '位置错误',
      icon: MapPinOff,
      color: 'text-neon-blue',
      bgColor: 'bg-neon-blue/10 border-neon-blue/30',
    },
  };

  const handleResolve = (issueId: string) => {
    if (resolutionText.trim()) {
      resolveIssue(issueId, resolutionText);
      setResolvingId(null);
      setResolutionText('');
    }
  };

  const cancelResolve = () => {
    setResolvingId(null);
    setResolutionText('');
  };

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: allIssues.length },
    { key: 'unresolved', label: '待处理', count: unresolvedCount },
    { key: 'resolved', label: '已解决', count: resolvedCount },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stage-text tracking-wide flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-neon-red" />
            问题记录
          </h1>
          <p className="text-lg text-stage-text-secondary mt-2">
            所有道具问题记录及处理状态
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-stage-text-secondary">总问题数</span>
            <AlertTriangle className="w-6 h-6 text-stage-text-muted" />
          </div>
          <div className="text-4xl font-bold text-stage-text">
            {allIssues.length}
          </div>
        </div>
        <div className="bg-stage-bg-card rounded-2xl border border-neon-red/30 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-neon-red/70">待处理</span>
            <Clock className="w-6 h-6 text-neon-red" />
          </div>
          <div className="text-4xl font-bold text-neon-red">
            {unresolvedCount}
          </div>
        </div>
        <div className="bg-stage-bg-card rounded-2xl border border-neon-green/30 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-neon-green/70">已解决</span>
            <CheckCircle2 className="w-6 h-6 text-neon-green" />
          </div>
          <div className="text-4xl font-bold text-neon-green">
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-stage-text-secondary" />
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-base font-medium transition-all ${
                filter === f.key
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                  : 'bg-stage-bg-card text-stage-text-secondary border border-stage-border hover:border-stage-text-muted'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* 问题列表 */}
      <div className="space-y-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => {
            const config = issueTypeConfig[issue.type];
            const Icon = config.icon;
            const isResolving = resolvingId === issue.id;

            return (
              <div
                key={issue.id}
                className={`rounded-2xl border-2 p-6 transition-all ${
                  issue.resolved
                    ? 'border-stage-border bg-stage-bg-card/50 opacity-70'
                    : `${config.bgColor} border-opacity-50`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        issue.resolved
                          ? 'bg-stage-bg-hover text-stage-text-muted'
                          : config.bgColor
                      }`}
                    >
                      <Icon
                        className={`w-7 h-7 ${
                          issue.resolved ? '' : config.color
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-stage-text">
                          {issue.prop.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            issue.resolved
                              ? 'bg-stage-bg-hover text-stage-text-muted'
                              : `${config.bgColor} ${config.color}`
                          }`}
                        >
                          {config.label}
                        </span>
                        {issue.resolved && (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-neon-green/10 text-neon-green">
                            已解决
                          </span>
                        )}
                      </div>
                      <p className="text-base text-stage-text-secondary mb-3">
                        {issue.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-stage-text-muted">
                        <span>场次：{issue.sceneName}</span>
                        <span>Cue：{issue.cueNumber}</span>
                        <span>
                          报告时间：
                          {new Date(issue.reportedAt).toLocaleString(
                            'zh-CN'
                          )}
                        </span>
                      </div>

                      {/* 解决方案 */}
                      {issue.resolved && issue.resolution && (
                        <div className="mt-4 p-4 bg-neon-green/5 rounded-xl border border-neon-green/20">
                          <div className="text-sm text-neon-green/70 mb-1">
                            解决方案：
                          </div>
                          <div className="text-base text-neon-green">
                            {issue.resolution}
                          </div>
                          {issue.resolvedAt && (
                            <div className="text-sm text-stage-text-muted mt-2">
                              解决时间：
                              {new Date(issue.resolvedAt).toLocaleString(
                                'zh-CN'
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  {!issue.resolved && !isResolving && (
                    <button
                      onClick={() => setResolvingId(issue.id)}
                      className="px-5 py-2.5 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green font-medium hover:bg-neon-green hover:text-black transition-all text-base"
                    >
                      标记已解决
                    </button>
                  )}
                </div>

                {/* 解决输入框 */}
                {isResolving && (
                  <div className="mt-5 p-5 bg-stage-bg-secondary rounded-xl border border-neon-green/30 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-medium text-neon-green">
                        填写解决方案
                      </span>
                      <button
                        onClick={cancelResolve}
                        className="text-stage-text-muted hover:text-stage-text"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <textarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="请描述解决方案..."
                      className="w-full p-4 bg-stage-bg-card border border-stage-border rounded-xl text-stage-text placeholder-stage-text-muted resize-none focus:border-neon-green/50 focus:outline-none text-base"
                      rows={3}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={cancelResolve}
                        className="px-5 py-2.5 rounded-lg border border-stage-border text-stage-text-secondary hover:bg-stage-bg-hover text-base"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleResolve(issue.id)}
                        disabled={!resolutionText.trim()}
                        className="px-5 py-2.5 rounded-lg bg-neon-green text-black font-medium hover:bg-neon-green-dim text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        确认解决
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-stage-bg-hover mx-auto mb-6 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-neon-green" />
            </div>
            <h3 className="text-xl font-bold text-stage-text mb-2">
              暂无问题记录
            </h3>
            <p className="text-base text-stage-text-secondary">
              {filter === 'resolved'
                ? '还没有已解决的问题'
                : filter === 'unresolved'
                ? '太棒了！当前没有待处理的问题'
                : '所有道具运行正常，没有问题记录'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
