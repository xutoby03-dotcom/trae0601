import Modal from '../ui/Modal';
import PhotoUpload from '../ui/PhotoUpload';
import { useState, useEffect } from 'react';
import type { Vaccine } from '@/types';
import { formatDate } from '@/utils/date';

interface CompleteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    actualDate: string;
    proofPhoto?: string;
    reaction?: string;
  }) => void;
  vaccine?: Vaccine | null;
}

export default function CompleteModal({
  open,
  onClose,
  onSubmit,
  vaccine,
}: CompleteModalProps) {
  const [actualDate, setActualDate] = useState('');
  const [proofPhoto, setProofPhoto] = useState('');
  const [reaction, setReaction] = useState('');

  useEffect(() => {
    if (open) {
      setActualDate(vaccine?.actualDate || formatDate(new Date().toISOString()));
      setProofPhoto(vaccine?.proofPhoto || '');
      setReaction(vaccine?.reaction || '');
    }
  }, [open, vaccine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualDate) {
      alert('请填写实际接种日期');
      return;
    }
    onSubmit({
      actualDate,
      proofPhoto: proofPhoto || undefined,
      reaction: reaction.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`完成接种：${vaccine?.name || ''} 第${vaccine?.dose || ''}剂`}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary btn-sm"
          >
            确认完成
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100 mb-2">
          <p className="text-sm text-primary-700">
            恭喜完成 {vaccine?.name} 第{vaccine?.dose}剂接种！
          </p>
        </div>
        <div>
          <label className="label">实际接种日期 *</label>
          <input
            type="date"
            value={actualDate}
            onChange={(e) => setActualDate(e.target.value)}
            className="input"
          />
        </div>
        <PhotoUpload
          value={proofPhoto}
          onChange={setProofPhoto}
          label="接种凭证照片"
          placeholder="上传疫苗本记录页 / 电子凭证"
        />
        <div>
          <label className="label">接种后反应（可选）</label>
          <textarea
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="如：轻微发热、接种部位红肿等，便于后续参考"
          />
        </div>
      </form>
    </Modal>
  );
}
