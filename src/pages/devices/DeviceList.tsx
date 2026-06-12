import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react';
import { useAppStore } from '@/store';
import { DEVICE_STATUS_COLORS, DEVICE_STATUS_LABELS, DEVICE_CATEGORIES, type DeviceStatus } from '@/types';

export default function DeviceList() {
  const { devices, deleteDevice } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchSearch =
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase()) ||
        d.custodian.toLowerCase().includes(search.toLowerCase()) ||
        (d.description || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || d.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [devices, search, statusFilter, categoryFilter]);

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`确定删除设备 ${code} 吗？`)) {
      deleteDevice(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">设备档案</h1>
          <p className="text-sm text-slate-500 mt-1">共 {devices.length} 台设备</p>
        </div>
        <Link to="/devices/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          新增设备
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索设备编号、品类、保管人..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | 'all')}
                className="input w-32"
              >
                <option value="all">全部状态</option>
                {Object.entries(DEVICE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input w-32"
            >
              <option value="all">全部品类</option>
              {DEVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  设备
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  编号
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  品类
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  保管人
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  价值
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  购买日期
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                    暂无匹配的设备
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device, idx) => (
                  <tr
                    key={device.id}
                    className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={device.photo}
                          alt=""
                          className="w-11 h-11 rounded-lg object-cover bg-slate-100"
                        />
                        <span className="font-medium text-slate-800 text-sm">
                          {device.description || device.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-sm text-brand-600 font-mono bg-brand-50 px-2 py-0.5 rounded">
                        {device.code}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{device.category}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${DEVICE_STATUS_COLORS[device.status]}`}>
                        {DEVICE_STATUS_LABELS[device.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{device.custodian}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">
                      ¥{device.value.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{device.purchaseDate}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/devices/${device.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/devices/${device.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(device.id, device.code)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
