import { useState, useEffect } from 'react';
import { X, Camera, Clock, AlertTriangle } from 'lucide-react';
import type { PatrolPoint } from '@/types/patrol';
import { formatTime, getRiskLevelText, getRiskLevelColor } from '@/utils/helpers';

interface CheckInModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    isAbnormal: boolean;
    abnormalDescription?: string;
    handlingResult?: string;
    photoUrl?: string;
  }) => void;
  point: PatrolPoint | null;
}

export default function CheckInModal({ open, onClose, onSubmit, point }: CheckInModalProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [abnormalDescription, setAbnormalDescription] = useState('');
  const [handlingResult, setHandlingResult] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (!open) return;
    setCurrentTime(new Date());
    setIsAbnormal(false);
    setAbnormalDescription('');
    setHandlingResult('');
    setPhotoUrl('');
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [open, point]);

  if (!open || !point) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      isAbnormal,
      abnormalDescription: isAbnormal ? abnormalDescription : undefined,
      handlingResult: isAbnormal ? handlingResult : undefined,
      photoUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{point.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`tag ${getRiskLevelColor(point.riskLevel)} !text-[10px]`}>
                  {getRiskLevelText(point.riskLevel)}
                </span>
                <span className="text-xs text-slate-400">建议 {point.suggestedTime}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-b border-slate-700/30">
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-1">打卡时间</p>
            <p className="text-4xl font-bold text-white tracking-wider font-mono">
              {formatTime(currentTime)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-700/30 cursor-pointer hover:border-orange-500/50 transition-colors">
              <input
                type="checkbox"
                checked={isAbnormal}
                onChange={(e) => setIsAbnormal(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-orange-500 focus:ring-orange-500/50"
              />
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-white text-sm font-medium">发现异常情况</span>
              </div>
            </label>
          </div>

          {isAbnormal && (
            <div className="space-y-4 p-4 rounded-xl bg-orange-950/20 border border-orange-900/30 animate-fade-in-up">
              <div>
                <label className="label-text">异常描述 <span className="text-red-400">*</span></label>
                <textarea
                  value={abnormalDescription}
                  onChange={(e) => setAbnormalDescription(e.target.value)}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="请详细描述发现的异常情况..."
                  required={isAbnormal}
                />
              </div>
              <div>
                <label className="label-text">现场处理结果</label>
                <textarea
                  value={handlingResult}
                  onChange={(e) => setHandlingResult(e.target.value)}
                  className="input-field min-h-[60px] resize-none"
                  placeholder="已采取的临时处理措施..."
                />
              </div>
            </div>
          )}

          <div>
            <label className="label-text">现场照片</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600 text-slate-300 hover:border-slate-500 transition-colors text-sm"
              >
                <Camera className="w-4 h-4" />
                拍照
              </button>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="input-field flex-1"
                placeholder="或填写图片URL（可选）"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-success flex-1">
              确认打卡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
