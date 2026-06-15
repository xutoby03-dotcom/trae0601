import { useState } from 'react';
import { X, Droplets, Star, TrendingDown, MapPin, AlertCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { FilterFormData, Batch, Tea } from '@/types';

interface BatchFilterFormProps {
  batches: Batch[];
  teas: Record<string, Tea | undefined>;
  onSubmit: (results: { batchId: string; data: FilterFormData }[]) => void;
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

interface FormState {
  outputAmountMl: number;
  tasteRating: number;
  lossAmountMl: number;
  lossReason: string;
  shelfLocation: string;
}

export default function BatchFilterForm({ batches, teas, onSubmit, onClose }: BatchFilterFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [forms, setForms] = useState<Record<string, FormState>>(() => {
    const initial: Record<string, FormState> = {};
    batches.forEach((batch) => {
      initial[batch.id] = {
        outputAmountMl: batch.waterAmountMl - 300,
        tasteRating: 4,
        lossAmountMl: 300,
        lossReason: '正常损耗',
        shelfLocation: shelfLocations[0],
      };
    });
    return initial;
  });

  const currentBatch = batches[currentIndex];
  const currentTea = teas[currentBatch.teaId];
  const currentForm = forms[currentBatch.id];

  const allFilled = batches.every((b) => {
    const f = forms[b.id];
    return f && f.outputAmountMl >= 0 && f.lossAmountMl >= 0 && f.shelfLocation && f.lossReason;
  });

  const updateForm = (batchId: string, field: keyof FormState, value: string | number) => {
    setForms((prev) => {
      const form = { ...prev[batchId] };
      if (field === 'outputAmountMl') {
        const val = Number(value);
        form.outputAmountMl = val;
        form.lossAmountMl = Math.max(0, batches.find((b) => b.id === batchId)!.waterAmountMl - val);
      } else if (field === 'lossAmountMl') {
        const val = Number(value);
        form.lossAmountMl = val;
        form.outputAmountMl = Math.max(0, batches.find((b) => b.id === batchId)!.waterAmountMl - val);
      } else {
        (form as any)[field] = value;
      }
      return { ...prev, [batchId]: form };
    });
  };

  const handleSubmit = () => {
    const results = batches.map((batch) => ({
      batchId: batch.id,
      data: forms[batch.id] as FilterFormData,
    }));
    onSubmit(results);
  };

  const outputRate = currentBatch.waterAmountMl > 0
    ? ((currentForm.outputAmountMl / currentBatch.waterAmountMl) * 100).toFixed(1)
    : '0';

  const tasteLabels = ['', '很差', '一般', '还不错', '很好', '完美'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 font-serif">批量记录过滤</h2>
            <p className="text-sm text-gray-500">共 {batches.length} 个批次 · 按桶号逐个填写</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-3 bg-cream-50 border-b border-cream-100">
          <div className="flex items-center gap-2">
            {batches.map((batch, idx) => (
              <div key={batch.id} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                    ${idx === currentIndex
                      ? 'bg-matcha-500 text-white scale-110 shadow-md'
                      : idx < currentIndex
                        ? 'bg-matcha-100 text-matcha-600'
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx < currentIndex ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < batches.length - 1 && (
                  <div
                    className={`w-3 h-0.5 ${idx < currentIndex ? 'bg-matcha-300' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-coral-50/50 border-b border-coral-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 font-serif">{currentTea?.name}</p>
              <p className="text-xs text-gray-500">桶号 {currentBatch.bucketNumber} · 水量 {currentBatch.waterAmountMl}ml</p>
            </div>
            <div className="text-xs text-coral-600 font-medium">
              第 {currentIndex + 1} / {batches.length} 桶
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplets className="w-4 h-4 inline mr-1 text-matcha-500" />
              出品量 (ml)
            </label>
            <input
              type="number"
              value={currentForm.outputAmountMl}
              onChange={(e) => updateForm(currentBatch.id, 'outputAmountMl', e.target.value)}
              min={0}
              step={50}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">水量: {currentBatch.waterAmountMl}ml</span>
              <span
                className={`text-xs font-medium ${
                  Number(outputRate) >= 90
                    ? 'text-matcha-600'
                    : Number(outputRate) >= 80
                      ? 'text-amber-600'
                      : 'text-coral-600'
                }`}
              >
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
                  onClick={() => updateForm(currentBatch.id, 'tasteRating', star)}
                  className={`w-12 h-12 rounded-xl transition-all ${
                    star <= currentForm.tasteRating
                      ? 'bg-amber-100 text-amber-500 scale-105'
                      : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-6 h-6 mx-auto" fill={star <= currentForm.tasteRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{tasteLabels[currentForm.tasteRating]}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingDown className="w-4 h-4 inline mr-1 text-coral-500" />
              损耗量 (ml)
            </label>
            <input
              type="number"
              value={currentForm.lossAmountMl}
              onChange={(e) => updateForm(currentBatch.id, 'lossAmountMl', e.target.value)}
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
              value={currentForm.lossReason}
              onChange={(e) => updateForm(currentBatch.id, 'lossReason', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
            >
              {lossReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1 text-coral-500" />
              入柜位置
            </label>
            <select
              value={currentForm.shelfLocation}
              onChange={(e) => updateForm(currentBatch.id, 'shelfLocation', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
            >
              {shelfLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
              currentIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            上一桶
          </button>
          <div className="flex-1" />
          {currentIndex < batches.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="px-4 py-2.5 rounded-xl font-medium bg-matcha-100 text-matcha-600 hover:bg-matcha-200 transition-all flex items-center gap-1"
            >
              下一桶
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allFilled}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all shadow-md ${
                allFilled
                  ? 'bg-matcha-500 text-white hover:bg-matcha-600 shadow-matcha-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 inline mr-1" />
              全部提交
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
