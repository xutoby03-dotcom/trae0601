import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Plus, User, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/Status/StatusBadge';
import { formatDateTime, todayStr } from '@/utils';
import type { IssueLevel } from '@/types';

export default function IssuesPage() {
  const { issues, facilities, updateIssue, updateFacility } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const getFacilityName = (facilityId: string) => {
    return facilities.find((f) => f.id === facilityId)?.name || '未知设施';
  };

  const filtered = issues.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (levelFilter !== 'all' && i.level !== levelFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

  const handleJudge = (issueId: string, level: IssueLevel) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    updateIssue(issueId, {
      level,
      status: 'confirmed',
      handledAt: todayStr(),
      handlerRemark: level === 'minor'
        ? '问题较轻微，已记录，将在下次常规巡检时处理。'
        : level === 'needs_repair'
        ? '问题需要维修，已生成维修工单并通知维保单位。'
        : '问题严重，设施已立即停用，安排紧急维修。',
    });

    if (level === 'out_of_service') {
      updateFacility(issue.facilityId, { status: 'out_of_service' });
    } else if (level === 'needs_repair') {
      updateFacility(issue.facilityId, { status: 'needs_repair' });
    }
  };

  const handleResolve = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;
    updateIssue(issueId, { status: 'resolved', handledAt: todayStr() });
  };

  const stats = {
    pending: issues.filter((i) => i.status === 'pending').length,
    confirmed: issues.filter((i) => i.status === 'confirmed').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gray-800">问题中心</h1>
          <p className="text-gray-500 mt-1">处理居民上报和巡检发现的设施问题</p>
        </div>
        <Link to="/issues/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          上报问题
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待判定</p>
              <p className="font-display text-3xl text-primary-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">处理中</p>
              <p className="font-display text-3xl text-blue-600 mt-1">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-green-50 to-teal-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已解决</p>
              <p className="font-display text-3xl text-success-600 mt-1">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4">
        <div>
          <span className="text-sm text-gray-500 mr-2">状态：</span>
          <div className="inline-flex gap-1">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待判定' },
              { value: 'confirmed', label: '处理中' },
              { value: 'resolved', label: '已解决' },
              { value: 'closed', label: '已关闭' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 mr-2">等级：</span>
          <div className="inline-flex gap-1">
            {[
              { value: 'all', label: '全部' },
              { value: 'minor', label: '轻微' },
              { value: 'needs_repair', label: '需维修' },
              { value: 'out_of_service', label: '立即停用' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLevelFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  levelFilter === opt.value
                    ? 'bg-secondary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filtered.map((issue, idx) => (
          <div key={issue.id} className="card p-5 animate-fade-in-up opacity-0" style={{ animationDelay: `${idx * 0.03}s` }}>
            <div className="flex flex-col md:flex-row gap-5">
              {issue.photos[0] && (
                <img src={issue.photos[0]} alt="问题照片" className="w-full md:w-32 h-32 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-medium text-lg text-gray-800">{issue.title}</h3>
                  {issue.level && <StatusBadge type="issue-level" value={issue.level} />}
                  <StatusBadge type="issue-status" value={issue.status} />
                </div>
                <p className="text-gray-600 mb-3">
                  <span className="text-gray-400 mr-2">涉及设施：</span>
                  <Link to={`/facilities/${issue.facilityId}`} className="text-primary-600 hover:underline">
                    {getFacilityName(issue.facilityId)}
                  </Link>
                </p>
                <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{issue.reporter}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDateTime(issue.reportDate)}</span>
                </div>
                {issue.handlerRemark && (
                  <div className="mt-3 p-3 bg-secondary-50 rounded-xl">
                    <p className="text-sm"><span className="font-medium text-secondary-700">处理意见：</span>{issue.handlerRemark}</p>
                  </div>
                )}

                {/* Judge Actions */}
                {issue.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2 font-medium">判定问题等级：</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleJudge(issue.id, 'minor')} className="px-4 py-2 rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-all text-sm font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />轻微 - 记录
                      </button>
                      <button onClick={() => handleJudge(issue.id, 'needs_repair')} className="px-4 py-2 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition-all text-sm font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />需维修 - 派单
                      </button>
                      <button onClick={() => handleJudge(issue.id, 'out_of_service')} className="px-4 py-2 rounded-full bg-danger-100 text-danger-700 hover:bg-danger-200 transition-all text-sm font-medium flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />立即停用
                      </button>
                    </div>
                  </div>
                )}

                {issue.status === 'confirmed' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleResolve(issue.id)} className="btn-primary text-sm">
                      标记为已解决
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">暂无问题记录</p>
        </div>
      )}
    </div>
  );
}
