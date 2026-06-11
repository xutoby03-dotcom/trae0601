import { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import Modal from './Modal';
import { useStore } from '@/store/useStore';
import type { Medicine } from '@/types';

interface Props {
  medicine: Medicine | null;
  onClose: () => void;
}

export default function UseMedicineModal({ medicine, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const useMedicine = useStore((s) => s.useMedicine);

  if (!medicine) return null;

  const maxQty = medicine.quantity;

  const handleConfirm = () => {
    if (qty > 0 && qty <= maxQty) {
      useMedicine(medicine.id, qty);
      onClose();
    }
  };

  return (
    <Modal
      open={!!medicine}
      onClose={onClose}
      title={`使用 · ${medicine.name}`}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl">
            {medicine.emoji}
          </div>
          <div>
            <p className="font-medium text-gray-800">{medicine.name}</p>
            <p className="text-xs text-gray-500">
              当前库存: <span className="font-semibold text-primary-600">{medicine.quantity} {medicine.unit}</span>
            </p>
          </div>
        </div>

        <div>
          <label className="label">使用数量</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center">
              <span className="font-display text-4xl text-gray-800">{qty}</span>
              <span className="text-gray-500 ml-1">{medicine.unit}</span>
            </div>
            <button
              onClick={() => setQty(Math.min(maxQty, qty + 1))}
              className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-200 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex justify-center gap-2">
            {[1, 2, 3, 5].map((n) => (
              <button
                key={n}
                onClick={() => setQty(Math.min(maxQty, n))}
                disabled={n > maxQty}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 btn-ghost">
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={qty <= 0 || qty > maxQty}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            确认使用
          </button>
        </div>
      </div>
    </Modal>
  );
}
