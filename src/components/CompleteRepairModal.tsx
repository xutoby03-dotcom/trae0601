import { useState, useEffect } from 'react';
import { X, CheckCircle, Image as ImageIcon, DollarSign } from 'lucide-react';
import type { Repair } from '@/types';

interface CompleteRepairModalProps {
  repair: Repair;
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { afterPhoto: string; cost: number }) => void;
}

export default function CompleteRepairModal({ repair, open, onClose, onConfirm }: CompleteRepairModalProps) {
  const [afterPhoto, setAfterPhoto] = useState('');
  const [cost, setCost] = useState(repair?.cost ?? 0);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (open && repair) {
      setAfterPhoto(repair.afterPhoto || '');
      setCost(repair.cost);
    }
  }, [open, repair]);

  useEffect(() => {
    setPreviewUrl(afterPhoto);
  }, [afterPhoto]);

  if (!open || !repair) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!afterPhoto.trim()) {
      alert('请填写维修完成照片');
      return;
    }
    onConfirm({ afterPhoto: afterPhoto.trim(), cost });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">完成维修确认</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <span className="font-medium">设备编号：</span>
              {repair.id}
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              {repair.faultDescription}
            </p>
          </div>

          <div>
            <label className="label">
              <ImageIcon className="w-4 h-4" />
              维修完成照片 *
            </label>
            <input
              type="url"
              value={afterPhoto}
              onChange={(e) => setAfterPhoto(e.target.value)}
              placeholder="请输入维修完成后的照片URL"
              className="input"
              required
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="维修完成照片预览"
                  className="w-full h-36 object-cover rounded-xl border border-slate-200 bg-slate-50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">* 必须上传完成照片才能关闭维修单</p>
          </div>

          <div>
            <label className="label">
              <DollarSign className="w-4 h-4" />
              维修费用（元）
            </label>
            <input
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              placeholder="请输入实际维修费用"
              className="input"
            />
            <p className="text-xs text-slate-400 mt-1">如已有预估费用，可在此确认或修改</p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-success">
              <CheckCircle className="w-4 h-4" />
              确认完成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
