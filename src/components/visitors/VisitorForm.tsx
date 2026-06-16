import { useState } from 'react';
import { Modal } from '../ui/Modal';
import type { Badge } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';
import { addHours, formatDateForInput, parseFromInput } from '../../utils/time';

interface VisitorFormProps {
  open: boolean;
  onClose: () => void;
}

export const VisitorForm = ({ open, onClose }: VisitorFormProps) => {
  const checkInVisitor = useBadgeStore((s) => s.checkInVisitor);
  const availableBadges = useBadgeStore((s) => s.getAvailableBadges());

  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    hostName: '',
    badgeId: '',
    expectedLeaveTime: formatDateForInput(addHours(new Date(), 2)),
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = '请输入访客姓名';
    if (!form.company.trim()) newErrors.company = '请输入公司名称';
    if (!form.phone.trim()) newErrors.phone = '请输入手机号';
    else if (!/^1[3-9]\d{9}$/.test(form.phone)) newErrors.phone = '手机号格式不正确';
    if (!form.hostName.trim()) newErrors.hostName = '请输入拜访对象';
    if (!form.badgeId) newErrors.badgeId = '请选择发放的工牌';
    if (!form.expectedLeaveTime) newErrors.expectedLeaveTime = '请选择预计离开时间';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    checkInVisitor({
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      hostName: form.hostName.trim(),
      badgeId: form.badgeId,
      expectedLeaveTime: parseFromInput(form.expectedLeaveTime),
      notes: form.notes.trim() || undefined,
    });

    setForm({
      name: '',
      company: '',
      phone: '',
      hostName: '',
      badgeId: '',
      expectedLeaveTime: formatDateForInput(addHours(new Date(), 2)),
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="访客登记"
      maxWidth="max-w-xl"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            确认登记并发牌
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">访客姓名 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入访客姓名"
              className={`input-base ${errors.name ? 'border-danger focus:ring-danger/30' : ''}`}
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="label-base">所属公司 *</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="请输入公司名称"
              className={`input-base ${errors.company ? 'border-danger focus:ring-danger/30' : ''}`}
            />
            {errors.company && <p className="text-xs text-danger mt-1">{errors.company}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">手机号 *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="请输入手机号"
              className={`input-base ${errors.phone ? 'border-danger focus:ring-danger/30' : ''}`}
            />
            {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="label-base">拜访对象 *</label>
            <input
              type="text"
              value={form.hostName}
              onChange={(e) => handleChange('hostName', e.target.value)}
              placeholder="请输入接待人姓名"
              className={`input-base ${errors.hostName ? 'border-danger focus:ring-danger/30' : ''}`}
            />
            {errors.hostName && <p className="text-xs text-danger mt-1">{errors.hostName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">发放工牌 *</label>
            <select
              value={form.badgeId}
              onChange={(e) => handleChange('badgeId', e.target.value)}
              className={`input-base ${errors.badgeId ? 'border-danger focus:ring-danger/30' : ''}`}
            >
              <option value="">请选择工牌</option>
              {availableBadges.length === 0 ? (
                <option value="" disabled>暂无可用工牌</option>
              ) : (
                availableBadges.map((badge: Badge) => (
                  <option key={badge.id} value={badge.id}>
                    {badge.number} - {badge.color} - {badge.allowedArea} (押金¥{badge.deposit})
                  </option>
                ))
              )}
            </select>
            {errors.badgeId && <p className="text-xs text-danger mt-1">{errors.badgeId}</p>}
          </div>
          <div>
            <label className="label-base">预计离开时间 *</label>
            <input
              type="datetime-local"
              value={form.expectedLeaveTime}
              onChange={(e) => handleChange('expectedLeaveTime', e.target.value)}
              className={`input-base ${errors.expectedLeaveTime ? 'border-danger focus:ring-danger/30' : ''}`}
            />
            {errors.expectedLeaveTime && <p className="text-xs text-danger mt-1">{errors.expectedLeaveTime}</p>}
          </div>
        </div>

        <div>
          <label className="label-base">备注</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="其他备注信息（选填）"
            rows={2}
            className="input-base resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
