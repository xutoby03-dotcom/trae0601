import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, TextArea, Select } from '../ui/Input';
import { Package, AlertTriangle, Minus } from 'lucide-react';
import type { Material, InventoryLogType } from '../../types';
import { INVENTORY_LOG_TYPE_LABELS } from '../../types';

interface InventoryAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  onConfirm: (type: InventoryLogType, quantity: number, reason: string) => void;
}

export function InventoryAdjustModal({
  isOpen,
  onClose,
  material,
  onConfirm,
}: InventoryAdjustModalProps) {
  const [type, setType] = useState<InventoryLogType>('damaged');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(type, quantity, reason);
      setIsSubmitting(false);
      setQuantity(1);
      setReason('');
      setType('damaged');
      onClose();
    }, 500);
  };

  if (!material) return null;

  const typeOptions = [
    { value: 'damaged', label: '破损' },
    { value: 'missing', label: '少带' },
    { value: 'reissue', label: '补发' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="调整库存" size="md">
      <div className="space-y-5">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <Package className="w-7 h-7 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{material.name}</h3>
            <p className="text-sm text-gray-400">当前库存: {material.remainingQuantity} 件</p>
          </div>
        </div>

        <Select
          label="调整类型"
          value={type}
          onChange={(e) => setType(e.target.value as InventoryLogType)}
          options={typeOptions}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            调整数量
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center text-lg font-semibold"
              min={1}
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
            >
              <span className="text-xl leading-none">+</span>
            </button>
            <span className="text-gray-400 text-sm ml-2">件</span>
          </div>
        </div>

        <TextArea
          label="原因说明"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="请输入调整原因..."
          rows={3}
        />

        {(type === 'damaged' || type === 'missing') && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">注意</p>
              <p className="text-xs text-gray-400 mt-1">
                {INVENTORY_LOG_TYPE_LABELS[type]}将减少库存数量 {quantity} 件。
                调整后库存将变为 {material.remainingQuantity - quantity} 件。
              </p>
            </div>
          </div>
        )}

        {type === 'reissue' && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">补发说明</p>
              <p className="text-xs text-gray-400 mt-1">
                补发将额外减少库存 {quantity} 件，请确认补发原因。
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            取消
          </Button>
          <Button variant="gradient" fullWidth onClick={handleSubmit} isLoading={isSubmitting}>
            确认调整
          </Button>
        </div>
      </div>
    </Modal>
  );
}
