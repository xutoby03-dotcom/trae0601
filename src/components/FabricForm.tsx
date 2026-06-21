import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import type { Season, TouchDimensions, FabricFormData } from '@/types';
import { SEASON_LABELS } from '@/types';
import { TouchScoreSlider } from './TouchScoreSlider';
import { compressImage } from '@/utils/storage';

interface FabricFormProps {
  initialData?: Partial<FabricFormData>;
  onSubmit: (data: FabricFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultFormData: FabricFormData = {
  name: '',
  composition: '',
  weight: 150,
  elasticity: 20,
  drape: 50,
  thickness: 40,
  translucency: 30,
  season: 'all',
  softness: 50,
  stiffness: 50,
  roughness: 30,
  coolness: 50,
  photoSmooth: '',
  photoWrinkled: '',
  notes: '',
};

export function FabricForm({ initialData, onSubmit, onCancel, submitLabel = '保存' }: FabricFormProps) {
  const [formData, setFormData] = useState<FabricFormData>({ ...defaultFormData, ...initialData });
  const [uploadingPhoto, setUploadingPhoto] = useState<'smooth' | 'wrinkled' | null>(null);
  const smoothInputRef = useRef<HTMLInputElement>(null);
  const wrinkledInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof FabricFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTouchChange = (field: keyof TouchDimensions, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'smooth' | 'wrinkled') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(type);
    try {
      const compressed = await compressImage(file);
      const field = type === 'smooth' ? 'photoSmooth' : 'photoWrinkled';
      setFormData((prev) => ({ ...prev, [field]: compressed }));
    } catch (error) {
      console.error('Photo upload error:', error);
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter', 'all'];
  const touchDimensions: (keyof TouchDimensions)[] = ['softness', 'stiffness', 'roughness', 'coolness'];
  const touchLabels: Record<keyof TouchDimensions, string> = {
    softness: '柔软',
    stiffness: '挺括',
    roughness: '粗糙',
    coolness: '凉感',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-[#8B5A3C] block mb-2">面料名称 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="例如：精梳棉府绸"
            className="w-full px-4 py-3 bg-[#F8F4ED] border-0 rounded-lg text-[#8B5A3C] placeholder:text-[#8B5A3C]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5A3C]/20"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#8B5A3C] block mb-2">成分 *</label>
          <input
            type="text"
            value={formData.composition}
            onChange={(e) => handleChange('composition', e.target.value)}
            placeholder="例如：100% 棉"
            className="w-full px-4 py-3 bg-[#F8F4ED] border-0 rounded-lg text-[#8B5A3C] placeholder:text-[#8B5A3C]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5A3C]/20"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#8B5A3C] block mb-2">克重 (g/m²)</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleChange('weight', Number(e.target.value))}
            min="50"
            max="600"
            className="w-full px-4 py-3 bg-[#F8F4ED] border-0 rounded-lg text-[#8B5A3C] focus:outline-none focus:ring-2 focus:ring-[#8B5A3C]/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#8B5A3C] block mb-2">适合季节</label>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => handleChange('season', season)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  formData.season === season
                    ? 'bg-[#8B5A3C] text-white'
                    : 'bg-[#F8F4ED] text-[#8B5A3C]/70 hover:bg-[#8B5A3C]/10'
                }`}
              >
                {SEASON_LABELS[season]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#8B5A3C]/10">
        <h3 className="font-serif text-lg text-[#8B5A3C] mb-4">物理属性 (0-100)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { key: 'elasticity', label: '弹力' },
            { key: 'drape', label: '垂感' },
            { key: 'thickness', label: '厚薄' },
            { key: 'translucency', label: '透光' },
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-[#8B5A3C]">{label}</label>
                <span className="text-sm text-[#8B5A3C]/60">{formData[key as keyof FabricFormData] as number}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData[key as keyof FabricFormData] as number}
                onChange={(e) => handleChange(key as keyof FabricFormData, Number(e.target.value))}
                className="w-full h-2 bg-[#8B5A3C]/10 rounded-full appearance-none cursor-pointer accent-[#8B5A3C]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#8B5A3C]/10">
        <h3 className="font-serif text-lg text-[#8B5A3C] mb-4">触感评分 (0-100)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {touchDimensions.map((dim) => (
            <TouchScoreSlider
              key={dim}
              label={touchLabels[dim]}
              value={formData[dim]}
              onChange={(value) => handleTouchChange(dim, value)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-[#8B5A3C] block mb-2">平整状态照片 *</label>
          <input
            ref={smoothInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e, 'smooth')}
            className="hidden"
          />
          {formData.photoSmooth ? (
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F8F4ED]">
              <img
                src={formData.photoSmooth}
                alt="平整状态"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleChange('photoSmooth', '')}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white"
              >
                <X size={16} className="text-[#8B5A3C]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => smoothInputRef.current?.click()}
              className="w-full aspect-square rounded-xl border-2 border-dashed border-[#8B5A3C]/20 bg-[#F8F4ED] flex flex-col items-center justify-center gap-3 hover:border-[#8B5A3C]/40 transition-colors"
            >
              {uploadingPhoto === 'smooth' ? (
                <div className="animate-spin w-8 h-8 border-2 border-[#8B5A3C]/30 border-t-[#8B5A3C] rounded-full" />
              ) : (
                <>
                  <Upload size={32} className="text-[#8B5A3C]/40" />
                  <span className="text-sm text-[#8B5A3C]/60">点击上传平整照片</span>
                </>
              )}
            </button>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#8B5A3C] block mb-2">揉皱状态照片 *</label>
          <input
            ref={wrinkledInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e, 'wrinkled')}
            className="hidden"
          />
          {formData.photoWrinkled ? (
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F8F4ED]">
              <img
                src={formData.photoWrinkled}
                alt="揉皱状态"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleChange('photoWrinkled', '')}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white"
              >
                <X size={16} className="text-[#8B5A3C]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => wrinkledInputRef.current?.click()}
              className="w-full aspect-square rounded-xl border-2 border-dashed border-[#8B5A3C]/20 bg-[#F8F4ED] flex flex-col items-center justify-center gap-3 hover:border-[#8B5A3C]/40 transition-colors"
            >
              {uploadingPhoto === 'wrinkled' ? (
                <div className="animate-spin w-8 h-8 border-2 border-[#8B5A3C]/30 border-t-[#8B5A3C] rounded-full" />
              ) : (
                <>
                  <Upload size={32} className="text-[#8B5A3C]/40" />
                  <span className="text-sm text-[#8B5A3C]/60">点击上传揉皱照片</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#8B5A3C] block mb-2">备注</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="记录面料特点、适用场景等..."
          rows={3}
          className="w-full px-4 py-3 bg-[#F8F4ED] border-0 rounded-lg text-[#8B5A3C] placeholder:text-[#8B5A3C]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5A3C]/20 resize-none"
        />
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-[#8B5A3C]/70 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!formData.name || !formData.composition || !formData.photoSmooth || !formData.photoWrinkled}
          className="px-8 py-3 bg-gradient-to-r from-[#8B5A3C] to-[#3D5A45] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#8B5A3C]/20 transition-all disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
