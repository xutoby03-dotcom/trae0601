import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { CommunityItem, BorrowRecord } from '../../types/communityItem';
import { roommates, fragilityLabels } from '../../store/useCommunityItemStore';
import { formatCurrency } from '../../utils/format';

interface BorrowItemModalProps {
  open: boolean;
  onClose: () => void;
  item: CommunityItem | null;
  onSubmit: (
    itemId: string,
    data: Omit<BorrowRecord, 'id' | 'itemId' | 'returned' | 'cleanedOnReturn' | 'undamagedOnReturn'>
  ) => void;
}

export const BorrowItemModal = ({ open, onClose, item, onSubmit }: BorrowItemModalProps) => {
  const [formData, setFormData] = useState({
    borrower: roommates[0].name,
    startTime: '',
    endTime: '',
    purpose: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const now = new Date();
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      setFormData({
        borrower: roommates[0].name,
        startTime: now.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16),
        purpose: '',
      });
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.borrower) newErrors.borrower = '请选择借用人';
    if (!formData.startTime) newErrors.startTime = '请选择开始时间';
    if (!formData.endTime) newErrors.endTime = '请选择结束时间';
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = '结束时间必须晚于开始时间';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !validate()) return;
    onSubmit(item.id, {
      borrower: formData.borrower,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      purpose: formData.purpose.trim() || undefined,
    });
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`借用「${item.name}」`}
      size="md"
      footer={
        <div className="flex gap-3">
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary flex-1" onClick={handleSubmit}>
            确认借用
          </button>
        </div>
      }
    >
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
            {item.photoUrl ? (
              <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
            <div className="space-y-1 text-sm text-gray-500">
              <p>存放位置：{item.storageLocation}</p>
              <p>购买人：{item.purchaser} · {formatCurrency(item.price)}</p>
              <p>易损程度：<span className={fragilityLabels[item.fragility].color}>{fragilityLabels[item.fragility].label}</span></p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">借用人 *</label>
          <select
            className={`input ${errors.borrower ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            value={formData.borrower}
            onChange={(e) => setFormData({ ...formData, borrower: e.target.value })}
          >
            {roommates.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          {errors.borrower && <p className="mt-1 text-sm text-danger-600">{errors.borrower}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">开始时间 *</label>
            <input
              type="datetime-local"
              className={`input ${errors.startTime ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            {errors.startTime && <p className="mt-1 text-sm text-danger-600">{errors.startTime}</p>}
          </div>
          <div>
            <label className="label">预计归还 *</label>
            <input
              type="datetime-local"
              className={`input ${errors.endTime ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
            {errors.endTime && <p className="mt-1 text-sm text-danger-600">{errors.endTime}</p>}
          </div>
        </div>

        <div>
          <label className="label">使用用途</label>
          <input
            type="text"
            placeholder="例如：周末看电影 / 晚餐炸鸡"
            className="input"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          />
        </div>

        <div className="p-4 bg-warning-50 border border-warning-100 rounded-xl">
          <h5 className="text-sm font-semibold text-warning-700 mb-2">⚠️ 使用须知</h5>
          <div className="text-sm text-warning-600 whitespace-pre-line">
            {item.usageRules}
          </div>
        </div>
      </form>
    </Modal>
  );
};
