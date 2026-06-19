import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Plus, Building2, User, Calendar, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/Status/StatusBadge';
import { formatDateTime } from '@/utils';

export default function InspectionsPage() {
  const { inspections, facilities } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('all');

  const getFacilityName = (facilityId: string) => {
    return facilities.find((f) => f.id === facilityId)?.name || '未知设施';
  };

  const filtered = inspections.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());

  const stats = {
    pending: inspections.filter((i) => i.status === 'pending').length,
    completed: inspections.filter((i) => i.status === 'completed').length,
    hasIssue: inspections.filter((i) => i.items.some((item) => !item.isNormal)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gray-800">巡检管理</h1>
          <p className="text-gray-500 mt-1">管理设施巡检任务，保障儿童游乐安全</p>
        </div>
        <button
          onClick={() => {
            alert('请前往设施详情页开始巡检');
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          创建巡检任务
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待巡检</p>
              <p className="font-display text-3xl text-primary-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-green-50 to-teal-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成巡检</p>
              <p className="font-display text-3xl text-success-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-red-50 to-pink-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">发现问题</p>
              <p className="font-display text-3xl text-danger-600 mt-1">{stats.hasIssue}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: '全部' },
            { value: 'pending', label: '待巡检' },
            { value: 'completed', label: '已完成' },
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

      {/* List */}
      <div className="space-y-3">
        {filtered.map((inspection, idx) => {
          const abnormalCount = inspection.items.filter((i) => !i.isNormal).length;
          return (
            <Link
              key={inspection.id}
              to={`/inspections/${inspection.id}`}
              className="card p-5 block animate-fade-in-up opacity-0 hover:shadow-card-hover"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg text-gray-800">
                      {getFacilityName(inspection.facilityId)}
                    </h3>
                    <StatusBadge type="issue-status" value={inspection.status === 'completed' ? 'resolved' : 'pending'} />
                    {abnormalCount > 0 && (
                      <span className="badge bg-danger-100 text-danger-700">
                        异常 {abnormalCount} 项
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(inspection.inspectionDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {inspection.inspector}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      {facilities.find((f) => f.id === inspection.facilityId)?.area}
                    </span>
                  </div>
                  {inspection.remark && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">{inspection.remark}</p>
                  )}
                </div>
                <div className="text-primary-500 font-medium flex items-center gap-1">
                  {inspection.status === 'pending' ? '开始巡检' : '查看详情'} →
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">暂无巡检记录</p>
        </div>
      )}
    </div>
  );
}
