import React, { useState, useMemo } from 'react';
import { Search, Battery, Check, X, AlertTriangle, DollarSign } from 'lucide-react';
import { useAppStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { formatDate, calculateCompensation } from '../utils/helpers';
import { LendingRecord, Device } from '../types';
import { compensationStandards } from '../utils/mock';

interface ReturnCheckData {
  returnBattery: number;
  cableOk: boolean;
  shellOk: boolean;
  missingAccessories: string[];
}

export const Return: React.FC = () => {
  const devices = useAppStore((state) => state.devices);
  const lendingRecords = useAppStore((state) => state.lendingRecords);
  const returnDevice = useAppStore((state) => state.returnDevice);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LendingRecord | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCompensation, setLastCompensation] = useState<{ amount: number; reason: string; details: { name: string; amount: number }[] } | null>(null);

  const [checkData, setCheckData] = useState<ReturnCheckData>({
    returnBattery: 100,
    cableOk: true,
    shellOk: true,
    missingAccessories: [],
  });

  const pendingReturns = useMemo(() => {
    return lendingRecords
      .filter((r) => r.status === 'active' || r.status === 'overdue')
      .sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (a.status !== 'overdue' && b.status === 'overdue') return 1;
        return new Date(a.expectedReturnDate).getTime() - new Date(b.expectedReturnDate).getTime();
      });
  }, [lendingRecords]);

  const filteredRecords = pendingReturns.filter((r) => {
    const device = devices.find((d) => d.id === r.deviceId);
    return (
      r.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      device?.deviceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getDeviceById = (id: string) => devices.find((d) => d.id === id);

  const compensationResult = useMemo(() => {
    if (!selectedDevice) return { amount: 0, reason: '', details: [] };
    return calculateCompensation(
      checkData.missingAccessories,
      checkData.cableOk,
      checkData.shellOk,
      checkData.returnBattery
    );
  }, [checkData, selectedDevice]);

  const openReturnModal = (record: LendingRecord) => {
    const device = getDeviceById(record.deviceId);
    if (!device) return;

    setSelectedRecord(record);
    setSelectedDevice(device);
    setCheckData({
      returnBattery: device.currentBattery,
      cableOk: true,
      shellOk: true,
      missingAccessories: [],
    });
    setShowModal(true);
  };

  const handleAccessoryToggle = (accessory: string) => {
    setCheckData((prev) => ({
      ...prev,
      missingAccessories: prev.missingAccessories.includes(accessory)
        ? prev.missingAccessories.filter((a) => a !== accessory)
        : [...prev.missingAccessories, accessory],
    }));
  };

  const handleSubmit = () => {
    if (!selectedRecord) return;

    returnDevice(selectedRecord.id, checkData);

    if (compensationResult.amount > 0) {
      setLastCompensation(compensationResult);
    } else {
      setLastCompensation(null);
    }

    setShowModal(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setSelectedRecord(null);
      setSelectedDevice(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">归还管理</h1>
        <p className="text-gray-500">检查归还设备，确认配件完整性</p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-green-900">归还成功！</p>
            {lastCompensation && (
              <p className="text-sm text-green-700">
                需赔付：¥{lastCompensation.amount}（{lastCompensation.reason}）
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索借用人、手机号、设备编号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecords.map((record) => {
          const device = getDeviceById(record.deviceId);
          if (!device) return null;

          const isOverdue = record.status === 'overdue';

          return (
            <div
              key={record.id}
              className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md ${
                isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={device.photoUrl}
                    alt={device.deviceNumber}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {device.deviceNumber}
                      </h3>
                      <StatusBadge status={record.status} type="lending" />
                    </div>
                    <p className="text-sm text-gray-500">
                      {device.capacity.toLocaleString()} mAh
                    </p>
                  </div>
                </div>
                {isOverdue && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">已超时</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">借用人</p>
                  <p className="font-medium text-gray-900">{record.borrowerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">手机号</p>
                  <p className="font-medium text-gray-900">{record.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">借出日期</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(record.lendDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">预计归还</p>
                  <p
                    className={`font-medium ${
                      isOverdue ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {formatDate(record.expectedReturnDate)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-2">配件清单</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {device.accessories.map((acc, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                    >
                      {acc}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => openReturnModal(record)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200"
                >
                  归还检查
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
          <Battery className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无待归还设备</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRecord(null);
          setSelectedDevice(null);
        }}
        title="归还检查"
        size="lg"
      >
        {selectedRecord && selectedDevice && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDevice.photoUrl}
                  alt={selectedDevice.deviceNumber}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedDevice.deviceNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    借用人：{selectedRecord.borrowerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    借出日期：{formatDate(selectedRecord.lendDate)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Battery className="w-4 h-4 inline mr-1" />
                归还时电量
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={checkData.returnBattery}
                  onChange={(e) =>
                    setCheckData((prev) => ({
                      ...prev,
                      returnBattery: Number(e.target.value),
                    }))
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="w-16 text-center font-bold text-lg text-gray-900">
                  {checkData.returnBattery}%
                </span>
              </div>
              {checkData.returnBattery < 20 && (
                <p className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  电量低于20%，将收取 ¥{compensationStandards['电量过低'] || 10} 电量占用费
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  线材检查
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckData((prev) => ({ ...prev, cableOk: true }))}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                      checkData.cableOk
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    正常
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckData((prev) => ({ ...prev, cableOk: false }))}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                      !checkData.cableOk
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    损坏
                  </button>
                </div>
                {!checkData.cableOk && (
                  <p className="mt-2 text-sm text-red-600">
                    线材损坏，将收取 ¥{compensationStandards['充电线'] || 20} 赔偿费
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  外壳检查
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckData((prev) => ({ ...prev, shellOk: true }))}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                      checkData.shellOk
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    完好
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckData((prev) => ({ ...prev, shellOk: false }))}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                      !checkData.shellOk
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    破损
                  </button>
                </div>
                {!checkData.shellOk && (
                  <p className="mt-2 text-sm text-red-600">
                    外壳破损，将收取 ¥{compensationStandards['外壳破损'] || 50} 赔偿费
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                配件检查（点击标记缺失的配件）
              </label>
              <div className="flex flex-wrap gap-3">
                {selectedDevice.accessories.map((acc, idx) => {
                  const isMissing = checkData.missingAccessories.includes(acc);
                  const standard = compensationStandards[acc] || 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAccessoryToggle(acc)}
                      className={`px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                        isMissing
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {acc}
                      {isMissing && standard > 0 && (
                        <span className="ml-2 text-sm">(-¥{standard})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {compensationResult.amount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-orange-100/50 border-b border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900">赔付明细预览</p>
                      <p className="text-xs text-orange-700">共 {compensationResult.details.length} 项</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {compensationResult.details.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-900">¥{item.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-orange-100/30 border-t border-orange-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-orange-900">合计赔付</span>
                    <span className="text-xl font-bold text-orange-600">
                      ¥{compensationResult.amount}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedRecord(null);
                  setSelectedDevice(null);
                }}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-200 font-medium shadow-lg shadow-blue-600/20"
              >
                确认归还
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
