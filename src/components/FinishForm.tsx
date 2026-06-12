import { useState, useMemo } from 'react';
import { X, Minus, Plus, AlertTriangle } from 'lucide-react';
import type { Batch, FinishBatchInput } from '@/types';
import { useBatchStore } from '@/store/batchStore';
import ColorGradePicker from './ColorGradePicker';
import CameraCapture from './CameraCapture';

interface FinishFormProps {
  batch: Batch;
  onClose: () => void;
}

export default function FinishForm({ batch, onClose }: FinishFormProps) {
  const { finishBatch } = useBatchStore();

  const actualDuration = useMemo(() => {
    const start = new Date(batch.startTime).getTime();
    return Math.max(1, Math.round((Date.now() - start) / 60000));
  }, [batch.startTime]);

  const [duration, setDuration] = useState(actualDuration);
  const [colorGrade, setColorGrade] = useState<'light' | 'good' | 'dark' | 'burnt'>('good');
  const [lossQuantity, setLossQuantity] = useState(0);
  const [lossReason, setLossReason] = useState('');
  const [finishPhoto, setFinishPhoto] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lossQuantity > batch.quantity) {
      alert('报损数量不能大于总数量');
      return;
    }
    const input: FinishBatchInput = {
      actualDuration: duration,
      colorGrade,
      lossQuantity,
      lossReason: lossReason.trim() || undefined,
      finishPhoto,
    };
    finishBatch(batch.id, input);
    onClose();
  };

  const overtime = duration - Math.round(batch.targetDuration / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-copper-100 px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="font-display text-2xl font-bold text-espresso-800">出炉记录</h2>
            <p className="text-sm text-espresso-500">
              {batch.productName} · {batch.quantity}个 · 目标 {Math.round(batch.targetDuration / 60)}分钟
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-copper-100 text-espresso-500 hover:text-espresso-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-espresso-700 mb-2">
              实际烘烤时长（分钟）
              {overtime > 0 && (
                <span className="ml-2 text-warn bg-warn/10 px-2 py-0.5 rounded-full text-xs">
                  ⏰ 超时 {overtime} 分钟
                </span>
              )}
              {overtime < 0 && (
                <span className="ml-2 text-success bg-success/10 px-2 py-0.5 rounded-full text-xs">
                  ✓ 提前 {Math.abs(overtime)} 分钟
                </span>
              )}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDuration((d) => Math.max(1, d - 1))}
                className="w-12 h-12 rounded-full border-2 border-copper-300 text-copper-600 hover:bg-copper-50 hover:border-copper-500 flex items-center justify-center transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                min={1}
                className="input-field text-center text-3xl font-display font-bold !py-4 !w-32 !text-copper-700"
                value={duration}
                onChange={(e) => setDuration(+e.target.value)}
              />
              <button
                type="button"
                onClick={() => setDuration((d) => d + 1)}
                className="w-12 h-12 rounded-full border-2 border-copper-300 text-copper-600 hover:bg-copper-50 hover:border-copper-500 flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-espresso-700 mb-2">
              成色评价
            </label>
            <ColorGradePicker value={colorGrade} onChange={setColorGrade} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
              <AlertTriangle className="w-4 h-4 text-danger" />
              报损数量
              <span className="text-xs text-espresso-400 font-normal">（共 {batch.quantity} 个）</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLossQuantity((n) => Math.max(0, n - 1))}
                className="w-12 h-12 rounded-full border-2 border-copper-300 text-copper-600 hover:bg-copper-50 hover:border-copper-500 flex items-center justify-center transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                min={0}
                max={batch.quantity}
                className="input-field text-center text-3xl font-display font-bold !py-4 !w-32 !text-danger"
                value={lossQuantity}
                onChange={(e) => setLossQuantity(+e.target.value)}
              />
              <button
                type="button"
                onClick={() => setLossQuantity((n) => Math.min(batch.quantity, n + 1))}
                className="w-12 h-12 rounded-full border-2 border-copper-300 text-copper-600 hover:bg-copper-50 hover:border-copper-500 flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <span className="text-espresso-500">个</span>
            </div>
            {lossQuantity > 0 && (
              <input
                type="text"
                className="input-field mt-3"
                placeholder="报损原因（选填）"
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
              />
            )}
          </div>

          <CameraCapture
            label="出炉照片"
            value={finishPhoto}
            onChange={setFinishPhoto}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary">
              ✅ 确认出炉
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
