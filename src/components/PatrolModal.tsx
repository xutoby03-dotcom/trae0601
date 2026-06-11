import { useEffect, useState } from 'react';
import { X, Camera, Clock, FileWarning, Upload, CheckCircle, AlertTriangle, Phone, ArrowRightCircle } from 'lucide-react';
import type { StrollerStatus } from '@/types';
import { useStrollerStore } from '@/store/useStrollerStore';
import { STATUS_OPTIONS } from '@/utils/constants';
import { formatDateTimeForInput, readFileAsDataURL, cn, formatDateTime } from '@/utils/helpers';

export default function PatrolModal() {
  const { activePatrolStrollerId, setActivePatrol, getStrollerById, addPatrolRecord } =
    useStrollerStore();
  const stroller = activePatrolStrollerId ? getStrollerById(activePatrolStrollerId) : null;

  const [status, setStatus] = useState<StrollerStatus>('normal');
  const [remark, setRemark] = useState('');
  const [handleTime, setHandleTime] = useState(formatDateTimeForInput());
  const [scenePhotos, setScenePhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const isOpen = activePatrolStrollerId !== null;
  const isBlocking = status === 'blocking';

  useEffect(() => {
    if (isOpen) {
      setStatus('normal');
      setRemark('');
      setHandleTime(formatDateTimeForInput());
      setScenePhotos([]);
    }
  }, [isOpen, activePatrolStrollerId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => readFileAsDataURL(f)));
      setScenePhotos((prev) => [...prev, ...urls]);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (idx: number) => {
    setScenePhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit = !isBlocking || (scenePhotos.length > 0 && handleTime !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stroller) return;
    if (isBlocking && scenePhotos.length === 0) {
      alert('挡路记录必须上传至少一张现场照片');
      return;
    }
    if (isBlocking && !handleTime) {
      alert('挡路记录必须填写处理时间');
      return;
    }
    addPatrolRecord({
      strollerId: stroller.id,
      status,
      remark,
      handleTime: isBlocking ? new Date(handleTime).toISOString() : undefined,
      scenePhotos: isBlocking ? scenePhotos : [],
    });
    setActivePatrol(null);
  };

  if (!isOpen || !stroller) return null;

  const statusIcons: Record<StrollerStatus, React.ReactNode> = {
    normal: <CheckCircle className="w-8 h-8" />,
    blocking: <AlertTriangle className="w-8 h-8" />,
    pending: <Phone className="w-8 h-8" />,
    moved: <ArrowRightCircle className="w-8 h-8" />,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up"
      onClick={() => setActivePatrol(null)}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto card animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">巡查标记</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {stroller.building} {stroller.room} · {stroller.model}（{stroller.color}）
            </p>
          </div>
          <button
            onClick={() => setActivePatrol(null)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label mb-3">选择巡查状态</label>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                    status === s.value
                      ? `${s.bgClass} text-white border-transparent shadow-lg scale-[1.02]`
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {statusIcons[s.value]}
                  <span className="font-bold">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {isBlocking && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl space-y-4 animate-fade-in-up">
              <div className="flex items-start gap-3">
                <FileWarning className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-700">挡路记录强校验</div>
                  <div className="text-xs text-red-600 mt-0.5">
                    选择「挡路」状态必须上传现场照片并填写处理时间，不可只填写文字提醒
                  </div>
                </div>
              </div>

              <div>
                <label className="label flex items-center gap-1">
                  <Clock className="w-4 h-4 text-red-500" />
                  处理时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="input border-red-200 bg-red-50/30 focus:ring-red-400"
                  value={handleTime}
                  onChange={(e) => setHandleTime(e.target.value)}
                />
                {handleTime && (
                  <p className="text-xs text-slate-500 mt-1">
                    记录处理时间：{formatDateTime(new Date(handleTime).toISOString())}
                  </p>
                )}
              </div>

              <div>
                <label className="label flex items-center gap-1">
                  <Camera className="w-4 h-4 text-red-500" />
                  现场照片 <span className="text-red-500">*</span>
                  <span className="text-xs text-slate-400 font-normal ml-auto">
                    至少上传 1 张，当前 {scenePhotos.length} 张
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {scenePhotos.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-white border border-red-200 group"
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <label
                    className={cn(
                      'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all',
                      scenePhotos.length === 0
                        ? 'border-red-300 bg-red-50/50 text-red-500 hover:border-red-500'
                        : 'border-slate-300 text-slate-400 hover:border-brand-500 hover:text-brand-600'
                    )}
                  >
                    {uploading ? (
                      <div className="text-xs">上传中...</div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 mb-1" />
                        <span className="text-xs font-medium">拍照/上传</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="label">备注说明</label>
            <textarea
              className="input min-h-[90px] resize-none py-3"
              placeholder={
                isBlocking
                  ? '请详细描述占道情况、处理措施等...'
                  : '填写巡查备注（选填）...'
              }
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setActivePatrol(null)}>
              取消
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'btn-primary',
                !canSubmit && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
              )}
            >
              确认提交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
