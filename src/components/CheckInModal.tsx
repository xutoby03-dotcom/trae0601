import { useState } from 'react';
import { X, Phone, Users, Wifi, Home, Send } from 'lucide-react';
import { Elderly, CheckInSource } from '@/types';
import { sourceConfig } from '@/utils/source';
import { useCheckInStore } from '@/store/checkInStore';

const sources: { key: CheckInSource; icon: React.ElementType }[] = [
  { key: 'elderly_phone', icon: Phone },
  { key: 'family_report', icon: Users },
  { key: 'smart_device', icon: Wifi },
  { key: 'home_visit', icon: Home },
];

interface CheckInModalProps {
  elderly: Elderly;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CheckInModal({ elderly, onClose, onSuccess }: CheckInModalProps) {
  const [selectedSource, setSelectedSource] = useState<CheckInSource | null>(null);
  const [notes, setNotes] = useState('');
  const { recordCheckIn } = useCheckInStore();

  const handleSubmit = () => {
    if (!selectedSource) return;
    recordCheckIn(elderly.id, selectedSource, notes);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{elderly.avatar}</span>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {elderly.name} 平安确认
              </h3>
              <p className="text-sm text-slate-500">
                {elderly.building} {elderly.unit} {elderly.roomNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              选择确认来源
            </label>
            <div className="grid grid-cols-2 gap-3">
              {sources.map(({ key, icon: Icon }) => {
                const config = sourceConfig[key];
                const isSelected = selectedSource === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSource(key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? `${config.bgColor} ${config.color} border-current shadow-md scale-105`
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={28} />
                    <span className="font-medium text-sm">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              备注信息
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="可选：记录老人身体状况或其他信息..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedSource}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Send size={18} />
            确认平安
          </button>
        </div>
      </div>
    </div>
  );
}
