import { useState } from 'react';
import { X, Check, AlertTriangle, Banknote, FileText } from 'lucide-react';
import type { Equipment, RentalRecord } from '../types';
import { formatCurrency, calculateTotalRent, calculatePersonShare } from '../utils/costCalculator';

interface ReturnModalProps {
  equipment: Equipment;
  rentalRecord: RentalRecord;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    isDamaged: boolean;
    depositDeducted: boolean;
    depositDeductionAmount?: number;
    returnNote?: string;
  }) => void;
}

export default function ReturnModal({ equipment, rentalRecord, isOpen, onClose, onConfirm }: ReturnModalProps) {
  const [isDamaged, setIsDamaged] = useState(false);
  const [depositDeducted, setDepositDeducted] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState('');
  const [returnNote, setReturnNote] = useState('');

  if (!isOpen) return null;

  const totalRent = calculateTotalRent(equipment, rentalRecord.startDate, rentalRecord.endDate);
  const personRent = calculatePersonShare(totalRent, rentalRecord.costShare);
  const personDeposit = calculatePersonShare(equipment.deposit, rentalRecord.costShare);

  const handleSubmit = () => {
    onConfirm({
      isDamaged,
      depositDeducted,
      depositDeductionAmount: depositDeducted ? Number(deductionAmount) : undefined,
      returnNote: returnNote || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative h-36 overflow-hidden rounded-t-3xl">
          <img src={equipment.photo} alt={equipment.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-white font-bold text-xl">归还装备</h2>
            <p className="text-white/80 text-sm">{equipment.name}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-xs text-slate-500">使用人</p>
              <p className="text-base font-semibold text-slate-700">{rentalRecord.userName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">归还负责人</p>
              <p className="text-base font-semibold text-slate-700">{rentalRecord.returnPerson}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">使用租金</p>
              <p className="text-base font-semibold text-sky-600">{formatCurrency(personRent)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">押金</p>
              <p className="text-base font-semibold text-orange-500">{formatCurrency(personDeposit)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              归还检查
            </h3>

            <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
              <input
                type="checkbox"
                checked={!isDamaged}
                onChange={(e) => setIsDamaged(!e.target.checked)}
                className="w-5 h-5 rounded accent-emerald-500"
              />
              <div>
                <p className="font-medium text-slate-700">装备完好无损</p>
                <p className="text-sm text-slate-500">正常归还，全额退还押金</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
              <input
                type="checkbox"
                checked={isDamaged}
                onChange={(e) => {
                  setIsDamaged(e.target.checked);
                  if (e.target.checked) setDepositDeducted(true);
                }}
                className="w-5 h-5 rounded accent-red-500"
              />
              <div>
                <p className="font-medium text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  装备有损坏
                </p>
                <p className="text-sm text-red-500">可能需要扣除押金</p>
              </div>
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-orange-500" />
              押金处理
            </h3>

            <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
              <input
                type="checkbox"
                checked={depositDeducted}
                onChange={(e) => setDepositDeducted(e.target.checked)}
                className="w-5 h-5 rounded accent-amber-500"
              />
              <div>
                <p className="font-medium text-slate-700">扣除押金</p>
                <p className="text-sm text-slate-500">勾选后需填写扣除金额</p>
              </div>
            </label>

            {depositDeducted && (
              <div className="pl-2">
                <label className="block text-sm text-slate-600 mb-2">扣除金额（元）</label>
                <input
                  type="number"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(e.target.value)}
                  placeholder={`最多 ${personDeposit} 元`}
                  max={personDeposit}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileText className="w-4 h-4 text-sky-500" />
              备注说明
            </label>
            <textarea
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              placeholder="填写归还时的备注信息..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            确认归还
          </button>
        </div>
      </div>
    </div>
  );
}
