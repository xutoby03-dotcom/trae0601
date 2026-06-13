import React, { useState, useMemo } from 'react';
import { Search, DollarSign, Check, X, FileText } from 'lucide-react';
import { useAppStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../utils/helpers';
import { CompensationStatus } from '../types';

export const Compensation: React.FC = () => {
  const compensations = useAppStore((state) => state.compensations);
  const lendingRecords = useAppStore((state) => state.lendingRecords);
  const devices = useAppStore((state) => state.devices);
  const updateCompensationStatus = useAppStore((state) => state.updateCompensationStatus);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCompensations = useMemo(() => {
    return [...compensations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((c) => {
        const record = lendingRecords.find((r) => r.id === c.lendingRecordId);
        const device = record ? devices.find((d) => d.id === record.deviceId) : null;
        const matchSearch =
          record?.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record?.phone.includes(searchTerm) ||
          device?.deviceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
      });
  }, [compensations, lendingRecords, devices, searchTerm, statusFilter]);

  const getRecordById = (id: string) => lendingRecords.find((r) => r.id === id);
  const getDeviceById = (id: string) => devices.find((d) => d.id === id);

  const totalAmount = useMemo(() => {
    return compensations
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);
  }, [compensations]);

  const pendingAmount = useMemo(() => {
    return compensations
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);
  }, [compensations]);

  const handleStatusChange = (id: string, status: CompensationStatus) => {
    updateCompensationStatus(id, status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">赔付记录</h1>
        <p className="text-gray-500">管理设备损坏和配件缺失的赔付记录</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总赔付笔数</p>
              <p className="text-3xl font-bold text-gray-900">{compensations.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">已赔付金额</p>
              <p className="text-3xl font-bold text-green-600">¥{totalAmount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">待处理金额</p>
              <p className="text-3xl font-bold text-orange-600">¥{pendingAmount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索借用人、手机号、设备编号、赔付原因..."
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
            <option value="pending">待处理</option>
            <option value="paid">已赔付</option>
            <option value="waived">已豁免</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                  赔付原因
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  日期
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
              {filteredCompensations.map((comp) => {
                const record = getRecordById(comp.lendingRecordId);
                const device = record ? getDeviceById(record.deviceId) : null;

                return (
                  <tr
                    key={comp.id}
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
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-gray-900">{record?.borrowerName || '-'}</p>
                        <p className="text-sm text-gray-500">{record?.phone || '-'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{comp.reason}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">¥{comp.amount}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatDate(comp.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={comp.status} type="compensation" />
                    </td>
                    <td className="py-4 px-6">
                      {comp.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(comp.id, 'paid')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            <Check className="w-4 h-4" />
                            已赔付
                          </button>
                          <button
                            onClick={() => handleStatusChange(comp.id, 'waived')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                            豁免
                          </button>
                        </div>
                      )}
                      {comp.status === 'paid' && (
                        <span className="text-sm text-green-600 font-medium">已完成</span>
                      )}
                      {comp.status === 'waived' && (
                        <span className="text-sm text-gray-500">已豁免</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCompensations.length === 0 && (
          <div className="py-16 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无赔付记录</p>
          </div>
        )}
      </div>
    </div>
  );
};
