import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Leaf,
  MapPin,
  Ruler,
  Layers,
  Sun,
  Droplets,
  Image as ImageIcon,
} from 'lucide-react';
import { usePlantStore } from '../store/plantStore';
import type { LightRequirement } from '../types';

export default function CreatePlantPage() {
  const navigate = useNavigate();
  const addPlant = usePlantStore((s) => s.addPlant);
  const soilMixes = usePlantStore((s) => s.soilMixes);

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    position: '',
    potDiameterCm: 15,
    currentSoilMixId: soilMixes[0]?.id || '',
    lightRequirement: '散射光' as LightRequirement,
    wateringRhythm: '每7天一次',
    latestPhotoUrl: '',
    isAlive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlant(formData);
    navigate('/');
  };

  const [photoLoadError, setPhotoLoadError] = useState(false);

  const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === 'latestPhotoUrl') setPhotoLoadError(false);
  };

  const lightOptions: LightRequirement[] = ['低光', '散射光', '半日照', '全日照'];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回盆栽列表</span>
      </Link>

      <div className="card p-6 md:p-8 animate-slide-up">
        <h2 className="font-serif text-2xl font-semibold text-forest-800 mb-2 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-forest-500" />
          新增植物
        </h2>
        <p className="text-forest-500 text-sm mb-6">
          记录一盆新的绿植，开始它的养护档案
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">昵称 *</label>
              <input
                type="text"
                placeholder="给它起个名字"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">品种</label>
              <input
                type="text"
                placeholder="如：龟背竹、玉露"
                value={formData.species}
                onChange={(e) => updateField('species', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-forest-400" />
                摆放位置 *
              </label>
              <input
                type="text"
                placeholder="如：客厅落地窗旁"
                value={formData.position}
                onChange={(e) => updateField('position', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-clay-500" />
                盆径 (cm) *
              </label>
              <input
                type="number"
                min="5"
                max="60"
                step="1"
                value={formData.potDiameterCm}
                onChange={(e) => updateField('potDiameterCm', Number(e.target.value))}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-forest-400" />
                土壤配比 *
              </label>
              <select
                value={formData.currentSoilMixId}
                onChange={(e) => updateField('currentSoilMixId', e.target.value)}
                className="input-field"
                required
              >
                {soilMixes.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-forest-400" />
                浇水节奏
              </label>
              <input
                type="text"
                placeholder="如：每7天一次"
                value={formData.wateringRhythm}
                onChange={(e) => updateField('wateringRhythm', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-leaf-500" />
              光照需求
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {lightOptions.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-xl cursor-pointer border-2 transition-all ${
                    formData.lightRequirement === opt
                      ? 'bg-forest-600 text-white border-forest-600'
                      : 'bg-white text-forest-600 border-cream-300 hover:border-forest-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="light"
                    checked={formData.lightRequirement === opt}
                    onChange={() => updateField('lightRequirement', opt)}
                    className="sr-only"
                  />
                  <span className="font-medium text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div className="md:col-span-3">
              <label className="label flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-clay-500" />
                最近照片地址
              </label>
              <input
                type="url"
                placeholder="粘贴图片 URL，保存后卡片和详情页直接用这张图"
                value={formData.latestPhotoUrl}
                onChange={(e) => updateField('latestPhotoUrl', e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-forest-400 mt-1.5">
                可选，不填则显示占位图
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="label">预览</label>
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-forest-100 border border-cream-200 flex items-center justify-center">
                {formData.latestPhotoUrl && !photoLoadError ? (
                  <img
                    src={formData.latestPhotoUrl}
                    alt="预览"
                    className="w-full h-full object-cover"
                    onError={() => setPhotoLoadError(true)}
                  />
                ) : formData.latestPhotoUrl && photoLoadError ? (
                  <div className="text-center text-clay-600">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                    <p className="text-xs">图片加载失败，请检查地址</p>
                  </div>
                ) : (
                  <div className="text-center text-forest-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">填入地址后这里显示预览</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <Link to="/" className="btn-ghost">
              取消
            </Link>
            <button type="submit" className="btn-primary">
              添加植物
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
