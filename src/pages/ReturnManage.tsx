import { useState } from 'react';
import { Undo2, Calendar, User, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import ReturnModal from '../components/ReturnModal';
import { useRentalStore } from '../store/useStore';
import type { Equipment, RentalRecord } from '../types';
import { formatCurrency, calculateTotalRent, calculatePersonShare, calculateRentalDays } from '../utils/costCalculator';
import { EQUIPMENT_TYPE_LABELS } from '../types';

export default function ReturnManage() {
  const { equipments, rentalRecords, returnEquipment, swapRecords } = useRentalStore();
  const [selectedItem, setSelectedItem] = useState<{ equipment: Equipment; record: RentalRecord } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unreturned' | 'returned' | 'swap'>('unreturned');

  const unreturnedItems = rentalRecords
    .filter((r) => !r.isReturned)
    .map((record) => {
      const equipment = equipments.find((e) => e.id === record.equipmentId);
      return equipment ? { equipment, record } : null;
    })
    .filter((item): item is { equipment: Equipment; record: RentalRecord } => item !== null);

  const returnedItems = rentalRecords
    .filter((r) => r.isReturned)
    .map((record) => {
      const equipment = equipments.find((e) => e.id === record.equipmentId);
      return equipment ? { equipment, record } : null;
    })
    .filter((item): item is { equipment: Equipment; record: RentalRecord } => item !== null);

  const handleReturnClick = (equipment: Equipment, record: RentalRecord) => {
    setSelectedItem({ equipment, record });
    setIsModalOpen(true);
  };

  const handleConfirmReturn = (data: {
    isDamaged: boolean;
    depositDeducted: boolean;
    depositDeductionAmount?: number;
    returnNote?: string;
  }) => {
    if (!selectedItem) return;
    returnEquipment(selectedItem.record.id, data);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <Undo2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">归还管理</h1>
            <p className="text-sm text-slate-500">管理装备归还和押金扣除</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-1.5 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('unreturned')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'unreturned'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            待归还 ({unreturnedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('returned')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'returned'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            已归还 ({returnedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'swap'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            换装备记录 ({swapRecords.length})
          </button>
        </div>

        {activeTab === 'unreturned' && (
          <div className="space-y-4">
            {unreturnedItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-slate-400">太棒了！所有装备都已归还</p>
              </div>
            ) : (
              unreturnedItems.map(({ equipment, record }) => {
                const days = calculateRentalDays(record.startDate, record.endDate);
                const totalRent = calculateTotalRent(equipment, record.startDate, record.endDate);
                const personRent = calculatePersonShare(totalRent, record.costShare);
                const personDeposit = calculatePersonShare(equipment.deposit, record.costShare);

                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={equipment.photo}
                          alt={equipment.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-slate-800">{equipment.name}</h3>
                              <p className="text-sm text-slate-500">
                                {EQUIPMENT_TYPE_LABELS[equipment.type]} · {equipment.size}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              待归还
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <User className="w-4 h-4 text-sky-500" />
                              <span>使用人：{record.userName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Shield className="w-4 h-4 text-orange-500" />
                              <span>归还人：{record.returnPerson}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Calendar className="w-4 h-4 text-emerald-500" />
                              <span>
                                {formatDate(record.startDate)} ~ {formatDate(record.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span>{days} 天</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">租金：</span>
                              <span className="font-semibold text-sky-600">{formatCurrency(personRent)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">押金：</span>
                              <span className="font-semibold text-orange-500">{formatCurrency(personDeposit)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleReturnClick(equipment, record)}
                            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm hover:shadow-md"
                          >
                            确认归还
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'returned' && (
          <div className="space-y-4">
            {returnedItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Undo2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400">暂无已归还记录</p>
              </div>
            ) : (
              returnedItems.map(({ equipment, record }) => {
                const totalRent = calculateTotalRent(equipment, record.startDate, record.endDate);
                const personRent = calculatePersonShare(totalRent, record.costShare);

                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden opacity-90"
                  >
                    <div className="flex">
                      <div className="w-28 h-28 flex-shrink-0 relative">
                        <img
                          src={equipment.photo}
                          alt={equipment.name}
                          className="w-full h-full object-cover grayscale"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-700">{equipment.name}</h3>
                            <p className="text-sm text-slate-500">使用人：{record.userName}</p>
                          </div>
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">已归还</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-sm">
                          <div className="text-slate-500">
                            租金：<span className="font-semibold text-sky-600">{formatCurrency(personRent)}</span>
                          </div>
                          {record.depositDeducted ? (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-medium">扣押金 {formatCurrency(record.depositDeductionAmount ?? 0)}</span>
                            </div>
                          ) : (
                            <div className="text-emerald-600 font-medium">押金全额退还</div>
                          )}
                        </div>

                        {record.returnNote && (
                          <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                            备注：{record.returnNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'swap' && (
          <div className="space-y-3">
            {swapRecords.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400">暂无换装备记录</p>
              </div>
            ) : (
              swapRecords.map((swap) => {
                const fromEq = equipments.find((e) => e.id === swap.fromEquipmentId);
                const toEq = equipments.find((e) => e.id === swap.toEquipmentId);

                return (
                  <div key={swap.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-slate-500">原装备</p>
                        <p className="font-medium text-slate-700">{fromEq?.name ?? '未知'}</p>
                      </div>
                      <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        更换为
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-sm text-slate-500">新装备</p>
                        <p className="font-medium text-slate-700">{toEq?.name ?? '未知'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <span>操作人：{swap.userName}</span>
                      <span>{formatDate(swap.createdAt)}</span>
                    </div>
                    {swap.reason && (
                      <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                        原因：{swap.reason}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {selectedItem && (
          <ReturnModal
            equipment={selectedItem.equipment}
            rentalRecord={selectedItem.record}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirmReturn}
          />
        )}
      </div>
    </div>
  );
}
