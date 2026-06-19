import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Wrench, User, Calendar, Clock, Building2, CheckCircle2, AlertCircle, FileCheck } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/Status/StatusBadge';
import { formatDate, formatDateTime, todayStr } from '@/utils';

export default function RepairsPage() {
  const { repairs, facilities, updateRepair, updateFacility } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('all');

  const getFacilityName = (facilityId: string) => {
    return facilities.find((f) => f.id === facilityId)?.name || '未知设施';
  };

  const filtered = repairs.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleComplete = (repairId: string) => {
    const repair = repairs.find((r) => r.id === repairId);
    if (!repair) return;
    updateRepair(repairId, { status: 'completed' });
  };

  const handleReview = (repairId: string) => {
    const repair = repairs.find((r) => r.id === repairId);
    if (!repair) return;
    const reviewResult = prompt('请输入复查结果：', '维修质量合格，设施恢复正常使用。');
    if (reviewResult !== null) {
      updateRepair(repairId, {
        status: 'reviewed',
        reviewer: '管理员',
        reviewResult,
        reviewDate: todayStr(),
        reopenDate: todayStr(),
      });
      updateFacility(repair.facilityId, { status: 'normal' });
    }
  };

  const stats = {
    pending: repairs.filter((r) => r.status === 'pending').length,
    inProgress: repairs.filter((r) => r.status === 'in_progress').length,
    reviewed: repairs.filter((r) => r.status === 'reviewed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gray-800">维修记录</h1>
          <p className="text-gray-500 mt-1">跟踪设施维修进度，记录处理过程</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="font-display text-3xl text-primary-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">维修中</p>
              <p className="font-display text-3xl text-blue-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-green-50 to-teal-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已验收</p>
              <p className="font-display text-3xl text-success-600 mt-1">{stats.reviewed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: '全部' },
            { value: 'pending', label: '待处理' },
            { value: 'in_progress', label: '维修中' },
            { value: 'completed', label: '已完成' },
            { value: 'reviewed', label: '已验收' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === opt.value
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Repair List */}
      <div className="space-y-4">
        {filtered.map((repair, idx) => (
          <div key={repair.id} className="card p-5 animate-fade-in-up opacity-0" style={{ animationDelay: `${idx * 0.03}s` }}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-medium text-lg text-gray-800">{repair.title}</h3>
                  <StatusBadge type="repair-status" value={repair.status} />
                </div>
                <p className="text-gray-600 mb-3">
                  <span className="text-gray-400 mr-2">维修设施：</span>
                  <Link to={`/facilities/${repair.facilityId}`} className="text-primary-600 hover:underline">
                    {getFacilityName(repair.facilityId)}
                  </Link>
                </p>

                {/* Timeline */}
                <div className="space-y-2 text-sm">
                  {repair.createdAt && (
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileCheck className="w-3 h-3 text-gray-600" />
                      </div>
                      <div>
                        <span className="text-gray-500">创建工单：</span>
                        <span className="text-gray-700">{formatDateTime(repair.createdAt)}</span>
                      </div>
                    </div>
                  )}
                  {repair.handler && (
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3 h-3 text-primary-700" />
                      </div>
                      <div>
                        <span className="text-gray-500">处理人：</span>
                        <span className="text-gray-700">{repair.handler}</span>
                        {repair.repairDate && (
                          <span className="text-gray-400 ml-2">· {formatDate(repair.repairDate)}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {repair.result && (
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Wrench className="w-3 h-3 text-blue-700" />
                      </div>
                      <div>
                        <span className="text-gray-500">处理结果：</span>
                        <span className="text-gray-700">{repair.result}</span>
                      </div>
                    </div>
                  )}
                  {repair.reviewResult && (
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-success-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-success-700" />
                      </div>
                      <div>
                        <span className="text-gray-500">复查结果：</span>
                        <span className="text-gray-700">{repair.reviewResult}</span>
                        {repair.reviewer && (
                          <span className="text-gray-400 ml-2">· {repair.reviewer}</span>
                        )}
                        {repair.reviewDate && (
                          <span className="text-gray-400 ml-2">· {formatDate(repair.reviewDate)}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {repair.materials && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">使用材料</p>
                    <p className="text-sm text-gray-700">{repair.materials}</p>
                  </div>
                )}

                {repair.reopenDate && (
                  <p className="text-sm text-success-600 mt-3 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    已于 {formatDate(repair.reopenDate)} 恢复开放
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 lg:w-auto w-full">
                {repair.status === 'pending' && (
                  <Link to={`/repairs/${repair.id}`} className="btn-primary text-center">
                    开始处理
                  </Link>
                )}
                {repair.status === 'in_progress' && (
                  <button onClick={() => handleComplete(repair.id)} className="btn-secondary">
                    标记完成
                  </button>
                )}
                {repair.status === 'completed' && (
                  <button onClick={() => handleReview(repair.id)} className="btn-primary">
                    复查验收
                  </button>
                )}
                {(repair.status === 'pending' || repair.status === 'in_progress') && (
                  <Link to={`/repairs/${repair.id}`} className="btn-ghost text-center">
                    编辑详情
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Wrench className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">暂无维修记录</p>
        </div>
      )}
    </div>
  );
}
