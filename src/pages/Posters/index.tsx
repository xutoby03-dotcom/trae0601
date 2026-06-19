import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { usePosterStore } from '../../store/usePosterStore';
import { formatDate } from '../../utils/date';
import type { PosterStatus } from '../../types';
import { POSTER_STATUS_LABELS, POSTER_SIZES, AREAS } from '../../types';

export default function Posters() {
  const navigate = useNavigate();
  const posters = usePosterStore((state) => state.posters);
  const deletePoster = usePosterStore((state) => state.deletePoster);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PosterStatus | 'all'>('all');

  const filteredPosters = posters.filter((poster) => {
    const matchesSearch =
      poster.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poster.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poster.approvalNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || poster.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个海报档案吗？')) {
      deletePoster(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="海报档案"
        description="管理所有海报档案信息"
        action={
          <button
            onClick={() => navigate('/posters/new')}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            新增海报
          </button>
        }
      />

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索活动名称、社团、审批编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PosterStatus | 'all')}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            {Object.entries(POSTER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 海报列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPosters.map((poster, index) => (
          <div
            key={poster.id}
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group animate-scale-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={poster.imageUrl}
                alt={poster.activityName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <StatusBadge status={poster.status} type="poster" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => navigate(`/posters/${poster.id}`)}
                  className="flex-1 flex items-center justify-center gap-1 bg-white/90 backdrop-blur text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  查看
                </button>
                <button
                  onClick={() => navigate(`/posters/${poster.id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-1 bg-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(poster.id)}
                  className="flex items-center justify-center gap-1 bg-danger text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1 truncate">
                {poster.activityName}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{poster.club}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{poster.size}</span>
                <span>{poster.area}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">审批编号</span>
                  <span className="text-gray-600 font-mono">{poster.approvalNumber}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-400">有效期</span>
                  <span className="text-gray-600">
                    {formatDate(poster.startDate)} - {formatDate(poster.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosters.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg">没有找到匹配的海报档案</p>
          <p className="text-gray-400 text-sm mt-1">尝试调整搜索条件或筛选器</p>
        </div>
      )}
    </div>
  );
}
