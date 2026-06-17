import { useState } from 'react';
import { Search, X, Gauge, MapPin, Calendar, DollarSign, Clock, Cylinder } from 'lucide-react';
import { useCylinderStore } from '@/store/useCylinderStore';
import { CylinderCard } from '@/components/CylinderCard';
import { StatusBadge } from '@/components/StatusBadge';
import type { Cylinder as CylinderType, CylinderStatus } from '@/types';
import { formatDate, formatDateTime } from '@/utils/date';
import { calculatePressurePercentage } from '@/utils/calculator';

const statusFilters: { value: CylinderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'normal', label: '正常' },
  { value: 'low', label: '低压' },
  { value: 'expired', label: '过期' },
  { value: 'abnormal', label: '异常' },
];

export default function Cylinders() {
  const { cylinders, getInflationByCylinder, getAbnormalByCylinder } = useCylinderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CylinderStatus | 'all'>('all');
  const [selectedCylinder, setSelectedCylinder] = useState<CylinderType | null>(null);

  const filteredCylinders = cylinders.filter((cylinder) => {
    const matchesSearch = cylinder.cylinderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cylinder.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cylinder.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inflations = selectedCylinder ? getInflationByCylinder(selectedCylinder.id) : [];
  const abnormals = selectedCylinder ? getAbnormalByCylinder(selectedCylinder.id) : [];
  const pressurePercent = selectedCylinder
    ? calculatePressurePercentage(selectedCylinder.pressure, selectedCylinder.ratedPressure)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">气瓶管理</h2>
          <p className="text-sm text-slate-500 mt-1">共 {cylinders.length} 个气瓶，其中正常 {cylinders.filter(c => c.status === 'normal').length} 个</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索气瓶编号或存放位置..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  statusFilter === filter.value
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCylinders.map((cylinder) => (
          <CylinderCard
            key={cylinder.id}
            cylinder={cylinder}
            onClick={() => setSelectedCylinder(cylinder)}
          />
        ))}
      </div>

      {filteredCylinders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">没有找到匹配的气瓶</p>
        </div>
      )}

      {selectedCylinder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCylinder(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`relative h-56 flex items-center justify-center bg-gradient-to-br ${selectedCylinder.photoUrl && selectedCylinder.photoUrl.startsWith('from-') ? selectedCylinder.photoUrl : 'from-primary-500 to-primary-700'}`}>
              <Cylinder className="w-28 h-28 text-white/25" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <button
                onClick={() => setSelectedCylinder(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-display font-bold text-white">{selectedCylinder.cylinderNo}</h3>
                  <StatusBadge status={selectedCylinder.status} />
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <Gauge className="w-4 h-4" />
                    <span>压力表读数</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-slate-900">
                    {selectedCylinder.pressure}
                    <span className="text-sm font-normal text-slate-500 ml-1">/ {selectedCylinder.ratedPressure} MPa</span>
                  </p>
                  <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pressurePercent > 60 ? 'bg-emerald-500' : pressurePercent > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${pressurePercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span>押金</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-slate-900">
                    ¥{selectedCylinder.deposit}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">容量：{selectedCylinder.capacity}L</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">存放位置：</span>
                  <span className="font-medium text-slate-700">{selectedCylinder.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">上次检验：</span>
                  <span className="font-medium text-slate-700">{formatDate(selectedCylinder.inspectionDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">下次检验：</span>
                  <span className="font-medium text-slate-700">{formatDate(selectedCylinder.nextInspectionDate)}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mb-4">
                <h4 className="font-display font-semibold text-slate-900 mb-3">充气记录</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {inflations.length > 0 ? (
                    inflations.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{record.quantity} 只气球</p>
                          <p className="text-xs text-slate-400">{formatDateTime(record.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary-600">-{record.gasUsed}L</p>
                          <p className="text-xs text-slate-400">{record.operator}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">暂无充气记录</p>
                  )}
                </div>
              </div>

              {abnormals.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-display font-semibold text-slate-900 mb-3">异常记录</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {abnormals.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{record.description}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(record.createdAt)}</p>
                        </div>
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          {record.type === 'leak' ? '漏气' : record.type === 'valve' ? '阀门' : record.type === 'exchange' ? '换瓶' : '空瓶'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
