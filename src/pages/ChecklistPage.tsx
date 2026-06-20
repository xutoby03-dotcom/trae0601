import { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  MapPinOff,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { Priority, IssueType } from '@/types';

export default function ChecklistPage() {
  const { getChecklist, toggleCheckItem, addNoteToCheckItem, generateChecklist } =
    useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  const checklist = getChecklist();

  const filteredChecklist = checklist.filter((item) => {
    if (priorityFilter === 'all') return true;
    return item.priority === priorityFilter;
  });

  const checkedCount = checklist.filter((i) => i.checked).length;
  const totalCount = checklist.length;
  const highPriorityCount = checklist.filter(
    (i) => i.priority === 'high' && !i.checked
  ).length;
  const mediumPriorityCount = checklist.filter(
    (i) => i.priority === 'medium' && !i.checked
  ).length;
  const lowPriorityCount = checklist.filter(
    (i) => i.priority === 'low' && !i.checked
  ).length;

  const priorityConfig: Record<
    Priority,
    { label: string; color: string; bgColor: string; borderColor: string }
  > = {
    high: {
      label: '高优先级',
      color: 'text-neon-red',
      bgColor: 'bg-neon-red/10',
      borderColor: 'border-neon-red/30',
    },
    medium: {
      label: '中优先级',
      color: 'text-neon-yellow',
      bgColor: 'bg-neon-yellow/10',
      borderColor: 'border-neon-yellow/30',
    },
    low: {
      label: '低优先级',
      color: 'text-neon-blue',
      bgColor: 'bg-neon-blue/10',
      borderColor: 'border-neon-blue/30',
    },
  };

  const issueTypeIcons: Record<IssueType, typeof AlertTriangle> = {
    lost: AlertOctagon,
    damaged: AlertCircle,
    wrong_position: MapPinOff,
  };

  const issueTypeLabels: Record<IssueType, string> = {
    lost: '道具遗失',
    damaged: '道具损坏',
    wrong_position: '位置错误',
  };

  const handleToggle = (itemId: string, currentChecked: boolean) => {
    toggleCheckItem(itemId, !currentChecked);
  };

  const startEditNote = (itemId: string, currentNote?: string) => {
    setEditingId(itemId);
    setEditNote(currentNote || '');
  };

  const saveNote = (itemId: string) => {
    addNoteToCheckItem(itemId, editNote);
    setEditingId(null);
    setEditNote('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNote('');
  };

  const handleRefresh = () => {
    generateChecklist();
  };

  const priorityFilters = [
    { key: 'all' as const, label: '全部', count: totalCount },
    { key: 'high' as const, label: '高优先', count: highPriorityCount },
    { key: 'medium' as const, label: '中优先', count: mediumPriorityCount },
    { key: 'low' as const, label: '低优先', count: lowPriorityCount },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stage-text tracking-wide flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-neon-yellow" />
            排练确认清单
          </h1>
          <p className="text-lg text-stage-text-secondary mt-2">
            下次排练前需要重点确认的道具
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-5 py-3 rounded-xl bg-stage-bg-card border border-stage-border text-stage-text-secondary hover:text-neon-green hover:border-neon-green/30 transition-all flex items-center gap-2 text-base"
        >
          <RefreshCw className="w-5 h-5" />
          刷新清单
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-stage-text-secondary">总项数</span>
            <ClipboardList className="w-6 h-6 text-stage-text-muted" />
          </div>
          <div className="text-4xl font-bold text-stage-text">{totalCount}</div>
        </div>
        <div className="bg-stage-bg-card rounded-2xl border border-neon-green/30 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-neon-green/70">已确认</span>
            <CheckCircle2 className="w-6 h-6 text-neon-green" />
          </div>
          <div className="text-4xl font-bold text-neon-green">{checkedCount}</div>
        </div>
        <div className="bg-stage-bg-card rounded-2xl border border-neon-red/30 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-neon-red/70">高优先级</span>
            <AlertOctagon className="w-6 h-6 text-neon-red" />
          </div>
          <div className="text-4xl font-bold text-neon-red">
            {highPriorityCount}
          </div>
        </div>
        <div className="bg-stage-bg-card rounded-2xl border border-neon-yellow/30 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-neon-yellow/70">待确认</span>
            <AlertTriangle className="w-6 h-6 text-neon-yellow" />
          </div>
          <div className="text-4xl font-bold text-neon-yellow">
            {totalCount - checkedCount}
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg text-stage-text">
            确认进度
          </span>
          <span className="text-2xl font-bold text-neon-green">
            {totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}%
          </span>
        </div>
        <div className="h-4 bg-stage-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-green-dim to-neon-green rounded-full transition-all duration-500"
            style={{
              width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-base text-stage-text-secondary">优先级：</span>
        <div className="flex gap-2 flex-wrap">
          {priorityFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setPriorityFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-base font-medium transition-all ${
                priorityFilter === f.key
                  ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30'
                  : 'bg-stage-bg-card text-stage-text-secondary border border-stage-border hover:border-stage-text-muted'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* 清单列表 */}
      <div className="space-y-3">
        {filteredChecklist.length > 0 ? (
          filteredChecklist.map((item) => {
            const priority = priorityConfig[item.priority];
            const isExpanded = expandedId === item.id;
            const isEditing = editingId === item.id;
            const IssueIcon = item.issue
              ? issueTypeIcons[item.issue.type]
              : null;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border-2 transition-all ${
                  item.checked
                    ? 'border-stage-border bg-stage-bg-card/50 opacity-60'
                    : `${priority.bgColor} ${priority.borderColor} border-opacity-50`
                }`}
              >
                {/* 主行 */}
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    {/* 勾选框 */}
                    <button
                      onClick={() => handleToggle(item.id, item.checked)}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        item.checked
                          ? 'bg-neon-green border-neon-green text-black'
                          : `border-stage-border hover:${priority.borderColor}`
                      }`}
                    >
                      {item.checked ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6 text-stage-text-muted" />
                      )}
                    </button>

                    {/* 道具信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3
                          className={`text-xl font-bold ${
                            item.checked
                              ? 'text-stage-text-muted line-through'
                              : 'text-stage-text'
                          }`}
                        >
                          {item.prop.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${priority.bgColor} ${priority.color}`}
                        >
                          {priority.label}
                        </span>
                        {item.issue && IssueIcon && (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-stage-bg-hover text-stage-text-secondary flex items-center gap-1.5">
                            <IssueIcon className="w-4 h-4" />
                            {issueTypeLabels[item.issue.type]}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-base mt-1 ${
                          item.checked
                            ? 'text-stage-text-muted'
                            : 'text-stage-text-secondary'
                        }`}
                      >
                        {item.prop.category} · {item.prop.description}
                      </p>
                    </div>

                    {/* 展开按钮 */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : item.id)
                      }
                      className="p-2 rounded-lg hover:bg-stage-bg-hover text-stage-text-secondary hover:text-stage-text transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-stage-border/30 mt-0 animate-fade-in">
                    <div className="pt-4 space-y-4">
                      {/* 问题描述 */}
                      {item.issue && (
                        <div className="p-4 bg-stage-bg-secondary rounded-xl">
                          <div className="text-sm text-stage-text-secondary mb-2">
                            问题描述
                          </div>
                          <div className="text-base text-stage-text">
                            {item.issue.description}
                          </div>
                          <div className="text-sm text-stage-text-muted mt-2">
                            报告时间：
                            {new Date(
                              item.issue.reportedAt
                            ).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      )}

                      {/* 备注 */}
                      <div className="p-4 bg-stage-bg-secondary rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-stage-text-secondary">
                            备注
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => startEditNote(item.id, item.note)}
                              className="text-sm text-neon-green flex items-center gap-1 hover:underline"
                            >
                              <Edit3 className="w-4 h-4" />
                              编辑
                            </button>
                          )}
                        </div>
                        {isEditing ? (
                          <div>
                            <textarea
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              placeholder="添加备注..."
                              className="w-full p-3 bg-stage-bg-card border border-stage-border rounded-lg text-stage-text placeholder-stage-text-muted resize-none focus:border-neon-green/50 focus:outline-none text-base"
                              rows={3}
                            />
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-2 rounded-lg border border-stage-border text-stage-text-secondary hover:bg-stage-bg-hover text-sm"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => saveNote(item.id)}
                                className="px-4 py-2 rounded-lg bg-neon-green text-black font-medium text-sm flex items-center gap-1.5"
                              >
                                <Save className="w-4 h-4" />
                                保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-base text-stage-text">
                            {item.note || '暂无备注'}
                          </div>
                        )}
                      </div>

                      {/* 确认时间 */}
                      {item.checked && item.checkedAt && (
                        <div className="text-sm text-stage-text-muted">
                          确认时间：
                          {new Date(item.checkedAt).toLocaleString('zh-CN')}
                        </div>
                      )}
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
              清单为空
            </h3>
            <p className="text-base text-stage-text-secondary">
              {priorityFilter === 'all'
                ? '当前没有需要确认的道具，所有道具状态正常'
                : `当前没有${priorityFilter === 'high' ? '高优先级' : priorityFilter === 'medium' ? '中优先级' : '低优先级'}的待确认项`}
            </p>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="bg-neon-yellow/5 rounded-2xl border border-neon-yellow/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-neon-yellow/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-neon-yellow" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-stage-text mb-1">
              排练前检查说明
            </h4>
            <p className="text-base text-stage-text-secondary">
              请在每次排练前逐一核对清单中的道具状态。确认无误后点击勾选，系统会记录确认时间。所有问题解决后，记得在「问题记录」页面标记为已解决，清单会自动更新。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
