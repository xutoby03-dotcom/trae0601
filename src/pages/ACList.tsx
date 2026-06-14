import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { ACCard } from '@/components/air-conditioner/ACCard';
import { useACStatus } from '@/hooks/useACStatus';
import { useAppStore } from '@/store/useAppStore';
import { STATUS_LABELS } from '@/types';
import type { ACStatus } from '@/types';

export default function ACList() {
  const { acsWithStatus } = useACStatus();
  const { deleteAirConditioner } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ACStatus | 'all'>('all');

  const filteredACs = acsWithStatus.filter((ac) => {
    const matchesSearch =
      ac.room.includes(searchTerm) ||
      ac.brand.includes(searchTerm) ||
      ac.model.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || ac.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索房间、品牌、型号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ACStatus | 'all')}
              className="pl-10 pr-8 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="all">全部状态</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Link
          to="/air-conditioners/new"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Plus className="w-5 h-5" />
          新增空调
        </Link>
      </div>

      {filteredACs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {searchTerm || statusFilter !== 'all' ? '没有找到匹配的空调' : '还没有添加空调'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? '试试调整搜索条件'
              : '点击上方按钮添加第一台空调吧'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link
              to="/air-conditioners/new"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增空调
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredACs.map((ac, index) => (
            <ACCard
              key={ac.id}
              ac={ac}
              index={index}
              onDelete={deleteAirConditioner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
