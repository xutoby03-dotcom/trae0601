import { CheckCircle2, Shield, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import type { Visitor } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';
import { formatTime, getDuration } from '../../utils/time';

interface ReturnConfirmProps {
  open: boolean;
  onClose: () => void;
  visitor: Visitor | null;
}

export const ReturnConfirm = ({ open, onClose, visitor }: ReturnConfirmProps) => {
  const confirmReturn = useBadgeStore((s) => s.confirmReturn);
  const getBadgeById = useBadgeStore((s) => s.getBadgeById);

  if (!visitor) return null;

  const badge = getBadgeById(visitor.badgeId);

  const handleConfirm = () => {
    confirmReturn(visitor.id);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="确认归还工牌"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleConfirm} className="btn-success">
            <CheckCircle2 size={16} className="mr-1.5" />
            确认归还
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
          <div
            className="w-14 h-20 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-md"
            style={{ backgroundColor: badge?.colorHex }}
          >
            {badge?.number}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-neutral-800">{visitor.name}</h4>
              <span className="tag-warning">在场</span>
            </div>
            <p className="text-sm text-neutral-600 mb-1">{visitor.company}</p>
            <p className="text-xs text-neutral-500 flex items-center gap-1">
              <User size={12} />
              拜访：{visitor.hostName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">入场时间</p>
            <p className="font-medium text-neutral-800 font-mono">
              {formatTime(visitor.checkInTime)}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">停留时长</p>
            <p className="font-medium text-neutral-800 font-mono">
              {getDuration(visitor.checkInTime)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-success/5 border border-success/20 rounded-xl">
          <Shield size={20} className="text-success shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-neutral-800 mb-0.5">
              归还后将自动关闭门禁权限
            </p>
            <p className="text-xs text-neutral-500">
              系统将同步撤销该工牌的所有门禁访问权限，请确认工牌已物理回收。
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
