import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Thermometer, MapPin, User, Grid3X3 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useFreezerStore } from '@/store/freezerStore';
import { formatCurrency } from '@/utils/format';

export default function FreezerList() {
  const navigate = useNavigate();
  const { freezers } = useFreezerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFreezers = freezers.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getTotalProductValue = (freezerId: string) => {
    const freezer = freezers.find((f) => f.id === freezerId);
    if (!freezer) return 0;
    return freezer.zones.reduce((total, zone) => {
      return (
        total +
        zone.products.reduce((sum, p) => sum + p.retailPrice * p.stock, 0)
      );
    }, 0);
  };

  const getProductCount = (freezerId: string) => {
    const freezer = freezers.find((f) => f.id === freezerId);
    if (!freezer) return 0;
    return freezer.zones.reduce((total, zone) => total + zone.products.length, 0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="冷柜档案"
        description="管理所有冷柜设备、商品分区和负责人信息"
        actions={
          <button
            onClick={() => navigate('/freezers/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            新增冷柜
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索冷柜名称、位置、负责人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'normal', 'warning', 'abnormal'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all'
                  ? '全部'
                  : status === 'normal'
                  ? '正常'
                  : status === 'warning'
                  ? '预警'
                  : '异常'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFreezers.map((freezer) => (
          <div
            key={freezer.id}
            onClick={() => navigate(`/freezers/${freezer.id}`)}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
          >
            <div
              className={`h-32 relative ${
                freezer.status === 'abnormal'
                  ? 'bg-gradient-to-br from-red-400 to-rose-500'
                  : freezer.status === 'warning'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                  : 'bg-gradient-to-br from-sky-400 to-blue-500'
              }`}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-4 right-4">
                <StatusBadge
                  type="freezer"
                  status={freezer.status}
                  className="bg-white/90 backdrop-blur-sm"
                />
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-2xl font-bold">{freezer.name}</p>
                <p className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {freezer.location}
                </p>
              </div>
              <div className="absolute bottom-4 right-4 text-white text-right">
                <p className="text-sm opacity-90">温度范围</p>
                <p className="font-bold">
                  {freezer.minTemp}°C ~ {freezer.maxTemp}°C
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto bg-sky-100 rounded-lg mb-1.5">
                    <Thermometer className="w-5 h-5 text-sky-600" />
                  </div>
                  <p className="text-xs text-slate-500">温度区间</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {freezer.maxTemp - freezer.minTemp}°C
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto bg-emerald-100 rounded-lg mb-1.5">
                    <Grid3X3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500">商品种类</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {getProductCount(freezer.id)} 种
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto bg-amber-100 rounded-lg mb-1.5">
                    <User className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-xs text-slate-500">货值金额</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {formatCurrency(getTotalProductValue(freezer.id))}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                    {freezer.manager.charAt(0)}
                  </div>
                  <span className="text-sm text-slate-600">{freezer.manager}</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-sky-600 transition-colors">
                  查看详情 →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFreezers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">没有找到符合条件的冷柜</p>
        </div>
      )}
    </div>
  );
}
