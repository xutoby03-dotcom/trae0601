import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { FoodItem, DiscardReason } from '@/types';
import { useFoodStore } from '@/store/useFoodStore';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  DISCARD_REASON_LABEL,
  DISCARD_REASON_EMOJI,
  DISCARD_REASON_COLOR,
} from '@/utils/constants';
import { formatMoney } from '@/utils/food';
import { clsx } from 'clsx';

interface DiscardModalProps {
  open: boolean;
  onClose: () => void;
  food: FoodItem | null;
}

const reasons: DiscardReason[] = ['spoiled', 'bought_too_much', 'forgot', 'bad_taste'];

export function DiscardModal({ open, onClose, food }: DiscardModalProps) {
  const [selected, setSelected] = useState<DiscardReason | null>(null);
  const discardFood = useFoodStore((s) => s.discardFood);

  if (!food) return null;

  const wastedAmount = food.price * food.remaining;

  const handleConfirm = () => {
    if (!selected) return;
    discardFood(food.id, selected);
    setSelected(null);
    onClose();
  };

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-center justify-center p-4', !open && 'pointer-events-none')}>
      <div
        className={clsx(
          'absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => {
          setSelected(null);
          onClose();
        }}
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
              <Trash2 className="w-5 h-5 inline mr-2 text-red-500" />
              丢弃食材
            </h2>
            <button
              onClick={() => {
                setSelected(null);
                onClose();
              }}
              className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-7">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">
              {food.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">{food.name}</h3>
                {food.openedAt && <Badge variant="info" size="sm">已开封</Badge>}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                浪费金额约 <span className="text-red-500 font-semibold">{formatMoney(wastedAmount)}</span>
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-4 font-medium">为什么要丢弃它？</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelected(reason)}
                className={clsx(
                  'p-4 rounded-2xl border-2 text-left transition-all duration-200',
                  selected === reason
                    ? 'border-orange-400 bg-orange-50 shadow-md -translate-y-0.5'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                )}
              >
                <span className="text-2xl block mb-2">{DISCARD_REASON_EMOJI[reason]}</span>
                <span className={clsx(
                  'text-sm font-medium',
                  selected === reason ? 'text-orange-700' : 'text-slate-700'
                )}>
                  {DISCARD_REASON_LABEL[reason]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSelected(null);
                onClose();
              }}
              fullWidth
            >
              再想想
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              disabled={!selected}
              fullWidth
            >
              确认丢弃
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
