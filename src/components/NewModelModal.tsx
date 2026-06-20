import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useModelStore } from '@/store/useModelStore';
import { compressImage } from '@/utils/image';

interface NewModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewModelModal = ({ isOpen, onClose }: NewModelModalProps) => {
  const { addModel } = useModelStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    scale: '1/100',
    thumbnail: '',
    nextAction: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const scaleOptions = ['1/144', '1/100', '1/72', '1/48', '1/35', '1/24', '1/12', '其他'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 400, 0.9);
      setFormData({ ...formData, thumbnail: compressed });
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('图片处理失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('请输入模型名称');
      return;
    }
    if (!formData.thumbnail) {
      formData.thumbnail = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(formData.name + ' model kit')}&image_size=square`;
    }
    addModel({
      name: formData.name.trim(),
      scale: formData.scale,
      thumbnail: formData.thumbnail,
      currentStage: 'primer',
      nextAction: formData.nextAction.trim() || '准备开始底漆涂装',
    });
    setFormData({ name: '', scale: '1/100', thumbnail: '', nextAction: '' });
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-studio-card rounded-2xl border border-studio-border shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden">
        <div className="p-6 border-b border-studio-border flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-studio-text">新建模型项目</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-studio-border rounded-lg text-studio-muted hover:text-studio-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s
                      ? 'bg-studio-copper text-white'
                      : 'bg-studio-border text-studio-muted'
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div
                    className={`w-12 h-0.5 transition-colors ${
                      step > s ? 'bg-studio-copper' : 'bg-studio-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-studio-text mb-1.5">模型名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-studio-bg border border-studio-border rounded-lg text-studio-text placeholder-studio-muted focus:outline-none focus:border-studio-copper transition-colors"
                  placeholder="如: RX-78-2 高达"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-studio-text mb-1.5">比例</label>
                <div className="flex flex-wrap gap-2">
                  {scaleOptions.map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFormData({ ...formData, scale })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.scale === scale
                          ? 'bg-studio-copper text-white'
                          : 'bg-studio-bg text-studio-muted hover:text-studio-text border border-studio-border hover:border-studio-copper/50'
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-studio-text mb-1.5">下一步行动</label>
                <input
                  type="text"
                  value={formData.nextAction}
                  onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                  className="w-full px-4 py-2.5 bg-studio-bg border border-studio-border rounded-lg text-studio-text placeholder-studio-muted focus:outline-none focus:border-studio-copper transition-colors"
                  placeholder="如: 喷涂水补土底漆"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-studio-text mb-1.5">缩略图</label>
                <div className="flex items-center gap-4">
                  {formData.thumbnail ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-studio-border">
                      <img
                        src={formData.thumbnail}
                        alt="预览"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, thumbnail: '' })}
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 rounded-xl border-2 border-dashed border-studio-border flex flex-col items-center justify-center cursor-pointer hover:border-studio-copper/50 transition-colors">
                      {isUploading ? (
                        <div className="text-studio-muted">处理中...</div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-studio-muted mb-1" />
                          <span className="text-xs text-studio-muted">上传图片</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                  <div className="flex-1 text-sm text-studio-muted">
                    <p>• 上传模型照片或封绘</p>
                    <p>• 如不上传将自动生成图片</p>
                    <p>• 建议比例 1:1 正方形</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-studio-bg rounded-xl">
                <h4 className="font-medium text-studio-text mb-2">项目预览</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-studio-border overflow-hidden">
                    {formData.thumbnail ? (
                      <img src={formData.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-studio-muted text-xs">
                        预览
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-studio-text">{formData.name || '未命名模型'}</p>
                    <p className="text-xs text-studio-muted">比例 {formData.scale}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-studio-border flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 bg-studio-border hover:bg-studio-border/80 text-studio-text rounded-lg font-medium transition-colors"
            >
              上一步
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!formData.name.trim()}
              className="flex-1 py-2.5 bg-studio-copper hover:bg-studio-copperDark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 bg-studio-military hover:bg-studio-military/80 text-white rounded-lg font-medium transition-colors"
            >
              创建项目
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
