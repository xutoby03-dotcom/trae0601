import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Calendar,
  User,
  Gauge,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useInspectionStore } from '@/store/inspectionStore';
import { useDeviceStore } from '@/store/deviceStore';
import { formatDate } from '@/utils/date';

export function InspectionList() {
  const navigate = useNavigate();
  const { inspections } = useInspectionStore();
  const { getDeviceById, getBuildings } = useDeviceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');

  const buildings = getBuildings();

  const sortedInspections = useMemo(() => {
    return [...inspections].sort(
      (a, b) => new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime()
    );
  }, [inspections]);

  const filteredInspections = useMemo(() => {
    return sortedInspections.filter(inspection => {
      const device = getDeviceById(inspection.deviceId);
      if (!device) return false;

      if (searchTerm && !device.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !inspection.inspector.includes(searchTerm)) {
        return false;
      }

      if (filterResult && inspection.result !== filterResult) return false;
      if (filterBuilding && device.building !== filterBuilding) return false;

      return true;
    });
  }, [sortedInspections, searchTerm, filterResult, filterBuilding, getDeviceById]);

  const checkItemStatus = (value: boolean, isPositive = true) => {
    return isPositive ? value : !value;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">巡检记录</h2>
          <p className="mt-1 text-sm text-gray-500">查看和管理所有巡检记录</p>
        </div>
        <button
          onClick={() => navigate('/inspections/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          新建巡检
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设备编号或检查人..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <select
            value={filterBuilding}
            onChange={e => setFilterBuilding(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="">全部楼栋</option>
            {buildings.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={filterResult}
            onChange={e => setFilterResult(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="">全部结果</option>
            <option value="normal">正常</option>
            <option value="abnormal">异常</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredInspections.map(inspection => {
          const device = getDeviceById(inspection.deviceId);
          if (!device) return null;

          return (
            <div
              key={inspection.id}
              className="rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between border-b border-gray-100 p-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    inspection.result === 'normal' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {inspection.result === 'normal' ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{device.code}</h3>
                      <StatusBadge status={inspection.result === 'normal' ? 'normal' : 'danger'} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {device.building} {device.floor} {device.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(inspection.inspectDate)}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <User className="h-3.5 w-3.5" />
                    {inspection.inspector}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Gauge className="mr-1.5 h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">压力</span>
                  </div>
                  <p className={`mt-1 font-semibold ${
                    inspection.pressureStatus === 'normal' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {inspection.pressure} MPa
                  </p>
                  <p className="text-xs text-gray-400">
                    {inspection.pressureStatus === 'normal' ? '正常' :
                     inspection.pressureStatus === 'low' ? '偏低' : '偏高'}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-xs text-gray-500">铅封</span>
                  <p className={`mt-1 font-semibold ${
                    inspection.seal ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {inspection.seal ? '完好' : '损坏'}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-xs text-gray-500">喷管</span>
                  <p className={`mt-1 font-semibold ${
                    inspection.hose ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {inspection.hose ? '完好' : '损坏'}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-xs text-gray-500">箱门</span>
                  <p className={`mt-1 font-semibold ${
                    inspection.boxDoor ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {inspection.boxDoor ? '完好' : '变形'}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-xs text-gray-500">遮挡物</span>
                  <p className={`mt-1 font-semibold ${
                    !inspection.obstruction ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {inspection.obstruction ? '有遮挡' : '无遮挡'}
                  </p>
                </div>
              </div>

              {inspection.remark && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">备注：</span>
                    {inspection.remark}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredInspections.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">暂无符合条件的巡检记录</p>
        </div>
      )}

      <div className="text-sm text-gray-500">
        共 {filteredInspections.length} 条巡检记录
      </div>
    </div>
  );
}
