import { useState, useEffect } from 'react';
import { AlertTriangle, Ban, DollarSign } from 'lucide-react';
import { Modal } from '../ui/Modal';
import type { Visitor } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';

interface LossFormProps {
  open: boolean;
  onClose: () => void;
  visitor: Visitor | null;
}

export const LossForm = ({ open, onClose, visitor }: LossFormProps) => {
  const reportLost = useBadgeStore((s) => s.reportLost);
  const getBadgeById = useBadgeStore((s) => s.getBadgeById);

  const [compensation, setCompensation] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const badge = visitor ? getBadgeById(visitor.badgeId) : undefined;

  useEffect(() => {
    if (visitor && badge) {
      setCompensation(String(badge.deposit));
    }
  }, [visitor, badge]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!compensation || Number(compensation) < 0) {
      newErrors.compensation = '请输入有效的赔付金额';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!visitor || !validate()) return;

    reportLost({
      badgeId: visitor.badgeId,
      visitorId: visitor.id,
      compensation: Number(compensation),
      remark: remark.trim() || undefined,
    });

    setCompensation('');
    setRemark('');
    setErrors({});
    onClose();
  };

  if (!visitor || !badge) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="工牌遗失登记"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-danger">
            确认遗失并停用
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-xl">
          <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-neutral-800 mb-0.5">
              遗失登记后将立即停用该工牌
            </p>
            <p className="text-xs text-neutral-500">
              工牌门禁权限将被撤销，系统将记录赔付信息并触发补办流程。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
          <div
            className="w-14 h-20 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-md opacity-60"
            style={{ backgroundColor: badge.colorHex }}
          >
            {badge.number}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-neutral-800 mb-1">{visitor.name}</h4>
            <p className="text-sm text-neutral-600 mb-1">{visitor.company}</p>
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Ban size={12} />
                即将停用
              </span>
              <span>{badge.allowedArea}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base flex items-center gap-1.5">
              <DollarSign size={14} />
              赔付金额 (元) *
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={compensation}
              onChange={(e) => {
                setCompensation(e.target.value);
                if (errors.compensation) setErrors({});
              }}
              placeholder="请输入赔付金额"
              className={`input-base ${errors.compensation ? 'border-danger focus:ring-danger/30' : ''}`}
            />
            {errors.compensation && (
              <p className="text-xs text-danger mt-1">{errors.compensation}</p>
            )}
            <p className="text-xs text-neutral-400 mt-1">
              建议金额：押金 ¥{badge.deposit}
            </p>
          </div>
          <div>
            <label className="label-base">押金</label>
            <div className="input-base bg-neutral-50 text-neutral-500">
              ¥ {badge.deposit}
            </div>
          </div>
        </div>

        <div>
          <label className="label-base">备注</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="遗失情况说明、补办需求等（选填）"
            rows={3}
            className="input-base resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
