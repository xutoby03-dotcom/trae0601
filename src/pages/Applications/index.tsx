import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User, Phone, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useApplicationStore } from '../../store/useApplicationStore';
import { usePosterStore } from '../../store/usePosterStore';
import { formatDate } from '../../utils/date';
import type { ApplicationStatus } from '../../types';
import { APPLICATION_STATUS_LABELS } from '../../types';

export default function Applications() {
  const navigate = useNavigate();
  const applications = useApplicationStore((state) => state.applications);
  const posters = usePosterStore((state) => state.posters);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');

  const getPosterById = (posterId: string) => {
    return posters.find((p) => p.id === posterId);
  };

  const filteredApplications = applications.filter((application) => {
    const poster = getPosterById(application.posterId);
    const matchesSearch =
      poster?.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poster?.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.contact.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <PageHeader
        title="张贴申请"
        description="管理所有海报张贴申请"
        action={
          <button
            onClick={() => navigate('/applications/new')}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            新建申请
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索活动名称、社团、申请人、联系电话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | 'all')}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedApplications.map((application, index) => {
          const poster = getPosterById(application.posterId);
          return (
            <div
              key={application.id}
              className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {poster && (
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={poster.imageUrl}
                    alt={poster.activityName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={application.status} type="application" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">
                      {poster.activityName}
                    </h3>
                    <p className="text-white/80 text-sm">{poster.club}</p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">申请人：</span>
                    <span className="text-gray-900 font-medium">{application.applicant}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">联系方式：</span>
                    <span className="text-gray-900 font-medium">{application.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">申请时间：</span>
                    <span className="text-gray-900">{formatDate(application.createdAt)}</span>
                  </div>
                </div>
                {application.rejectReason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">驳回原因：</p>
                    <p className="text-sm text-red-600">{application.rejectReason}</p>
                  </div>
                )}
                {application.auditedAt && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    审核时间：{formatDate(application.auditedAt)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sortedApplications.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg">没有找到匹配的张贴申请</p>
          <p className="text-gray-400 text-sm mt-1">尝试调整搜索条件或筛选器</p>
        </div>
      )}
    </div>
  );
}
