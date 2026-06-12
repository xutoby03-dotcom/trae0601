import Modal from '../ui/Modal';
import { useState, useEffect } from 'react';
import type { Vaccine } from '@/types';
import { Calendar, AlertOctagon, History } from 'lucide-react';
import { formatDate, addDays } from '@/utils/date';

interface DelayModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    suggestedDate: string;
    latestDate: string;
  }) => void;
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
  const [suggestedDate, setSuggestedDate] = useState('');
  const [latestDate, setLatestDate] = useState('');

  useEffect(() => {
    if (open && vaccine) {
      setReason(vaccine.delayedReason || '');
      const defaultDelayDays = 14;
      setSuggestedDate(
        vaccine.suggestedDate > formatDate(new Date().toISOString())
          ? addDays(vaccine.suggestedDate, defaultDelayDays)
          : addDays(formatDate(new Date().toISOString()), defaultDelayDays),
      );
      setLatestDate(addDays(vaccine.latestDate, defaultDelayDays));
    }
  }, [open, vaccine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('请填写延期原因');
      return;
    }
    if (!suggestedDate || !latestDate) {
      alert('请填写延期后的推荐接种日和最晚日');
      return;
    }
    if (new Date(latestDate) < new Date(suggestedDate)) {
      alert('最晚日期不能早于推荐日期');
      return;
    }
    onSubmit({
      reason: reason.trim(),
      suggestedDate,
      latestDate,
    });
    onClose();
  };

  const hasOriginal =
    vaccine?.originalSuggestedDate && vaccine?.originalLatestDate;
  const showOriginalSuggested =
    hasOriginal && vaccine!.originalSuggestedDate !== vaccine!.suggestedDate;
  const showOriginalLatest =
    hasOriginal && vaccine!.originalLatestDate !== vaccine!.latestDate;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`登记延期：${vaccine?.name || ''} 第${vaccine?.dose || ''}剂`}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            取消
          </button>
          <button type="button" onClick={handleSubmit} className="btn-danger btn-sm">
            确认延期并更新日期
          </button>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="p-4 rounded-xl bg-danger-50/60 border border-danger-100">
          <p className="text-sm text-danger-700">
            此疫苗已延期 <span className="font-semibold">{vaccine?.delayedCount || 0}</span> 次。
            请填写延期原因以及推迟后的推荐/最晚接种日期。
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
          <label className="label">
            延期原因 <span className="text-danger-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="请详细描述延期原因，便于后续统计和提醒"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="label flex items-center gap-2">
              <Calendar className="w-4 h-4 text-info-500" />
              延期后推荐接种日 <span className="text-danger-500">*</span>
            </label>
            <input
              type="date"
              value={suggestedDate}
              onChange={(e) => setSuggestedDate(e.target.value)}
              className="input"
            />
            <div className="mt-2 space-y-1">
              {showOriginalSuggested && vaccine && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <History className="w-3 h-3" />
                  <span>
                    原计划：
                    <span className="line-through text-slate-400">
                      {vaccine.originalSuggestedDate}
                    </span>
                    <span className="text-slate-400 mx-1">→</span>
                    现计划：<span className="font-medium text-info-600">{vaccine.suggestedDate}</span>
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-400">
                建议在孩子完全康复并停药 3-7 天后再预约
              </p>
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-danger-500" />
              延期后最晚接种日 <span className="text-danger-500">*</span>
            </label>
            <input
              type="date"
              value={latestDate}
              onChange={(e) => setLatestDate(e.target.value)}
              className="input"
            />
            <div className="mt-2 space-y-1">
              {showOriginalLatest && vaccine && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <History className="w-3 h-3" />
                  <span>
                    原最晚：
                    <span className="line-through text-slate-400">
                      {vaccine.originalLatestDate}
                    </span>
                    <span className="text-slate-400 mx-1">→</span>
                    现最晚：<span className="font-medium text-danger-600">{vaccine.latestDate}</span>
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-400">
                注意：超过此日期系统将标记为逾期
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500 leading-relaxed">
            💡 <span className="font-medium text-slate-600">家人对比说明：</span>
            保存后，原始日期会被保留在疫苗卡中，家里人可以随时查看原计划和延期后的对比，
            提醒区和下次接种预告都会按新日期计算。
          </p>
        </div>
      </form>
    </Modal>
  );
}
