import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { CommunityItem, BorrowRecord } from '../../types/communityItem';
import { formatDateTime } from '../../utils/format';

interface ReturnItemModalProps {
  open: boolean;
  onClose: () => void;
  item: CommunityItem | null;
  borrowRecord: BorrowRecord | null;
  onSubmit: (
    borrowId: string,
    data: { cleanedOnReturn: boolean; undamagedOnReturn: boolean; returnNote?: string }
  ) => void;
}

export const ReturnItemModal = ({
  open,
  onClose,
  item,
  borrowRecord,
  onSubmit,
}: ReturnItemModalProps) => {
  const [formData, setFormData] = useState({
    cleanedOnReturn: false,
    undamagedOnReturn: true,
    returnNote: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        cleanedOnReturn: false,
        undamagedOnReturn: true,
        returnNote: '',
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowRecord) return;
    onSubmit(borrowRecord.id, {
      cleanedOnReturn: formData.cleanedOnReturn,
      undamagedOnReturn: formData.undamagedOnReturn,
      returnNote: formData.returnNote.trim() || undefined,
    });
    onClose();
  };

  if (!item || !borrowRecord) return null;

  const canSubmit = formData.undamagedOnReturn;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`归还「${item.name}」`}
      size="md"
      footer={
        <div className="flex gap-3">
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            取消
          </button>
          <button
            className={`btn flex-1 ${canSubmit ? 'btn-primary' : 'btn-danger'}`}
            onClick={handleSubmit}
          >
            {canSubmit
              ? formData.cleanedOnReturn
                ? '确认归还（状态正常）'
                : '确认归还（需清洁）'
              : '确认归还（需报损坏）'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">借用人</p>
              <p className="font-medium text-gray-900">{borrowRecord.borrower}</p>
            </div>
            <div>
              <p className="text-gray-500">借用时段</p>
              <p className="font-medium text-gray-900">
                {formatDateTime(borrowRecord.startTime)} ~ {formatDateTime(borrowRecord.endTime)}
              </p>
            </div>
            {borrowRecord.purpose && (
              <div className="col-span-2">
                <p className="text-gray-500">用途</p>
                <p className="font-medium text-gray-900">{borrowRecord.purpose}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label mb-2">归还状态检查</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  checked={formData.cleanedOnReturn}
                  onChange={(e) => setFormData({ ...formData, cleanedOnReturn: e.target.checked })}
                />
                <div>
                  <p className="font-medium text-gray-900">🧹 已清理干净</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    物品已按规矩清洁、配件齐全、放回原位
                  </p>
                  {!formData.cleanedOnReturn && (
                    <p className="text-sm text-warning-600 mt-1">
                      ⚠️ 未勾选则物品将进入「待清洁」状态，需有人清理后才可再次借用
                    </p>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  checked={formData.undamagedOnReturn}
                  onChange={(e) => setFormData({ ...formData, undamagedOnReturn: e.target.checked })}
                />
                <div>
                  <p className="font-medium text-gray-900">✅ 物品完好无损</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    外观、功能一切正常，无任何损坏或异常
                  </p>
                  {!formData.undamagedOnReturn && (
                    <p className="text-sm text-danger-600 mt-1">
                      ⚠️ 如发现损坏，归还后需在下一步填写损坏记录并登记赔付
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="label">备注说明</label>
            <textarea
              rows={3}
              placeholder="有什么想说的？例如：遥控器电池没电了，下次记得换"
              className="input resize-none"
              value={formData.returnNote}
              onChange={(e) => setFormData({ ...formData, returnNote: e.target.value })}
            />
          </div>

          {!formData.cleanedOnReturn || !formData.undamagedOnReturn ? (
            <div
              className={`p-4 rounded-xl border ${
                !formData.undamagedOnReturn
                  ? 'bg-danger-50 border-danger-100'
                  : 'bg-warning-50 border-warning-100'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  !formData.undamagedOnReturn ? 'text-danger-700' : 'text-warning-700'
                }`}
              >
                {!formData.undamagedOnReturn
                  ? '🔴 物品将标记为「待赔付」，请尽快填写损坏记录'
                  : '🟡 物品将标记为「待清洁」，清理后恢复可用'}
              </p>
            </div>
          ) : null}
        </form>
      </div>
    </Modal>
  );
};
