import { useState } from 'react';
import { X } from 'lucide-react';

interface SubstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    substituteName: string;
    substituteCost: number;
    substituteQuantity: string;
  }) => void;
  itemName: string;
}

export default function SubstituteModal({ isOpen, onClose, onSubmit, itemName }: SubstituteModalProps) {
  const [substituteName, setSubstituteName] = useState('');
  const [substituteCost, setSubstituteCost] = useState('');
  const [substituteQuantity, setSubstituteQuantity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!substituteName || !substituteCost || !substituteQuantity) return;
    onSubmit({
      substituteName,
      substituteCost: Number(substituteCost),
      substituteQuantity,
    });
    handleClose();
  };

  const handleClose = () => {
    setSubstituteName('');
    setSubstituteCost('');
    setSubstituteQuantity('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between p-4 border-b border-[#2D2A26]/10">
          <h2 className="text-lg font-bold text-[#2D2A26]">替换食材</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-[#2D2A26]/10 transition-colors">
            <X className="w-5 h-5 text-[#2D2A26]/50" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="px-3 py-2 rounded-lg bg-[#D94F4F]/10 text-sm text-[#D94F4F]">
            原食材: {itemName}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">替换食材名称</label>
            <input
              type="text"
              value={substituteName}
              onChange={(e) => setSubstituteName(e.target.value)}
              placeholder="如：鸡腿"
              className="w-full px-3 py-2 rounded-lg border border-[#2D2A26]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8652E]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">替换食材价格</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#2D2A26]/40">¥</span>
              <input
                type="number"
                value={substituteCost}
                onChange={(e) => setSubstituteCost(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-[#2D2A26]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8652E]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">替换数量</label>
            <input
              type="text"
              value={substituteQuantity}
              onChange={(e) => setSubstituteQuantity(e.target.value)}
              placeholder="如：3斤"
              className="w-full px-3 py-2 rounded-lg border border-[#2D2A26]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8652E]/40"
            />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-[#2D2A26]/10">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-full border border-[#2D2A26]/20 text-sm font-medium text-[#2D2A26]/60 hover:bg-[#2D2A26]/5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!substituteName || !substituteCost || !substituteQuantity}
            className="flex-1 px-4 py-2 rounded-full bg-[#E8652E] text-white text-sm font-medium hover:bg-[#d4581f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
