import { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (receiptPhoto: string) => void;
  itemName: string;
  mode?: 'purchased' | 'receipt-only';
}

export default function ReceiptModal({ isOpen, onClose, onSubmit, itemName, mode = 'purchased' }: ReceiptModalProps) {
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReceiptPhoto(undefined);
      setPhotoPreview(undefined);
    }
  }, [isOpen]);

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
    if (!receiptPhoto) return;
    onSubmit(receiptPhoto);
    handleClose();
  };

  const handleClose = () => {
    setReceiptPhoto(undefined);
    setPhotoPreview(undefined);
    onClose();
  };

  const titleText = mode === 'purchased' ? '确认已买到' : '上传小票';
  const submitText = mode === 'purchased' ? '确认买到' : '上传';
  const hintText = mode === 'purchased' ? '上传小票后将标记为"已买到"状态' : '补充上传小票照片';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-[#2D2A26]/10">
          <h2 className="text-lg font-bold text-[#2D2A26]">{titleText}</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-[#2D2A26]/10 transition-colors">
            <X className="w-5 h-5 text-[#2D2A26]/50" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="px-3 py-2 rounded-lg bg-[#4AA8D8]/10 text-sm text-[#4AA8D8]">
            🛒 食材：{itemName}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-2">小票照片 <span className="text-[#D94F4F]">*</span></label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {!photoPreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 px-3 py-8 rounded-xl border-2 border-dashed border-[#2D2A26]/30 text-sm text-[#2D2A26]/50 hover:border-[#E8652E] hover:text-[#E8652E] transition-colors"
              >
                <Camera className="w-8 h-8" />
                <span className="font-medium">点击上传小票照片</span>
                <span className="text-xs">{hintText}</span>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="小票预览"
                  className="w-full h-56 object-cover rounded-xl border border-[#2D2A26]/10"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-2 right-2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-[#2D2A26] shadow-md hover:bg-white transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  重新上传
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-[#5A8F5C]/90 backdrop-blur-sm text-xs font-medium text-white">
                  ✓ 已上传
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-[#2D2A26]/10">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-full border border-[#2D2A26]/20 text-sm font-medium text-[#2D2A26]/60 hover:bg-[#2D2A26]/5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!receiptPhoto}
            className="flex-1 px-4 py-2.5 rounded-full bg-[#5A8F5C] text-white text-sm font-medium hover:bg-[#4a7a4c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
