import { useState } from 'react';
import { Minus, Plus, Package, DollarSign, Store, CalendarDays, Check } from 'lucide-react';
import Modal from './Modal';
import { useStore } from '@/store/useStore';
import type { Medicine } from '@/types';
import { PURCHASE_CHANNELS } from '@/types';
import { todayStr } from '@/utils/dateUtils';

interface Props {
  medicine: Medicine | null;
  onClose: () => void;
}

export default function RestockModal({ medicine, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState<string>('');
  const [channel, setChannel] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr());
  const restockMedicine = useStore((s) => s.restockMedicine);

  if (!medicine) return null;

  const handleConfirm = () => {
    if (qty > 0) {
      restockMedicine(
        medicine.id,
        qty,
        price ? parseFloat(price) : undefined,
        channel || undefined,
        date
      );
      onClose();
    }
  };

  return (
    <Modal
      open={!!medicine}
      onClose={onClose}
      title={`补货 · ${medicine.name}`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-2xl">
            {medicine.emoji}
          </div>
          <div>
            <p className="font-medium text-gray-800">{medicine.name}</p>
            <p className="text-xs text-gray-500">
              当前库存: <span className="font-semibold text-accent-600">{medicine.quantity} {medicine.unit}</span>
            </p>
          </div>
        </div>

        <div>
          <label className="label">
            <Package className="w-4 h-4 inline mr-1" />
            补货数量
          </label>
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
              onClick={() => setQty(qty + 1)}
              className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-600 hover:bg-accent-200 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex justify-center gap-2">
            {[1, 2, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setQty(n)}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-accent-100 hover:text-accent-700 transition-colors"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">
              <DollarSign className="w-4 h-4 inline mr-1" />
              单价（元）
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="选填"
              className="input"
            />
          </div>
          <div>
            <label className="label">
              <CalendarDays className="w-4 h-4 inline mr-1" />
              购买日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">
            <Store className="w-4 h-4 inline mr-1" />
            购买渠道
          </label>
          <div className="flex flex-wrap gap-2">
            {PURCHASE_CHANNELS.map((ch) => (
              <button
                key={ch}
                onClick={() => setChannel(channel === ch ? '' : ch)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  channel === ch
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {price && qty > 0 && (
          <div className="p-3 bg-primary-50 rounded-xl text-center">
            <span className="text-sm text-gray-600">预估总金额</span>
            <p className="font-display text-2xl text-primary-600">
              ¥{(parseFloat(price) * qty).toFixed(2)}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 btn-ghost">
            取消
          </button>
          <button onClick={handleConfirm} disabled={qty <= 0} className="flex-1 btn-accent disabled:opacity-50">
            <Check className="w-4 h-4" />
            确认补货
          </button>
        </div>
      </div>
    </Modal>
  );
}
