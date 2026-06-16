import { useState } from 'react';
import { X, ChefHat } from 'lucide-react';
import type { FoodItem } from '@/types';
import { useFoodStore } from '@/store/useFoodStore';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { getRemainingText, formatMoney } from '@/utils/food';
import { clsx } from 'clsx';

interface DeductModalProps {
  open: boolean;
  onClose: () => void;
  food: FoodItem | null;
}

const quickOptions = [
  { label: '用一半', value: 0.5, emoji: '½' },
  { label: '用三分之一', value: 1 / 3, emoji: '⅓' },
  { label: '用四分之一', value: 0.25, emoji: '¼' },
  { label: '全部用完', value: 1, emoji: '✓' },
];

export function DeductModal({ open, onClose, food }: DeductModalProps) {
  const [customValue, setCustomValue] = useState<number>(50);
  const [useCustom, setUseCustom] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0.5);
  const deductPortion = useFoodStore((s) => s.deductPortion);

  if (!food) return null;

  const portion = useCustom ? customValue / 100 : selectedPreset ?? 0;
  const remainingAfter = Math.max(0, food.remaining - portion);
  const actualUsed = food.quantity * portion;
  const pricePortion = food.price * portion;

  const handleConfirm = () => {
    if (portion <= 0) return;
    deductPortion(food.id, portion);
    setSelectedPreset(0.5);
    setCustomValue(50);
    setUseCustom(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedPreset(0.5);
    setCustomValue(50);
    setUseCustom(false);
    onClose();
  };

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-center justify-center p-4', !open && 'pointer-events-none')}>
      <div
        className={clsx(
          'absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
      />
      <div
        className={clsx(
          'relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300',
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        )}
      >
        <div className="px-7 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              <ChefHat className="w-5 h-5 inline mr-2 text-emerald-500" />
              做饭扣减
            </h2>
            <button
              onClick={handleClose}
              className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-7">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">
              {food.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800">{food.name}</h3>
              <p className="text-sm text-slate-500 mt-1">当前: {getRemainingText(food)}</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-3 font-medium">快速选择：</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {quickOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSelectedPreset(opt.value);
                  setUseCustom(false);
                }}
                className={clsx(
                  'p-3 rounded-2xl border-2 text-left transition-all duration-200',
                  !useCustom && selectedPreset === opt.value
                    ? 'border-emerald-400 bg-emerald-50 shadow-md -translate-y-0.5'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                )}
              >
                <span className="text-xl font-bold text-emerald-600 mr-2">{opt.emoji}</span>
                <span className={clsx(
                  'text-sm font-medium',
                  !useCustom && selectedPreset === opt.value ? 'text-emerald-700' : 'text-slate-700'
                )}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setUseCustom(true)}
            className={clsx(
              'w-full text-left mb-3 p-3 rounded-2xl border-2 transition-all',
              useCustom
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-100 bg-white hover:border-slate-200'
            )}
          >
            <span className="text-sm font-medium text-slate-600">自定义用量</span>
          </button>

          {useCustom && (
            <div className="p-4 rounded-2xl bg-slate-50 mb-5 animate-fade-in">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-600">扣减比例</span>
                <span className="text-lg font-bold text-emerald-600">{customValue}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={customValue}
                onChange={(e) => setCustomValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>5%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center mb-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">本次使用</p>
                <p className="text-sm font-semibold text-slate-700">
                  {actualUsed.toFixed(actualUsed < 1 ? 1 : 0)}{food.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">对应金额</p>
                <p className="text-sm font-semibold text-emerald-600">{formatMoney(pricePortion)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">用完剩余</p>
                <p className="text-sm font-semibold text-slate-700">
                  {Math.round(remainingAfter * 100)}%
                </p>
              </div>
            </div>
            <ProgressBar
              value={(1 - remainingAfter) * 100}
              status={remainingAfter <= 0 ? 'expired' : remainingAfter <= 0.25 ? 'danger' : remainingAfter <= 0.5 ? 'warning' : 'fresh'}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} fullWidth>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={portion <= 0 || portion > food.remaining}
              fullWidth
            >
              确认扣减
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
