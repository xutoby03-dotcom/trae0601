import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ClipboardList,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/dateUtils';
import type { InspectionStatus } from '@/types';

const statusFilters: { value: 'all' | InspectionStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'normal', label: '正常' },
  { value: 'warning', label: '预警' },
  { value: 'critical', label: '严重' },
];

export default function InspectionList() {
  const navigate = useNavigate();
  const { inspections } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InspectionStatus>('all');
  const [dateFilter, setDateFilter] = useState('');

  const sortedInspections = [...inspections].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredInspections = sortedInspections.filter((inspection) => {
    const matchesSearch =
      inspection.classroomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.inspectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inspection.overallStatus === statusFilter;
    const matchesDate = !dateFilter || inspection.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">巡检管理</h1>
          <p className="text-slate-500 text-sm mt-1">
            共 {inspections.length} 条巡检记录
          </p>
        </div>
        <button
          onClick={() => navigate('/inspections/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          新建巡检
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索教室、巡检人、备注..."
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

          {/* Date filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Inspection list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredInspections.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">没有找到符合条件的巡检记录</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('');
              }}
              className="mt-4 text-teal-600 text-sm font-medium hover:text-teal-700"
            >
              清除筛选条件
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInspections.map((inspection) => (
              <div
                key={inspection.id}
                onClick={() => navigate(`/classrooms/${inspection.classroomId}`)}
                className="p-5 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-teal-50 rounded-xl flex-shrink-0">
                      <ClipboardList className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors truncate">
                          {inspection.classroomName}
                        </h3>
                        <StatusBadge status={inspection.overallStatus} type="inspection" size="sm" />
                        {inspection.autoSuspended && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                            已自动暂停
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(inspection.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {inspection.inspectorName}
                        </span>
                      </div>
                      {inspection.notes && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-1">
                          {inspection.notes}
                        </p>
                      )}
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
