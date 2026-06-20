import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Wrench,
  ChevronRight,
  Calendar,
  User,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/dateUtils';
import type { RepairStatus } from '@/types';

const statusFilters: { value: 'all' | RepairStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待维修' },
  { value: 'in_progress', label: '维修中' },
  { value: 'completed', label: '已完成' },
  { value: 'recheck_failed', label: '复查未通过' },
];

export default function RepairList() {
  const navigate = useNavigate();
  const { repairs } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RepairStatus>('all');

  const sortedRepairs = [...repairs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const filteredRepairs = sortedRepairs.filter((repair) => {
    const matchesSearch =
      repair.classroomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.workerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: repairs.filter((r) => r.status === 'pending').length,
    inProgress: repairs.filter((r) => r.status === 'in_progress').length,
    completed: repairs.filter((r) => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">维修管理</h1>
          <p className="text-slate-500 text-sm mt-1">
            共 {repairs.length} 条维修工单
          </p>
        </div>
        <button
          onClick={() => navigate('/repairs/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          创建维修单
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-700">{stats.pending}</p>
          <p className="text-sm text-slate-500 mt-1">待维修</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
          <p className="text-sm text-amber-600 mt-1">维修中</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
          <p className="text-sm text-emerald-600 mt-1">已完成</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索教室、施工人、描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  statusFilter === filter.value
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Repair list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredRepairs.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">没有找到符合条件的维修工单</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 text-teal-600 text-sm font-medium hover:text-teal-700"
            >
              清除筛选条件
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRepairs.map((repair) => (
              <div
                key={repair.id}
                onClick={() => navigate(`/repairs/${repair.id}`)}
                className="p-5 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      repair.status === 'completed'
                        ? 'bg-emerald-50'
                        : repair.status === 'in_progress'
                        ? 'bg-amber-50'
                        : repair.status === 'recheck_failed'
                        ? 'bg-rose-50'
                        : 'bg-slate-50'
                    }`}>
                      <Wrench className={`w-6 h-6 ${
                        repair.status === 'completed'
                          ? 'text-emerald-600'
                          : repair.status === 'in_progress'
                          ? 'text-amber-600'
                          : repair.status === 'recheck_failed'
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors truncate">
                          {repair.classroomName}
                        </h3>
                        <StatusBadge status={repair.status} type="repair" size="sm" />
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                        {repair.description || '维修工单'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          更新于 {formatDate(repair.updatedAt)}
                        </span>
                        {repair.workerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {repair.workerName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
