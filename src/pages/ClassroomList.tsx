import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Building2 } from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import ClassroomCard from '@/components/ClassroomCard';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import type { ClassroomStatus } from '@/types';

const statusFilters: { value: 'all' | ClassroomStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'normal', label: '正常使用' },
  { value: 'suspended', label: '暂停预约' },
  { value: 'maintenance', label: '维修中' },
];

export default function ClassroomList() {
  const navigate = useNavigate();
  const { classrooms } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClassroomStatus>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');

  const floors = [...new Set(classrooms.map((c) => c.floor))].sort((a, b) => a - b);

  const filteredClassrooms = classrooms.filter((classroom) => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classroom.floorBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classroom.clubs.some((club) => club.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || classroom.status === statusFilter;
    const matchesFloor = floorFilter === 'all' || classroom.floor === floorFilter;
    
    return matchesSearch && matchesStatus && matchesFloor;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">教室档案</h1>
          <p className="text-slate-500 text-sm mt-1">
            共 {classrooms.length} 间舞蹈教室，{classrooms.filter(c => c.status === 'normal').length} 间正常使用
          </p>
        </div>
        <button
          onClick={() => navigate('/classrooms/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          新增教室
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
              placeholder="搜索教室名称、品牌、社团..."
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

          {/* Floor filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">全部楼层</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}楼
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Classroom grid */}
      {filteredClassrooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">没有找到符合条件的教室</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setFloorFilter('all');
            }}
            className="mt-4 text-teal-600 text-sm font-medium hover:text-teal-700"
          >
            清除筛选条件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredClassrooms.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      )}
    </div>
  );
}
