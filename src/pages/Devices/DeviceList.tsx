import { useState, useMemo } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useDeviceStore } from '@/store/deviceStore';
import { daysUntil, isExpiringSoon, isExpired, formatDate } from '@/utils/date';
import { useNavigate } from 'react-router-dom';
import { DeviceType } from '@/types';

export function DeviceList() {
  const { devices, getBuildings, getFloors, deleteDevice } = useDeviceStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const buildings = getBuildings();
  const floors = filterBuilding ? getFloors(filterBuilding) : [];

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      if (searchTerm && !device.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !device.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterBuilding && device.building !== filterBuilding) return false;
      if (filterFloor && device.floor !== filterFloor) return false;
      if (filterType && device.type !== filterType) return false;
      return true;
    });
  }, [devices, searchTerm, filterBuilding, filterFloor, filterType]);

  const getDeviceStatus = (device: typeof devices[0]) => {
    if (isExpired(device.expireDate)) return 'danger';
    if (isExpiringSoon(device.expireDate)) return 'warning';
    return device.status;
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该设备吗？')) {
      deleteDevice(id);
      setShowMenu(null);
    }
  };

  const deviceTypes: DeviceType[] = ['干粉灭火器', '二氧化碳灭火器', '泡沫灭火器', '水基灭火器'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">设备档案</h2>
          <p className="mt-1 text-sm text-gray-500">管理所有灭火器设备信息</p>
        </div>
        <button
          onClick={() => navigate('/devices/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          新增设备
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设备编号或位置..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterBuilding}
              onChange={e => {
                setFilterBuilding(e.target.value);
                setFilterFloor('');
              }}
              className="rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">全部楼栋</option>
              {buildings.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={filterFloor}
              onChange={e => setFilterFloor(e.target.value)}
              disabled={!filterBuilding}
              className="rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
            >
              <option value="">全部楼层</option>
              {floors.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">全部类型</option>
              {deviceTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDevices.map(device => {
          const status = getDeviceStatus(device);
          const days = daysUntil(device.expireDate);
          return (
            <div
              key={device.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative h-40 overflow-hidden bg-gray-100">
                <img
                  src={device.photo}
                  alt={device.code}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <StatusBadge status={status} />
                </div>
                <div className="absolute right-3 top-3">
                  <button
                    onClick={() => setShowMenu(showMenu === device.id ? null : device.id)}
                    className="rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-sm hover:bg-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {showMenu === device.id && (
                    <div className="absolute right-0 top-10 z-10 w-32 rounded-lg bg-white py-1 shadow-lg">
                      <button
                        onClick={() => {
                          navigate(`/devices/${device.id}`);
                          setShowMenu(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        查看详情
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/devices/${device.id}/edit`);
                          setShowMenu(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{device.code}</h3>
                  <span className="text-xs text-gray-500">{device.type}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {device.building} · {device.floor} · {device.location}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    压力范围: {device.minPressure}-{device.maxPressure}MPa
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">有效期至</span>
                  <span className={`text-xs font-medium ${
                    days <= 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-gray-700'
                  }`}>
                    {formatDate(device.expireDate)}
                    {days > 0 && days <= 30 && ` (剩${days}天)`}
                    {days <= 0 && ' (已过期)'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">暂无符合条件的设备</p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>共 {filteredDevices.length} 台设备</span>
      </div>
    </div>
  );
}
