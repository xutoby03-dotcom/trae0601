import React, { useState } from 'react';
import { Plus, Search, User, Phone, Calendar, DollarSign, FileText, Battery } from 'lucide-react';
import { useAppStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { formatDate, getDefaultReturnDate, validatePhone } from '../utils/helpers';
import { Device } from '../types';

export const Lending: React.FC = () => {
  const devices = useAppStore((state) => state.devices);
  const lendingRecords = useAppStore((state) => state.lendingRecords);
  const addLending = useAppStore((state) => state.addLending);

  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    borrowerName: '',
    phone: '',
    deposit: 100,
    expectedReturnDate: getDefaultReturnDate(),
    purpose: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableDevices = devices.filter((d) => d.status === 'available');

  const filteredRecords = [...lendingRecords]
    .sort((a, b) => new Date(b.lendDate).getTime() - new Date(a.lendDate).getTime())
    .filter((r) => {
      const device = devices.find((d) => d.id === r.deviceId);
      const matchSearch =
        r.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone.includes(searchTerm) ||
        device?.deviceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });

  const getDeviceById = (id: string) => devices.find((d) => d.id === id);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.borrowerName.trim()) {
      newErrors.borrowerName = '请输入借用人姓名';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }

    if (formData.deposit < 0) {
      newErrors.deposit = '押金不能为负数';
    }

    if (!formData.expectedReturnDate) {
      newErrors.expectedReturnDate = '请选择预计归还日期';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = '请输入用途';
    }

    if (!selectedDevice) {
      newErrors.device = '请选择要借出的设备';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !selectedDevice) return;

    addLending({
      ...formData,
      deviceId: selectedDevice.id,
    });

    setShowModal(false);
    setSelectedDevice(null);
    setFormData({
      borrowerName: '',
      phone: '',
      deposit: 100,
      expectedReturnDate: getDefaultReturnDate(),
      purpose: '',
    });
    setErrors({});
  };

  const openLendModal = (device: Device) => {
    setSelectedDevice(device);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">借出管理</h1>
        <p className="text-gray-500">登记设备借出信息，查看借出记录</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">可借设备</h3>
            <p className="text-sm text-gray-500 mb-4">
              共 {availableDevices.length} 台设备可借出
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableDevices.length === 0 ? (
                <div className="text-center py-8">
                  <Battery className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">暂无可借设备</p>
                </div>
              ) : (
                availableDevices.map((device) => (
                  <div
                    key={device.id}
                    className="p-4 border border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                    onClick={() => openLendModal(device)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={device.photoUrl}
                        alt={device.deviceNumber}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {device.deviceNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {device.capacity.toLocaleString()} mAh · {device.currentBattery}%
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索借用人、手机号、设备编号..."
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
                <option value="active">借出中</option>
                <option value="overdue">超时未还</option>
                <option value="returned">已归还</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      设备
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      借用人
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      手机号
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      借出日期
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      预计归还
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      押金
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRecords.map((record) => {
                    const device = getDeviceById(record.deviceId);
                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {device && (
                              <img
                                src={device.photoUrl}
                                alt={device.deviceNumber}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <span className="font-medium text-gray-900">
                              {device?.deviceNumber || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {record.borrowerName}
                        </td>
                        <td className="py-4 px-6 text-gray-600">{record.phone}</td>
                        <td className="py-4 px-6 text-gray-600">
                          {formatDate(record.lendDate)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={
                              record.status === 'overdue'
                                ? 'text-red-600 font-medium'
                                : 'text-gray-600'
                            }
                          >
                            {formatDate(record.expectedReturnDate)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          ¥{record.deposit}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={record.status} type="lending" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="py-16 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无借出记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDevice(null);
          setErrors({});
        }}
        title="借出登记"
        size="lg"
      >
        {selectedDevice && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-blue-900 mb-2">借出设备</p>
              <div className="flex items-center gap-3">
                <img
                  src={selectedDevice.photoUrl}
                  alt={selectedDevice.deviceNumber}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedDevice.deviceNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedDevice.capacity.toLocaleString()} mAh · 当前电量{' '}
                    {selectedDevice.currentBattery}%
                  </p>
                  <p className="text-sm text-gray-500">
                    存放柜：{selectedDevice.storageCabinet}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  借用人姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.borrowerName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, borrowerName: e.target.value }))
                  }
                  placeholder="请输入姓名"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.borrowerName ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.borrowerName && (
                  <p className="mt-1 text-sm text-red-500">{errors.borrowerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  手机号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="请输入手机号"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.phone ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  押金 (元) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deposit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deposit: Number(e.target.value),
                    }))
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.deposit ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.deposit && (
                  <p className="mt-1 text-sm text-red-500">{errors.deposit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  预计归还日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expectedReturnDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expectedReturnDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.expectedReturnDate ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.expectedReturnDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.expectedReturnDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                用途 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, purpose: e.target.value }))
                }
                placeholder="请输入借用用途，如：社区活动、会议使用等"
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none ${
                  errors.purpose ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-500">{errors.purpose}</p>
              )}
            </div>

            {errors.device && (
              <p className="text-sm text-red-500">{errors.device}</p>
            )}

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedDevice(null);
                  setErrors({});
                }}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-200 font-medium shadow-lg shadow-blue-600/20"
              >
                确认借出
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
