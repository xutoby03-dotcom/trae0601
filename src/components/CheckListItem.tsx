import { useState } from 'react';
import { Check, Camera, Utensils, Droplets, Trash2, Pill, Gamepad2, X } from 'lucide-react';
import type { CheckItem } from '../types';
import { cn, formatTime, fileToBase64 } from '../utils/helpers';

interface CheckListItemProps {
  item: CheckItem;
  onComplete: (itemId: string, photo?: string, note?: string) => void;
  disabled?: boolean;
}

const iconMap: Record<CheckItem['type'], typeof Utensils> = {
  'food': Utensils,
  'water': Droplets,
  'litter': Trash2,
  'medication': Pill,
  'play': Gamepad2,
};

export default function CheckListItem({ item, onComplete, disabled }: CheckListItemProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [note, setNote] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(item.photo || null);
  const [isCompleting, setIsCompleting] = useState(false);

  const Icon = iconMap[item.type];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPreviewPhoto(base64);
    }
  };

  const handleComplete = () => {
    if (item.completed || disabled) return;
    setIsCompleting(true);
    setTimeout(() => {
      onComplete(item.id, previewPhoto || undefined, note || undefined);
      setIsCompleting(false);
    }, 500);
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl transition-all duration-300',
          item.completed
            ? 'bg-green-50 border-2 border-green-200'
            : 'bg-white border-2 border-gray-100 hover:border-orange-200'
        )}
      >
        <button
          onClick={handleComplete}
          disabled={item.completed || disabled || isCompleting}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
            item.completed
              ? 'bg-green-500 text-white shadow-lg shadow-green-200'
              : 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-[#FF8A3D]',
            isCompleting && 'animate-pulse bg-orange-400',
            (disabled || item.completed) && 'cursor-not-allowed'
          )}
        >
          <Check size={20} className={cn(isCompleting && 'animate-bounce')} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon size={18} className={cn(
              item.completed ? 'text-green-500' : 'text-[#FF8A3D]'
            )} />
            <p className={cn(
              'font-medium text-sm',
              item.completed ? 'text-green-700 line-through' : 'text-[#2D2A26]'
            )}>
              {item.label}
            </p>
          </div>
          {item.note && (
            <p className="text-xs text-gray-500 mt-1 ml-6">💬 {item.note}</p>
          )}
          {item.completedAt && (
            <p className="text-xs text-gray-400 mt-1 ml-6">
              ✓ {formatTime(item.completedAt)} 完成
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(item.photo || previewPhoto) && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
              <img
                src={item.photo || previewPhoto || ''}
                alt="打卡照片"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!item.completed && (
            <button
              onClick={() => setShowPhotoModal(true)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-orange-100 flex items-center justify-center text-gray-500 hover:text-[#FF8A3D] transition-colors"
            >
              <Camera size={18} />
            </button>
          )}
        </div>
      </div>

      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#2D2A26]">添加打卡记录</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上传照片
                </label>
                {previewPhoto ? (
                  <div className="relative">
                    <img
                      src={previewPhoto}
                      alt="预览"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setPreviewPhoto(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF8A3D] hover:bg-orange-50 transition-colors">
                    <Camera size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">点击或拖拽上传照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注说明
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="有什么需要说明的吗？"
                  className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF8A3D] focus:ring-2 focus:ring-orange-100 resize-none text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    handleComplete();
                    setShowPhotoModal(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#FF8A3D] text-white font-medium hover:bg-[#FF7A20] transition-colors shadow-lg shadow-orange-200"
                >
                  确认打卡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
