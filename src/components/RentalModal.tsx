import { useState } from 'react';
import { X, Calendar, User, Percent, Shield } from 'lucide-react';
import type { Equipment, Person } from '../types';
import { formatCurrency, calculateTotalRent, calculatePersonShare, calculateRentalDays } from '../utils/costCalculator';

interface RentalModalProps {
  equipment: Equipment;
  persons: Person[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    userName: string;
    startDate: string;
    endDate: string;
    costShare: number;
    returnPerson: string;
  }) => void;
}

export default function RentalModal({ equipment, persons, isOpen, onClose, onConfirm }: RentalModalProps) {
  const [userName, setUserName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [costShare, setCostShare] = useState(100);
  const [returnPerson, setReturnPerson] = useState('');

  if (!isOpen) return null;

  const days = startDate && endDate ? calculateRentalDays(startDate, endDate) : 0;
  const totalRent = startDate && endDate ? calculateTotalRent(equipment, startDate, endDate) : 0;
  const personRent = calculatePersonShare(totalRent, costShare);
  const personDeposit = calculatePersonShare(equipment.deposit, costShare);

  const handleSubmit = () => {
    if (!userName || !startDate || !endDate || !returnPerson) return;
    onConfirm({ userName, startDate, endDate, costShare, returnPerson });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative h-40 overflow-hidden rounded-t-3xl">
          <img src={equipment.photo} alt={equipment.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-white font-bold text-xl">{equipment.name}</h2>
            <p className="text-white/80 text-sm">{equipment.rentalShop}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 p-4 bg-sky-50 rounded-2xl">
            <div>
              <p className="text-xs text-slate-500">日租金</p>
              <p className="text-lg font-bold text-sky-600">{formatCurrency(equipment.dailyPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">押金</p>
              <p className="text-lg font-bold text-orange-500">{formatCurrency(equipment.deposit)}</p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <User className="w-4 h-4 text-sky-500" />
              使用人
            </label>
            <select
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">请选择使用人</option>
              {persons.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                开始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                结束日期
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Percent className="w-4 h-4 text-sky-500" />
              费用分摊比例：{costShare}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={costShare}
              onChange={(e) => setCostShare(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Shield className="w-4 h-4 text-orange-500" />
              归还负责人
            </label>
            <select
              value={returnPerson}
              onChange={(e) => setReturnPerson(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">请选择归还负责人</option>
              {persons.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {days > 0 && (
            <div className="p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl border border-sky-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">租赁天数</span>
                <span className="font-semibold text-sky-700">{days} 天</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">租金合计</span>
                <span className="font-semibold text-slate-700">{formatCurrency(totalRent)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">承担租金</span>
                <span className="font-bold text-sky-600">{formatCurrency(personRent)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-sky-200">
                <span className="text-sm text-slate-600">承担押金</span>
                <span className="font-bold text-orange-500">{formatCurrency(personDeposit)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!userName || !startDate || !endDate || !returnPerson}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            确认认领
          </button>
        </div>
      </div>
    </div>
  );
}
