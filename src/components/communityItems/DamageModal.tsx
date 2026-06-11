import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { CommunityItem, DamageRecord } from '../../types/communityItem';
import { roommates } from '../../store/useCommunityItemStore';
import { formatCurrency } from '../../utils/format';

interface DamageModalProps {
  open: boolean;
  onClose: () => void;
  item: CommunityItem | null;
  onSubmit: (
    itemId: string,
    data: Omit<DamageRecord, 'id' | 'itemId' | 'reportedAt' | 'settled'>
  ) => void;
}

export const DamageModal = ({ open, onClose, item, onSubmit }: DamageModalProps) => {
  const [formData, setFormData] = useState({
    reporter: roommates[0].name,
    responsiblePerson: roommates[0].name,
    description: '',
    compensationPlan: '',
    compensationAmount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        reporter: roommates[0].name,
        responsiblePerson: roommates[0].name,
        description: '',
        compensationPlan: '',
        compensationAmount: '',
      });
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.reporter) newErrors.reporter = '请选择报备人';
    if (!formData.responsiblePerson) newErrors.responsiblePerson = '请选择责任人';
    if (!formData.description.trim()) newErrors.description = '请描述损坏情况';
    if (!formData.compensationPlan.trim()) newErrors.compensationPlan = '请填写赔付方案';
    if (!formData.compensationAmount || parseFloat(formData.compensationAmount) < 0) {
      newErrors.compensationAmount = '请输入有效赔付金额';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !validate()) return;
    onSubmit(item.id, {
      reporter: formData.reporter,
      responsiblePerson: formData.responsiblePerson,
      description: formData.description.trim(),
      compensationPlan: formData.compensationPlan.trim(),
      compensationAmount: parseFloat(formData.compensationAmount),
    });
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`「${item.name}」损坏报备`}
      size="lg"
      footer={
        <div className="flex gap-3">
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-danger flex-1" onClick={handleSubmit}>
            确认报备
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-4 bg-danger-50 border border-danger-100 rounded-xl">
          <h5 className="text-sm font-semibold text-danger-700 mb-1">🚨 物品损坏报备</h5>
          <p className="text-sm text-danger-600">
            请如实填写损坏情况和责任人。损坏记录关系到赔付，请认真核对。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">报备人 *</label>
            <select
              className={`input ${errors.reporter ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.reporter}
              onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
            >
              {roommates.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.reporter && <p className="mt-1 text-sm text-danger-600">{errors.reporter}</p>}
          </div>

          <div>
            <label className="label">责任人 *</label>
            <select
              className={`input ${errors.responsiblePerson ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.responsiblePerson}
              onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
            >
              {roommates.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.responsiblePerson && (
              <p className="mt-1 text-sm text-danger-600">{errors.responsiblePerson}</p>
            )}
          </div>
        </div>

        <div>
          <label className="label">损坏情况描述 *</label>
          <textarea
            rows={3}
            placeholder="请详细描述损坏情况，例如：左侧 Joy-Con 摇杆漂移，操作不灵敏"
            className={`input resize-none ${errors.description ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          {errors.description && <p className="mt-1 text-sm text-danger-600">{errors.description}</p>}
        </div>

        <div>
          <label className="label">赔付方案 *</label>
          <textarea
            rows={2}
            placeholder="例如：购买第三方摇杆维修服务，约150元，李四全额承担"
            className={`input resize-none ${errors.compensationPlan ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            value={formData.compensationPlan}
            onChange={(e) => setFormData({ ...formData, compensationPlan: e.target.value })}
          />
          {errors.compensationPlan && (
            <p className="mt-1 text-sm text-danger-600">{errors.compensationPlan}</p>
          )}
        </div>

        <div>
          <label className="label">赔付金额 (元) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={`input ${errors.compensationAmount ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            value={formData.compensationAmount}
            onChange={(e) => setFormData({ ...formData, compensationAmount: e.target.value })}
          />
          {errors.compensationAmount && (
            <p className="mt-1 text-sm text-danger-600">{errors.compensationAmount}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            物品原价值：{formatCurrency(item.price)}
          </p>
        </div>
      </form>
    </Modal>
  );
};
