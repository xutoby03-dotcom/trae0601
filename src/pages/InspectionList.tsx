import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Thermometer,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Snowflake,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useFreezerStore } from '@/store/freezerStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { formatDateTime } from '@/utils/format';
import {
  shiftLabels,
  doorSealLabels,
  frostLabels,
  softeningLabels,
} from '@/utils/mockData';

export default function InspectionList() {
  const navigate = useNavigate();
  const { freezers } = useFreezerStore();
  const { inspections } = useInspectionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [freezerFilter, setFreezerFilter] = useState<string>('all');

  const getFreezerName = (freezerId: string) => {
    return freezers.find((f) => f.id === freezerId)?.name || '未知冷柜';
  };

  const filteredInspections = inspections.filter((i) => {
    const freezerName = getFreezerName(i.freezerId);
    const matchSearch =
      freezerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'abnormal' && i.isAbnormal) ||
      (statusFilter === 'normal' && !i.isAbnormal);
    const matchFreezer = freezerFilter === 'all' || i.freezerId === freezerFilter;
    return matchSearch && matchStatus && matchFreezer;
  });

  const getDoorSealColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-600 bg-emerald-50';
      case 'normal':
        return 'text-amber-600 bg-amber-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="巡查记录"
        description="记录冷柜温度、门封、结霜和商品软化情况"
        actions={
          <button
            onClick={() => navigate('/inspections/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            新增巡查
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索冷柜名称、巡查人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'normal', 'abnormal'].map((status) => (
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
                  : '异常'}
              </button>
            ))}
          </div>
          <select
            value={freezerFilter}
            onChange={(e) => setFreezerFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
          >
            <option value="all">全部冷柜</option>
            {freezers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

        <div className="space-y-6">
          {filteredInspections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">没有找到符合条件的巡查记录</p>
            </div>
          ) : (
            filteredInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="relative pl-16"
              >
                <div
                  className={`absolute left-4 top-6 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 ${
                    inspection.isAbnormal ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className={`px-6 py-4 flex items-center justify-between ${
                      inspection.isAbnormal
                        ? 'bg-gradient-to-r from-red-50 to-transparent'
                        : 'bg-gradient-to-r from-emerald-50 to-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          inspection.isAbnormal
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {inspection.isAbnormal ? (
                          <AlertTriangle className="w-6 h-6" />
                        ) : (
                          <CheckCircle className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {getFreezerName(inspection.freezerId)}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(inspection.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-3xl font-bold ${
                          inspection.isAbnormal ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {inspection.temperature}°C
                      </p>
                      <StatusBadge
                        type="freezer"
                        status={inspection.isAbnormal ? 'abnormal' : 'normal'}
                      />
                    </div>
                  </div>

                  <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">门封状态</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getDoorSealColor(
                          inspection.doorSealStatus
                        )}`}
                      >
                        {doorSealLabels[inspection.doorSealStatus]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">结霜情况</p>
                      <div className="flex items-center gap-1.5">
                        <Snowflake className="w-4 h-4 text-sky-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {frostLabels[inspection.frostStatus]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">软化程度</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          inspection.softeningLevel === 'none'
                            ? 'text-emerald-600 bg-emerald-50'
                            : inspection.softeningLevel === 'mild'
                            ? 'text-amber-600 bg-amber-50'
                            : inspection.softeningLevel === 'moderate'
                            ? 'text-orange-600 bg-orange-50'
                            : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {softeningLabels[inspection.softeningLevel]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">巡查人</p>
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {inspection.inspector}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({shiftLabels[inspection.shift]})
                        </span>
                      </div>
                    </div>
                  </div>

                  {inspection.notes && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                        <span className="font-medium">备注：</span>
                        {inspection.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
