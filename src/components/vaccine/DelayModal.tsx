import Modal from '../ui/Modal';
import { useState, useEffect } from 'react';
import type { Vaccine } from '@/types';

interface DelayModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  vaccine?: Vaccine | null;
}

const REASON_PRESETS = [
  '感冒 / 发热',
  '咳嗽 / 流涕',
  '腹泻 / 肠胃不适',
  '湿疹 / 皮疹',
  '正在服药 / 抗生素治疗中',
  '其他原因',
];

export default function DelayModal({
  open,
  onClose,
  onSubmit,
  vaccine,
}: DelayModalProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason(vaccine?.delayedReason || '');
    }
  }, [open, vaccine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('请填写延期原因');
      return;
    }
    onSubmit(reason.trim());
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`登记延期：${vaccine?.name || ''} 第${vaccine?.dose || ''}剂`}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-danger btn-sm"
          >
            确认延期
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="p-4 rounded-xl bg-danger-50/60 border border-danger-100 mb-2">
          <p className="text-sm text-danger-700">
            此疫苗已延期 {vaccine?.delayedCount || 0} 次。延期后请记得更新最晚日期。
          </p>
        </div>

        <div>
          <label className="label">选择常见原因</label>
          <div className="flex flex-wrap gap-2">
            {REASON_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setReason(p)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  reason === p
                    ? 'bg-danger-100 text-danger-700 border-danger-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-danger-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">延期原因 *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="请详细描述延期原因，便于后续统计和提醒"
          />
        </div>
      </form>
    </Modal>
  );
}
