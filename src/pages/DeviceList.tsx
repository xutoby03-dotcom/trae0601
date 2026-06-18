import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Grid3X3,
  List,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import DeviceCard from '@/components/DeviceCard';
import StatusBadge from '@/components/StatusBadge';
import { ConnectorType, DeviceStatus } from '@/types';
import { rooms } from '@/data/rooms';
import { cn } from '@/lib/utils';

const connectorTypes: ConnectorType[] = ['HDMI', 'Type-C', 'Mac', 'VGA', 'DP'];
const statusOptions: DeviceStatus[] = ['available', 'borrowed', 'faulty', 'maintenance'];

const DeviceList = () => {
  const navigate = useNavigate();
  const { devices } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ConnectorType | 'all'>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<DeviceStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          device.name.toLowerCase().includes(term) ||
          device.serialNumber.toLowerCase().includes(term) ||
          device.type.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      
      if (selectedType !== 'all' && device.type !== selectedType) return false;
      if (selectedRoom !== 'all' && device.roomId !== selectedRoom) return false;
      if (selectedStatus !== 'all' && device.status !== selectedStatus) return false;
      
      return true;
    });
  }, [devices, searchTerm, selectedType, selectedRoom, selectedStatus]);

  const handleDeviceClick = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">设备档案</h1>
          <p className="text-slate-500 mt-1">
            共 {devices.length} 个转接头，可用 {devices.filter(d => d.status === 'available').length} 个
          </p>
        </div>
        
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          添加设备
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索设备名称、编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ConnectorType | 'all')}
                className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm bg-white"
              >
                <option value="all">全部类型</option>
                {connectorTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm bg-white"
              >
                <option value="all">全部会议室</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.floor})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as DeviceStatus | 'all')}
                className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm bg-white"
              >
                <option value="all">全部状态</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'available' && '可用'}
                    {status === 'borrowed' && '借出中'}
                    {status === 'faulty' && '故障'}
                    {status === 'maintenance' && '维修中'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-teal-50 text-teal-600' : 'text-slate-400 hover:bg-slate-50'
                )}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' ? 'bg-teal-50 text-teal-600' : 'text-slate-400 hover:bg-slate-50'
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {connectorTypes.map((type) => {
            const count = devices.filter((d) => d.type === type).length;
            const available = devices.filter((d) => d.type === type && d.status === 'available').length;
            
            return (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? 'all' : type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  selectedType === type
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {type}
                <span className="ml-1.5 opacity-75">{available}/{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onClick={() => handleDeviceClick(device.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  设备
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  编号
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  所在会议室
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((device) => {
                const room = rooms.find((r) => r.id === device.roomId);
                return (
                  <tr
                    key={device.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleDeviceClick(device.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={device.photo}
                          alt={device.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="font-medium text-slate-800">{device.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{device.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-mono text-sm">
                        {device.serialNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">
                        {room?.name || '未分配'}
                        {room && <span className="text-slate-400 ml-1">({room.floor})</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={device.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredDevices.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">没有找到匹配的设备</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceList;
