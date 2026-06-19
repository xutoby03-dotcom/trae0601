import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Inbox,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { DeviceBadge } from '@/components/StatusBadge';
import { DeviceStatus, CLINIC_ROOMS, DeviceStatusLabel } from '@shared/types';
import { api } from '@/lib/api';

function DeviceListPage() {
  const navigate = useNavigate();
  const { devices, fetchDevices } = useAppStore();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [clinicRoom, setClinicRoom] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSearching(true);
    fetchDevices({
      keyword: keyword || undefined,
      status: status || undefined,
      clinicRoom: clinicRoom || undefined,
    }).finally(() => setSearching(false));
  };

  const handleSearch = () => {
    loadData();
  };

  const handleReset = () => {
    setKeyword('');
    setStatus('');
    setClinicRoom('');
    fetchDevices();
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`确定要报废设备 ${code} 吗？此操作不可恢复。`)) {
      api.deleteDevice(id).then(() => {
        loadData();
      }).catch((err) => {
        alert(err.message);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Box className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">设备档案</h1>
            <p className="text-sm text-slate-500">管理所有雾化器设备信息</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/devices/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增设备
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="label">
              <Search className="w-3.5 h-3.5 inline mr-1" />
              关键字搜索
            </label>
            <div className="relative">
              <input
                type="text"
                className="input pl-9"
                placeholder="搜索设备编号、品牌、型号..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="min-w-[160px]">
            <label className="label">
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              状态筛选
            </label>
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              {Object.entries(DeviceStatusLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="label">所在诊室</label>
            <select
              className="select"
              value={clinicRoom}
              onChange={(e) => setClinicRoom(e.target.value)}
            >
              <option value="">全部诊室</option>
              {CLINIC_ROOMS.map((room) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSearch} className="btn-primary">
              查询
            </button>
            <button onClick={handleReset} className="btn-secondary">
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        {searching ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
            加载中...
          </div>
        ) : devices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">设备照片</th>
                  <th className="table-th">设备编号</th>
                  <th className="table-th">品牌型号</th>
                  <th className="table-th">适用年龄</th>
                  <th className="table-th">所在诊室</th>
                  <th className="table-th">配件数</th>
                  <th className="table-th">状态</th>
                  <th className="table-th text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} className="table-row-hover">
                    <td className="table-td">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        {device.photo ? (
                          <img
                            src={device.photo}
                            alt={device.code}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Box className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-td">
                      <p className="font-semibold text-slate-900">{device.code}</p>
                    </td>
                    <td className="table-td">
                      <p className="font-medium text-slate-800">{device.brand}</p>
                      <p className="text-xs text-slate-500">{device.model}</p>
                    </td>
                    <td className="table-td text-slate-600">{device.ageRange}</td>
                    <td className="table-td text-slate-600">{device.clinicRoom}</td>
                    <td className="table-td">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        {device.accessories.length} 件
                      </span>
                    </td>
                    <td className="table-td">
                      <DeviceBadge status={device.status as DeviceStatus} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/devices/${device.id}`)}
                          className="btn-ghost text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          title="详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/devices/${device.id}/edit`)}
                          className="btn-ghost text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(device.id, device.code)}
                          className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="报废"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Inbox className="w-16 h-16 mb-4 text-slate-300" />
            <p className="font-medium text-lg">暂无设备数据</p>
            <p className="text-sm mb-4">请添加新设备或调整筛选条件</p>
            <button
              onClick={() => navigate('/devices/new')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增设备
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeviceListPage;
