import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, Battery } from 'lucide-react';
import { useAppStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { formatDate } from '../utils/helpers';
import { Device } from '../types';

export const DeviceList: React.FC = () => {
  const devices = useAppStore((state) => state.devices);
  const deleteDevice = useAppStore((state) => state.deleteDevice);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewDevice, setViewDevice] = useState<Device | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredDevices = devices.filter((d) => {
    const matchSearch =
      d.deviceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.storageCabinet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.interfaceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => {
    deleteDevice(id);
    setDeleteConfirm(null);
  };

  const getBatteryColor = (level: number) => {
    if (level >= 50) return 'text-green-600';
    if (level >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">设备档案</h1>
          <p className="text-gray-500">管理所有充电宝设备信息</p>
        </div>
        <Link
          to="/devices/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          新增设备
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设备编号、存放柜、接口类型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
          >
            <option value="all">全部状态</option>
            <option value="available">可借</option>
            <option value="lent">借出中</option>
            <option value="maintenance">维护中</option>
            <option value="low_battery">低电量待充</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  设备照片
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  设备编号
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  容量
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  接口类型
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  当前电量
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  存放柜
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDevices.map((device) => (
                <tr
                  key={device.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6">
                    <img
                      src={device.photoUrl}
                      alt={device.deviceNumber}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      {device.deviceNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {device.capacity.toLocaleString()} mAh
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {device.interfaceType}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${getBatteryColor(device.currentBattery)}`} />
                      <span className={`font-medium ${getBatteryColor(device.currentBattery)}`}>
                        {device.currentBattery}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {device.storageCabinet}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={device.status} type="device" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewDevice(device)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/devices/${device.id}/edit`}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(device.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="删除"
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

        {filteredDevices.length === 0 && (
          <div className="py-16 text-center">
            <Battery className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无设备数据</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={viewDevice !== null}
        onClose={() => setViewDevice(null)}
        title="设备详情"
        size="lg"
      >
        {viewDevice && (
          <div className="space-y-6">
            <div className="flex gap-6">
              <img
                src={viewDevice.photoUrl}
                alt={viewDevice.deviceNumber}
                className="w-40 h-40 rounded-xl object-cover border border-gray-100"
              />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {viewDevice.deviceNumber}
                  </h3>
                  <StatusBadge status={viewDevice.status} type="device" className="mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">容量</p>
                    <p className="font-medium text-gray-900">
                      {viewDevice.capacity.toLocaleString()} mAh
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">接口类型</p>
                    <p className="font-medium text-gray-900">
                      {viewDevice.interfaceType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">当前电量</p>
                    <p className={`font-medium ${getBatteryColor(viewDevice.currentBattery)}`}>
                      {viewDevice.currentBattery}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">存放柜</p>
                    <p className="font-medium text-gray-900">
                      {viewDevice.storageCabinet}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500 mb-2">配件清单</p>
              <div className="flex flex-wrap gap-2">
                {viewDevice.accessories.map((acc, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  >
                    {acc}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">创建时间</p>
                <p className="text-gray-900">{formatDate(viewDevice.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">更新时间</p>
                <p className="text-gray-900">{formatDate(viewDevice.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-6">确定要删除该设备吗？此操作不可撤销。</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
          >
            取消
          </button>
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors duration-200"
          >
            确认删除
          </button>
        </div>
      </Modal>
    </div>
  );
};
