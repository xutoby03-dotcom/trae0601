import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ClipboardList,
  Thermometer,
  Droplets,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useRoomStore } from '@/store/useRoomStore';
import {
  getInspectionStatusColor,
  getInspectionStatusLabel,
} from '@/utils/status';
import { cn } from '@/lib/utils';

const InspectionList = () => {
  const { inspections } = useInspectionStore();
  const { rooms } = useRoomStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');

  const filteredInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      const room = rooms.find((r) => r.id === inspection.roomId);
      const matchesSearch =
        room?.roomNumber.includes(searchTerm) ||
        inspection.inspector.includes(searchTerm) ||
        inspection.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inspections, rooms, searchTerm, filterStatus]);

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.roomNumber || '未知';
  };

  const statusStats = useMemo(() => {
    return {
      all: inspections.length,
      normal: inspections.filter((i) => i.status === 'normal').length,
      warning: inspections.filter((i) => i.status === 'warning').length,
      critical: inspections.filter((i) => i.status === 'critical').length,
    };
  }, [inspections]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">巡检记录</h1>
          <p className="text-dark-400 mt-1">查看和管理所有巡检记录</p>
        </div>
        <Link
          to="/inspections/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增巡检
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '全部', value: statusStats.all, variant: 'info' as const, status: 'all' },
          { label: '正常', value: statusStats.normal, variant: 'success' as const, status: 'normal' },
          { label: '警告', value: statusStats.warning, variant: 'warning' as const, status: 'warning' },
          { label: '异常', value: statusStats.critical, variant: 'danger' as const, status: 'critical' },
        ].map((item) => (
          <button
            key={item.status}
            onClick={() => setFilterStatus(item.status as typeof filterStatus)}
            className={cn(
              'p-4 rounded-xl border transition-all text-left',
              filterStatus === item.status
                ? 'bg-warning-500/10 border-warning-500/30'
                : 'bg-dark-900/50 border-dark-800 hover:border-dark-700'
            )}
          >
            <p className="text-dark-400 text-sm">{item.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="搜索房间号、巡检人或备注..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
          />
        </div>
      </div>

      <div className="bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  日期
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  房间
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  巡检人
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  水温
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  出水量
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  状态
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredInspections.length > 0 ? (
                filteredInspections.map((inspection, index) => (
                  <tr
                    key={inspection.id}
                    className="hover:bg-dark-800/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <span className="text-white">{inspection.inspectionDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {getRoomNumber(inspection.roomId)} 房
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-dark-300">{inspection.inspector}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Thermometer className={cn(
                          'w-4 h-4',
                          inspection.waterTemperature < 40 || inspection.waterTemperature > 55
                            ? 'text-danger-400'
                            : 'text-success-400'
                        )} />
                        <span className={cn(
                          inspection.waterTemperature < 40 || inspection.waterTemperature > 55
                            ? 'text-danger-400'
                            : 'text-white'
                        )}>
                          {inspection.waterTemperature}°C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Droplets className={cn(
                          'w-4 h-4',
                          inspection.waterFlowRate < 6 ? 'text-warning-400' : 'text-success-400'
                        )} />
                        <span className={cn(
                          inspection.waterFlowRate < 6 ? 'text-warning-400' : 'text-white'
                        )}>
                          {inspection.waterFlowRate}L/min
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        label={getInspectionStatusLabel(inspection.status)}
                        variant={
                          inspection.status === 'normal'
                            ? 'success'
                            : inspection.status === 'warning'
                            ? 'warning'
                            : 'danger'
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/inspections/${inspection.id}`}
                        className="text-warning-400 hover:text-warning-300 text-sm"
                      >
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-400">没有找到匹配的巡检记录</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InspectionList;
