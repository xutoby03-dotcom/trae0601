import { AlertTriangle, X, Camera } from 'lucide-react';
import type { Abnormality, AbnormalityType } from '../types';
import { abnormalityLabels } from '../types';
import { formatTime, fileToBase64, cn } from '../utils/helpers';
import { useState } from 'react';

interface AbnormalityBadgeProps {
  abnormality: Abnormality;
}

const typeColors: Record<AbnormalityType, string> = {
  'vomit': 'bg-red-100 text-red-600 border-red-200',
  'not-eating': 'bg-orange-100 text-orange-600 border-orange-200',
  'hiding': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'scratch': 'bg-pink-100 text-pink-600 border-pink-200',
  'other': 'bg-gray-100 text-gray-600 border-gray-200',
};

export function AbnormalityBadge({ abnormality }: AbnormalityBadgeProps) {
  return (
    <div className={cn(
      'p-4 rounded-xl border-2 animate-pulse-slow',
      typeColors[abnormality.type]
    )}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm">
              {abnormalityLabels[abnormality.type]}
            </span>
            <span className="text-xs opacity-75">
              {formatTime(abnormality.reportedAt)}
            </span>
          </div>
          <p className="text-sm opacity-90">{abnormality.description}</p>
          {abnormality.photo && (
            <img
              src={abnormality.photo}
              alt="异常照片"
              className="mt-2 w-24 h-24 object-cover rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface AddAbnormalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: AbnormalityType, description: string, photo?: string) => void;
}

export function AddAbnormalityModal({ isOpen, onClose, onAdd }: AddAbnormalityModalProps) {
  const [selectedType, setSelectedType] = useState<AbnormalityType | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPhoto(base64);
    }
  };

  const handleSubmit = () => {
    if (!selectedType || !description.trim()) return;
    onAdd(selectedType, description.trim(), photo || undefined);
    setSelectedType(null);
    setDescription('');
    setPhoto(null);
    onClose();
  };

  const types: AbnormalityType[] = ['vomit', 'not-eating', 'hiding', 'scratch', 'other'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#2D2A26] flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            标记异常
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              异常类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all border-2',
                    selectedType === type
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                  )}
                >
                  {abnormalityLabels[type]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详细说明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述异常情况..."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传照片（可选）
            </label>
            {photo ? (
              <div className="relative">
                <img
                  src={photo}
                  alt="预览"
                  className="w-full h-40 object-cover rounded-xl"
                />
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="block w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors">
                <Camera size={28} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">点击上传照片</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedType || !description.trim()}
              className={cn(
                'flex-1 py-3 rounded-xl font-medium transition-colors shadow-lg',
                selectedType && description.trim()
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              确认上报
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
