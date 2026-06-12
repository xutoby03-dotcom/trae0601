import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import type { Participant } from '@/types';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    buyer: string;
    actualQuantity: string;
    cost: number;
    estimatedArrival: string;
    receiptPhoto?: string;
  }) => void;
  participants: Participant[];
}

export default function ClaimModal({ isOpen, onClose, onSubmit, participants }: ClaimModalProps) {
  const [buyer, setBuyer] = useState('');
  const [actualQuantity, setActualQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setReceiptPhoto(result);
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!buyer || !actualQuantity || !cost) return;
    onSubmit({
      buyer,
      actualQuantity,
      cost: Number(cost),
      estimatedArrival,
      receiptPhoto,
    });
    handleClose();
  };

  const handleClose = () => {
    setBuyer('');
    setActualQuantity('');
    setCost('');
    setEstimatedArrival('');
    setReceiptPhoto(undefined);
    setPhotoPreview(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between p-4 border-b border-[#2D2A26]/10">
          <h2 className="text-lg font-bold text-[#2D2A26]">认领食材</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-[#2D2A26]/10 transition-colors">
            <X className="w-5 h-5 text-[#2D2A26]/50" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">认领人</label>
            <select
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#2D2A26]/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E8652E]/40"
            >
              <option value="">选择认领人</option>
              {participants.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.avatar} {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">实际数量</label>
            <input
              type="text"
              value={actualQuantity}
              onChange={(e) => setActualQuantity(e.target.value)}
              placeholder="如：2斤"
              className="w-full px-3 py-2 rounded-lg border border-[#2D2A26]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8652E]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">花费</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#2D2A26]/40">¥</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-[#2D2A26]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8652E]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">预计到达时间</label>
            <input
              type="text"
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              placeholder="如：10:00"
              className="w-full px-3 py-2 rounded-lg border border-[#2D2A26]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8652E]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">小票照片</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#2D2A26]/30 text-sm text-[#2D2A26]/50 hover:border-[#E8652E] hover:text-[#E8652E] transition-colors"
            >
              <Camera className="w-4 h-4" />
              上传小票
            </button>
            {photoPreview && (
              <img src={photoPreview} alt="小票预览" className="mt-2 w-20 h-20 object-cover rounded-lg" />
            )}
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
            disabled={!buyer || !actualQuantity || !cost}
            className="flex-1 px-4 py-2 rounded-full bg-[#E8652E] text-white text-sm font-medium hover:bg-[#d4581f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
