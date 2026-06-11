import { useState, useEffect } from 'react';
import { X, RefreshCcw, AlertCircle, FileText, Check } from 'lucide-react';
import type { Equipment, RentalRecord } from '../types';
import { EQUIPMENT_TYPE_LABELS } from '../types';
import { formatCurrency } from '../utils/costCalculator';

interface SwapModalProps {
  currentEquipment: Equipment;
  rentalRecord: RentalRecord;
  availableEquipments: Equipment[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (toEquipmentId: string, reason: string) => void;
}

export default function SwapModal({
  currentEquipment,
  rentalRecord,
  availableEquipments,
  isOpen,
  onClose,
  onConfirm,
}: SwapModalProps) {
  const [selectedId, setSelectedId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedId('');
      setReason('');
    }
  }, [isOpen, currentEquipment.id]);

  useEffect(() => {
    if (selectedId && !availableEquipments.some((e) => e.id === selectedId)) {
      setSelectedId('');
    }
  }, [availableEquipments, selectedId]);

  if (!isOpen) return null;

  const selectedEquipment = availableEquipments.find((e) => e.id === selectedId);

  const handleSubmit = () => {
    if (!selectedId || !reason.trim()) return;
    const stillAvailable = availableEquipments.some((e) => e.id === selectedId);
    if (!stillAvailable) return;
    onConfirm(selectedId, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="relative h-36 overflow-hidden rounded-t-3xl bg-gradient-to-r from-orange-500 to-amber-500">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 flex items-center gap-3">
            <div className="p-2 bg-white/25 rounded-xl">
              <RefreshCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">更换装备</h2>
              <p className="text-white/90 text-sm">选择一套空闲装备更换</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <img
              src={currentEquipment.photo}
              alt={currentEquipment.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">当前装备</p>
              <p className="font-semibold text-slate-800 truncate">{currentEquipment.name}</p>
              <p className="text-sm text-slate-500">
                {EQUIPMENT_TYPE_LABELS[currentEquipment.type]} · {currentEquipment.size}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">使用人</p>
              <p className="font-semibold text-sky-600">{rentalRecord.userName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              选择新装备
            </h3>

            {availableEquipments.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">暂无可更换的空闲装备</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {availableEquipments.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => setSelectedId(eq.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedId === eq.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-transparent bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={eq.photo}
                      alt={eq.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{eq.name}</p>
                      <p className="text-xs text-slate-500">
                        {EQUIPMENT_TYPE_LABELS[eq.type]} · {eq.size} · {eq.suitableHeight}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-slate-500">{formatCurrency(eq.dailyPrice)}/天</p>
                      <p className="text-orange-500">押{formatCurrency(eq.deposit)}</p>
                    </div>
                    {selectedId === eq.id && (
                      <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedEquipment && (
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-sm text-emerald-700">新装备日租金</span>
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(selectedEquipment.dailyPrice)}
              </span>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileText className="w-4 h-4 text-orange-500" />
              更换原因
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例如：尺码不合适、装备损坏等..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedId || !reason.trim() || availableEquipments.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            确认更换
          </button>
        </div>
      </div>
    </div>
  );
}
