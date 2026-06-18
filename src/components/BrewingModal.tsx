import { useState } from 'react';
import { Droplets, Star, Thermometer, Ruler } from 'lucide-react';
import type { BrewingMethod } from '../types';
import Modal from './Modal';

interface BrewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    grams: number;
    method: BrewingMethod;
    grindSize: number | null;
    waterTemp: number | null;
    ratio: string | null;
    rating: number | null;
    feedback: string | null;
  }) => void;
  batchName: string;
  currentWeight: number;
}

const brewingMethods: { value: BrewingMethod; label: string; icon: string }[] = [
  { value: 'pour_over', label: '手冲', icon: '☕' },
  { value: 'espresso', label: '意式', icon: '🕳️' },
  { value: 'cold_brew', label: '冷萃', icon: '🧊' },
];

export default function BrewingModal({
  isOpen,
  onClose,
  onSubmit,
  batchName,
  currentWeight,
}: BrewingModalProps) {
  const [grams, setGrams] = useState<number>(15);
  const [method, setMethod] = useState<BrewingMethod>('pour_over');
  const [grindSize, setGrindSize] = useState<number | null>(null);
  const [waterTemp, setWaterTemp] = useState<number | null>(null);
  const [ratio, setRatio] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = () => {
    if (grams <= 0 || grams > currentWeight) return;
    
    onSubmit({
      grams,
      method,
      grindSize,
      waterTemp,
      ratio,
      rating,
      feedback: feedback || null,
    });
    
    setGrams(15);
    setMethod('pour_over');
    setGrindSize(null);
    setWaterTemp(null);
    setRatio(null);
    setRating(null);
    setFeedback('');
    onClose();
  };

  const handleStarClick = (value: number) => {
    setRating(rating === value ? null : value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="记录出豆" size="md">
      <div className="space-y-5">
        <div className="p-4 bg-cream-50 rounded-2xl">
          <p className="text-sm text-coffee-500 mb-1">当前批次</p>
          <p className="font-semibold text-coffee-900 font-serif text-lg">{batchName}</p>
          <p className="text-sm text-coffee-600 mt-1">剩余: {currentWeight}g</p>
        </div>

        <div>
          <label className="label-text">使用克数</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              min={1}
              max={currentWeight}
              className="input-field flex-1"
              placeholder="输入克数"
            />
            <span className="text-coffee-500 font-medium">克</span>
          </div>
          <div className="flex gap-2 mt-2">
            {[10, 15, 20, 30].map((g) => (
              <button
                key={g}
                onClick={() => setGrams(g)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  grams === g
                    ? 'bg-coffee-700 text-white'
                    : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'
                }`}
              >
                {g}g
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-text">冲煮方式</label>
          <div className="grid grid-cols-3 gap-2">
            {brewingMethods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  method === m.value
                    ? 'bg-coffee-800 text-white shadow-md'
                    : 'bg-coffee-50 text-coffee-700 hover:bg-coffee-100'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text flex items-center gap-1.5">
              <Ruler size={14} />
              研磨刻度
            </label>
            <input
              type="number"
              value={grindSize ?? ''}
              onChange={(e) => setGrindSize(e.target.value ? Number(e.target.value) : null)}
              className="input-field"
              placeholder="如 18"
            />
          </div>
          <div>
            <label className="label-text flex items-center gap-1.5">
              <Thermometer size={14} />
              水温 (°C)
            </label>
            <input
              type="number"
              value={waterTemp ?? ''}
              onChange={(e) => setWaterTemp(e.target.value ? Number(e.target.value) : null)}
              className="input-field"
              placeholder="如 92"
            />
          </div>
        </div>

        <div>
          <label className="label-text">粉水比</label>
          <input
            type="text"
            value={ratio ?? ''}
            onChange={(e) => setRatio(e.target.value || null)}
            className="input-field"
            placeholder="如 1:15"
          />
        </div>

        <div>
          <label className="label-text flex items-center gap-1.5">
            <Star size={14} />
            风味评价
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    rating && rating >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-coffee-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-text">萃取反馈</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="input-field min-h-[80px] resize-none"
            placeholder="记录一下这杯的风味感受..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={grams <= 0 || grams > currentWeight}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Droplets size={18} />
            确认出豆
          </button>
        </div>
      </div>
    </Modal>
  );
}
