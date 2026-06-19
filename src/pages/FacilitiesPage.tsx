import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, Calendar, Building2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/Status/StatusBadge';
import { FACILITY_TYPE_LABELS } from '@/types';
import { formatDate } from '@/utils';

export default function FacilitiesPage() {
  const { facilities } = useAppStore();
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const areas = Array.from(new Set(facilities.map((f) => f.area)));
  const types = Object.keys(FACILITY_TYPE_LABELS);

  const filtered = facilities.filter((f) => {
    if (search && !f.name.includes(search) && !f.location.includes(search)) return false;
    if (areaFilter !== 'all' && f.area !== areaFilter) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gray-800">设施档案</h1>
          <p className="text-gray-500 mt-1">管理所有儿童游乐设施的基本信息</p>
        </div>
        <Link to="/facilities/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增设施
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设施名称或位置..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="input-field">
            <option value="all">全部区域</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field">
            <option value="all">全部类型</option>
            {types.map((t) => (
              <option key={t} value={t}>{FACILITY_TYPE_LABELS[t as keyof typeof FACILITY_TYPE_LABELS]}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
            <option value="all">全部状态</option>
            <option value="normal">正常使用</option>
            <option value="needs_repair">待维修</option>
            <option value="out_of_service">已停用</option>
          </select>
        </div>
      </div>

      {/* Facility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((facility, idx) => (
          <Link
            key={facility.id}
            to={`/facilities/${facility.id}`}
            className="card group cursor-pointer animate-fade-in-up opacity-0"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={facility.photo}
                alt={facility.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <StatusBadge type="facility" value={facility.status} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-display text-xl text-white">{facility.name}</h3>
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="truncate">{facility.location}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {FACILITY_TYPE_LABELS[facility.type]}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(facility.lastInspectionDate)}
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-xs text-gray-400">{facility.area}</span>
                <span className="text-xs text-primary-500 font-medium">查看详情 →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-2">
            <Building2 className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500">暂无符合条件的设施</p>
        </div>
      )}
    </div>
  );
}
