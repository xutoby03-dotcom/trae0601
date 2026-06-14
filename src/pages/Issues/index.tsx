import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  AlertTriangle,
  Clock,
  MapPin,
  User,
  CheckCircle,
  Filter,
  X,
  MessageSquare,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import type { IssueStatus, IssueType } from '@/types';

export default function Issues() {
  const { issues, points, updateIssueStatus } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | IssueType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | IssueStatus>('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [handleResult, setHandleResult] = useState('');
  const [handlerName, setHandlerName] = useState('');

  const getPointById = (id: string) => points.find((p) => p.id === id);

  const filteredIssues = issues.filter((issue) => {
    const matchType = filterType === 'all' || issue.type === filterType;
    const matchStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchType && matchStatus;
  });

  const getTypeLabel = (type: IssueType) => {
    const labels = { curled: '卷边', water: '积水', dirty: '脏污' };
    return labels[type];
  };

  const getTypeVariant = (type: IssueType) => {
    const variants = {
      curled: 'warning' as const,
      water: 'danger' as const,
      dirty: 'default' as const,
    };
    return variants[type];
  };

  const getStatusLabel = (status: IssueStatus) => {
    const labels = { pending: '待处理', processing: '处理中', resolved: '已解决' };
    return labels[status];
  };

  const getStatusVariant = (status: IssueStatus) => {
    const variants = {
      pending: 'warning' as const,
      processing: 'processing' as const,
      resolved: 'success' as const,
    };
    return variants[status];
  };

  const handleStartProcess = (issueId: string) => {
    updateIssueStatus(issueId, 'processing', '当前处理人');
  };

  const handleResolve = (issueId: string) => {
    if (handleResult) {
      updateIssueStatus(issueId, 'resolved', handlerName || '保洁员', handleResult);
      setShowDetail(null);
      setHandleResult('');
      setHandlerName('');
    }
  };

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === 'pending').length,
    processing: issues.filter((i) => i.status === 'processing').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">问题处理</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理和跟踪卷边、积水、脏污等问题
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500">全部问题</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <p className="text-sm text-amber-600">待处理</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
          <p className="text-sm text-blue-600">处理中</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
          <p className="text-sm text-green-600">已解决</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">筛选：</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              全部类型
            </button>
            {(['curled', 'water', 'dirty'] as IssueType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === type
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-slate-200 mx-2" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              全部状态
            </button>
            {(['pending', 'processing', 'resolved'] as IssueStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredIssues.map((issue) => {
            const point = getPointById(issue.pointId);
            return (
              <div
                key={issue.id}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setShowDetail(issue.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      issue.type === 'water'
                        ? 'bg-red-50'
                        : issue.type === 'curled'
                        ? 'bg-amber-50'
                        : 'bg-slate-50'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        issue.type === 'water'
                          ? 'text-red-500'
                          : issue.type === 'curled'
                          ? 'text-amber-500'
                          : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-800 text-sm">
                        {point?.name || '未知点位'}
                      </h4>
                      <StatusBadge variant={getTypeVariant(issue.type)}>
                        {getTypeLabel(issue.type)}
                      </StatusBadge>
                      <StatusBadge variant={getStatusVariant(issue.status)}>
                        {getStatusLabel(issue.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {point?.building}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(issue.createdAt).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {issue.handler && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {issue.handler}
                        </span>
                      )}
                    </div>
                  </div>
                  {issue.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartProcess(issue.id);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      开始处理
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredIssues.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无问题数据</p>
          </div>
        )}
      </div>

      {showDetail && (() => {
        const issue = issues.find((i) => i.id === showDetail);
        const point = issue ? getPointById(issue.pointId) : null;
        if (!issue) return null;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">问题详情</h3>
                <button
                  onClick={() => {
                    setShowDetail(null);
                    setHandleResult('');
                    setHandlerName('');
                  }}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="flex items-center gap-3">
                  <StatusBadge variant={getTypeVariant(issue.type)}>
                    {getTypeLabel(issue.type)}
                  </StatusBadge>
                  <StatusBadge variant={getStatusVariant(issue.status)}>
                    {getStatusLabel(issue.status)}
                  </StatusBadge>
                </div>

                <div>
                  <label className="text-sm text-slate-500">点位位置</label>
                  <p className="font-medium text-slate-800 mt-1">{point?.name}</p>
                  <p className="text-sm text-slate-400">{point?.building}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500">问题描述</label>
                  <p className="text-slate-700 mt-1">{issue.description}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500">上报时间</label>
                  <p className="text-slate-700 mt-1">
                    {new Date(issue.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>

                {issue.photo && (
                  <div>
                    <label className="text-sm text-slate-500">现场照片</label>
                    <div className="mt-2 aspect-video bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={issue.photo}
                        alt="现场照片"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {issue.status !== 'resolved' ? (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="font-medium text-slate-800 text-sm">
                      处理结果
                    </h4>
                    <div>
                      <label className="text-xs text-slate-500">处理人</label>
                      <input
                        type="text"
                        value={handlerName}
                        onChange={(e) => setHandlerName(e.target.value)}
                        placeholder="请输入处理人姓名"
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">处理结果</label>
                      <textarea
                        value={handleResult}
                        onChange={(e) => setHandleResult(e.target.value)}
                        placeholder="请描述处理结果..."
                        rows={3}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <h4 className="font-medium text-slate-800 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      已解决
                    </h4>
                    <div className="text-sm text-slate-600">
                      <p>处理人：{issue.handler}</p>
                      <p>处理时间：{issue.handleTime ? new Date(issue.handleTime).toLocaleString('zh-CN') : '-'}</p>
                      <p className="mt-2">处理结果：{issue.handleResult}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowDetail(null);
                    setHandleResult('');
                    setHandlerName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  关闭
                </button>
                {issue.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(issue.id)}
                    disabled={!handleResult}
                    className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    标记已解决
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
