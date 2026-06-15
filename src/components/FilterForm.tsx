import { useState } from 'react';
import { X, Droplets, Star, TrendingDown, MapPin, AlertCircle } from 'lucide-react';
import { FilterFormData, Batch, Tea } from '@/types';

interface FilterFormProps {
  batch: Batch;
  tea: Tea | undefined;
  onSubmit: (data: FilterFormData) => void;
  onClose: () => void;
}

const lossReasons = [
  '正常损耗',
  '茶叶吸水损耗',
  '茶汤浑浊',
  '口感不佳',
  '过滤操作失误',
  '其他',
];

const shelfLocations = [
  '冷藏柜A-1',
  '冷藏柜A-2',
  '冷藏柜A-3',
  '冷藏柜B-1',
  '冷藏柜B-2',
  '冷藏柜B-3',
  '展示柜上层',
  '展示柜下层',
];

export default function FilterForm({ batch, tea, onSubmit, onClose }: FilterFormProps) {
  const [outputAmountMl, setOutputAmountMl] = useState<number>(batch.waterAmountMl - 300);
  const [tasteRating, setTasteRating] = useState<number>(4);
  const [lossAmountMl, setLossAmountMl] = useState<number>(300);
  const [lossReason, setLossReason] = useState<string>('正常损耗');
  const [shelfLocation, setShelfLocation] = useState<string>(shelfLocations[0]);
  
  const handleOutputChange = (value: number) => {
    setOutputAmountMl(value);
    setLossAmountMl(Math.max(0, batch.waterAmountMl - value));
  };
  
  const handleLossChange = (value: number) => {
    setLossAmountMl(value);
    setOutputAmountMl(Math.max(0, batch.waterAmountMl - value));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      outputAmountMl,
      tasteRating,
      lossAmountMl,
      lossReason,
      shelfLocation,
    });
  };
  
  const outputRate = batch.waterAmountMl > 0 ? ((outputAmountMl / batch.waterAmountMl) * 100).toFixed(1) : '0';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 font-serif">记录过滤</h2>
            <p className="text-sm text-gray-500">{tea?.name} · 桶号 {batch.bucketNumber}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplets className="w-4 h-4 inline mr-1 text-matcha-500" />
              出品量 (ml)
            </label>
            <input
              type="number"
              value={outputAmountMl}
              onChange={(e) => handleOutputChange(Number(e.target.value))}
              min={0}
              step={50}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">水量: {batch.waterAmountMl}ml</span>
              <span className={`text-xs font-medium ${Number(outputRate) >= 90 ? 'text-matcha-600' : Number(outputRate) >= 80 ? 'text-amber-600' : 'text-coral-600'}`}>
                出品率: {outputRate}%
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="w-4 h-4 inline mr-1 text-amber-500" />
              口感评分
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setTasteRating(star)}
                  className={`w-12 h-12 rounded-xl transition-all ${
                    star <= tasteRating 
                      ? 'bg-amber-100 text-amber-500 scale-105' 
                      : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-6 h-6 mx-auto" fill={star <= tasteRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {tasteRating === 1 && '很差'}
              {tasteRating === 2 && '一般'}
              {tasteRating === 3 && '还不错'}
              {tasteRating === 4 && '很好'}
              {tasteRating === 5 && '完美'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingDown className="w-4 h-4 inline mr-1 text-coral-500" />
              损耗量 (ml)
            </label>
            <input
              type="number"
              value={lossAmountMl}
              onChange={(e) => handleLossChange(Number(e.target.value))}
              min={0}
              step={10}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-1 text-gray-500" />
              损耗原因
            </label>
            <select
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
            >
              {lossReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1 text-coral-500" />
              入柜位置
            </label>
            <select
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
            >
              {shelfLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-3 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-white bg-matcha-500 hover:bg-matcha-600 transition-colors font-medium shadow-md shadow-matcha-200"
            >
              确认记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
