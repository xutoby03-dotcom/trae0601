import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaintStore } from '@/store/useComplaintStore';
import { useStatistics } from '@/hooks/useStatistics';
import ComplaintCard from '@/components/ComplaintCard';
import StatusBadge from '@/components/StatusBadge';
import { BUILDINGS, NOISE_TYPE_LABELS, ComplaintStatus, NoiseType } from '@/types';
import { Search, Filter, PlusCircle, LayoutGrid, List, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'card' | 'list';

export default function ComplaintList() {
  const navigate = useNavigate();
  const complaints = useComplaintStore((state) => state.complaints);
  const statistics = useStatistics();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [noiseTypeFilter, setNoiseTypeFilter] = useState<NoiseType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [showFilters, setShowFilters] = useState(false);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesSearch =
        complaint.building.includes(searchTerm) ||
        complaint.unit.includes(searchTerm) ||
        complaint.complainant.includes(searchTerm) ||
        complaint.phone.includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      const matchesBuilding = buildingFilter === 'all' || complaint.building === buildingFilter;
      const matchesNoiseType = noiseTypeFilter === 'all' || complaint.noiseType === noiseTypeFilter;

      return matchesSearch && matchesStatus && matchesBuilding && matchesNoiseType;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [complaints, searchTerm, statusFilter, buildingFilter, noiseTypeFilter]);

  const hasActiveFilters = statusFilter !== 'all' || buildingFilter !== 'all' || noiseTypeFilter !== 'all' || searchTerm;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBuildingFilter('all');
    setNoiseTypeFilter('all');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            投诉列表
          </h1>
          <p className="text-slate-400 text-sm">共 {filteredComplaints.length} 条投诉记录</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'card' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
          >
            <Filter className="w-4 h-4" />
            筛选
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {[statusFilter !== 'all', buildingFilter !== 'all', noiseTypeFilter !== 'all', !!searchTerm].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/complaints/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            新建
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="搜索楼栋、房号、投诉人、电话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            清除筛选
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">处理状态</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="overdue">已超期</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">楼栋</label>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">全部楼栋</option>
                {BUILDINGS.map((building) => (
                  <option key={building} value={building}>{building}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">噪音类型</label>
              <select
                value={noiseTypeFilter}
                onChange={(e) => setNoiseTypeFilter(e.target.value as NoiseType | 'all')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">全部类型</option>
                {Object.entries(NOISE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full text-sm">
          <span className="text-slate-400">总计</span>
          <span className="text-white font-medium">{filteredComplaints.length}</span>
        </div>
        {(['pending', 'processing', 'completed', 'overdue'] as ComplaintStatus[]).map((status) => {
          const count = filteredComplaints.filter((c) => c.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
                statusFilter === status ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700/50'
              )}
            >
              <StatusBadge status={status} size="sm" />
              <span className="text-white font-medium">{count}</span>
            </button>
          );
        })}
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-700/50 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">没有找到匹配的投诉</h3>
          <p className="text-slate-400 text-sm mb-6">尝试调整筛选条件或清除筛选</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium text-white transition-colors"
          >
            清除所有筛选
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">位置</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">投诉人</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">电话</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">时间段</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">创建时间</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredComplaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} viewMode="list" />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} viewMode="card" />
          ))}
        </div>
      )}
    </div>
  );
}
