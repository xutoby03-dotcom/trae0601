import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Ruler,
  Scissors,
  Bug,
  Flower2,
  Calendar as CalendarIcon,
  Layers,
  StickyNote,
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePlantStore } from '../store/plantStore';
import type { RootCondition } from '../types';

export default function RepotPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getPlantById = usePlantStore((s) => s.getPlantById);
  const getSoilMixById = usePlantStore((s) => s.getSoilMixById);
  const soilMixes = usePlantStore((s) => s.soilMixes);
  const addRepotRecord = usePlantStore((s) => s.addRepotRecord);

  const plant = id ? getPlantById(id) : undefined;
  const currentSoilMix = plant ? getSoilMixById(plant.currentSoilMixId) : undefined;

  const today = new Date().toISOString().split('T')[0];
  const defaultRecoveryEnd = format(addDays(new Date(), 21), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    date: today,
    newPotDiameterCm: plant?.potDiameterCm ? plant.potDiameterCm + 2 : 15,
    rootPruned: false,
    rootCondition: '健康' as RootCondition,
    baseFertilizer: '',
    hadPests: false,
    pestType: '',
    hadRootRot: false,
    soilMixId: plant?.currentSoilMixId || soilMixes[0]?.id || '',
    recoveryEndDate: defaultRecoveryEnd,
    notes: '',
  });

  if (!plant) {
    return <div className="text-forest-600">未找到该植物</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    addRepotRecord({
      plantId: id,
      ...formData,
    });

    navigate(`/plants/${id}`);
  };

  const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to={`/plants/${id}`} className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回 {plant.name} 的详情</span>
      </Link>

      <div className="card p-6 md:p-8 animate-slide-up">
        <h2 className="font-serif text-2xl font-semibold text-forest-800 mb-2">
          记录换盆
        </h2>
        <p className="text-forest-500 text-sm mb-6">
          当前盆径 {plant.potDiameterCm}cm · 使用土壤：{currentSoilMix?.name || '未记录'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-forest-400" />
                换盆日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-clay-500" />
                新盆尺寸 (cm)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                step="1"
                value={formData.newPotDiameterCm}
                onChange={(e) => updateField('newPotDiameterCm', Number(e.target.value))}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-cream-50 rounded-2xl space-y-4">
            <h3 className="font-serif text-lg font-semibold text-forest-800 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-forest-500" />
              根系检查
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">是否修根</label>
                <div className="flex gap-3">
                  {['是', '否'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border-2 transition-all ${
                        (opt === '是' && formData.rootPruned) || (opt === '否' && !formData.rootPruned)
                          ? 'bg-forest-600 text-white border-forest-600'
                          : 'bg-white text-forest-600 border-cream-300 hover:border-forest-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rootPruned"
                        checked={opt === '是' ? formData.rootPruned : !formData.rootPruned}
                        onChange={() => updateField('rootPruned', opt === '是')}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">根系状态</label>
                <select
                  value={formData.rootCondition}
                  onChange={(e) => updateField('rootCondition', e.target.value as RootCondition)}
                  className="input-field"
                >
                  <option value="健康">健康</option>
                  <option value="轻微缠绕">轻微缠绕</option>
                  <option value="严重缠绕">严重缠绕</option>
                  <option value="有烂根">有烂根</option>
                </select>
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-clay-500" />
                  是否发现虫害
                </label>
                <div className="flex gap-3">
                  {['是', '否'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border-2 transition-all ${
                        (opt === '是' && formData.hadPests) || (opt === '否' && !formData.hadPests)
                          ? 'bg-forest-600 text-white border-forest-600'
                          : 'bg-white text-forest-600 border-cream-300 hover:border-forest-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hadPests"
                        checked={opt === '是' ? formData.hadPests : !formData.hadPests}
                        onChange={() => updateField('hadPests', opt === '是')}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.hadPests && (
                <div>
                  <label className="label">虫害类型</label>
                  <input
                    type="text"
                    placeholder="如：介壳虫、红蜘蛛"
                    value={formData.pestType}
                    onChange={(e) => updateField('pestType', e.target.value)}
                    className="input-field"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="label flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-clay-500" />
                  是否有烂根
                </label>
                <div className="flex gap-3 max-w-xs">
                  {['是', '否'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border-2 transition-all ${
                        (opt === '是' && formData.hadRootRot) || (opt === '否' && !formData.hadRootRot)
                          ? (opt === '是' ? 'bg-clay-500 text-white border-clay-500' : 'bg-forest-600 text-white border-forest-600')
                          : 'bg-white text-forest-600 border-cream-300 hover:border-forest-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hadRootRot"
                        checked={opt === '是' ? formData.hadRootRot : !formData.hadRootRot}
                        onChange={() => updateField('hadRootRot', opt === '是')}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-forest-50 rounded-2xl space-y-4">
            <h3 className="font-serif text-lg font-semibold text-forest-800 flex items-center gap-2">
              <Flower2 className="w-5 h-5 text-forest-500" />
              肥料与土壤
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">底肥</label>
                <input
                  type="text"
                  placeholder="如：奥绿A2缓释肥5g，未施底肥填无"
                  value={formData.baseFertilizer}
                  onChange={(e) => updateField('baseFertilizer', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-forest-400" />
                  土壤配比
                </label>
                <select
                  value={formData.soilMixId}
                  onChange={(e) => updateField('soilMixId', e.target.value)}
                  className="input-field"
                >
                  {soilMixes.map((sm) => (
                    <option key={sm.id} value={sm.id}>
                      {sm.name}（颗粒{sm.granularRatio}%/营养{sm.nutrientRatio}%）
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-leaf-50 rounded-2xl space-y-4 border border-leaf-200">
            <h3 className="font-serif text-lg font-semibold text-leaf-800 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-leaf-500" />
              缓苗期设置
            </h3>
            <div>
              <label className="label">缓苗结束日期</label>
              <input
                type="date"
                value={formData.recoveryEndDate}
                onChange={(e) => updateField('recoveryEndDate', e.target.value)}
                className="input-field"
                required
              />
              <p className="text-xs text-leaf-600 mt-1">
                缓苗期一般为2-4周，期间建议减少浇水，避免强光直射
              </p>
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <StickyNote className="w-4 h-4 text-forest-400" />
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="记录这次换盆的其他情况..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <Link to={`/plants/${id}`} className="btn-ghost">
              取消
            </Link>
            <button type="submit" className="btn-primary">
              保存换盆记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
