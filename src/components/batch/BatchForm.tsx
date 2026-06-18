import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Camera, ChefHat } from 'lucide-react';
import type { SoupType, FireLevel } from '@/types';
import { useBatchStore } from '@/store/useBatchStore';
import { SOUP_TYPE_LABEL, FIRE_LEVEL_LABEL, SPICE_PACKS, POT_NUMBERS, OPERATORS } from '@/utils/soupConfig';
import { getNowIso } from '@/utils/helpers';

interface FormData {
  soupType: SoupType;
  boneWeightKg: number;
  waterVolumeL: number;
  spicePack: string;
  startTime: string;
  fireLevel: FireLevel;
  targetYieldL: number;
  potNumber: string;
  potPhoto?: string;
  operator: string;
}

const defaultData: FormData = {
  soupType: 'pork-bone',
  boneWeightKg: 15,
  waterVolumeL: 45,
  spicePack: SPICE_PACKS[0],
  startTime: new Date().toISOString().slice(0, 16),
  fireLevel: 'simmer',
  targetYieldL: 40,
  potNumber: POT_NUMBERS[0],
  operator: OPERATORS[0],
};

export default function BatchForm() {
  const navigate = useNavigate();
  const addBatch = useBatchStore((s) => s.addBatch);
  const [form, setForm] = useState<FormData>(defaultData);

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = addBatch({
      ...form,
      startTime: new Date(form.startTime).toISOString(),
      status: 'preparing',
    });
    navigate(`/batches/${batch.id}`);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => update('potPhoto', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-broth-800">新建熬制批次</h1>
            <p className="text-sm text-broth-500">录入汤底原料与熬制参数</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-5">
            <h3 className="font-display text-lg font-bold text-broth-800 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-fire-500" />
              基础信息
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">汤底类型</label>
                <select
                  className="input-field"
                  value={form.soupType}
                  onChange={(e) => update('soupType', e.target.value as SoupType)}
                >
                  {(Object.keys(SOUP_TYPE_LABEL) as SoupType[]).map((k) => (
                    <option key={k} value={k}>{SOUP_TYPE_LABEL[k]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">操作师傅</label>
                <select
                  className="input-field"
                  value={form.operator}
                  onChange={(e) => update('operator', e.target.value)}
                >
                  {OPERATORS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">锅号</label>
                <select
                  className="input-field"
                  value={form.potNumber}
                  onChange={(e) => update('potNumber', e.target.value)}
                >
                  {POT_NUMBERS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">开始时间</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={form.startTime}
                  onChange={(e) => update('startTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card space-y-5">
            <h3 className="font-display text-lg font-bold text-broth-800">原料参数</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">骨料重量 (kg)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => update('boneWeightKg', Math.max(1, form.boneWeightKg - 1))}
                    className="w-10 h-10 rounded-lg border border-broth-100 hover:bg-broth-50 text-broth-600 font-bold"
                  >−</button>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field text-center text-lg font-semibold"
                    value={form.boneWeightKg}
                    onChange={(e) => update('boneWeightKg', Number(e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() => update('boneWeightKg', form.boneWeightKg + 1)}
                    className="w-10 h-10 rounded-lg border border-broth-100 hover:bg-broth-50 text-broth-600 font-bold"
                  >+</button>
                </div>
              </div>

              <div>
                <label className="label">加水量 (L)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => update('waterVolumeL', Math.max(1, form.waterVolumeL - 5))}
                    className="w-10 h-10 rounded-lg border border-broth-100 hover:bg-broth-50 text-broth-600 font-bold"
                  >−</button>
                  <input
                    type="number"
                    step="1"
                    className="input-field text-center text-lg font-semibold"
                    value={form.waterVolumeL}
                    onChange={(e) => update('waterVolumeL', Number(e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() => update('waterVolumeL', form.waterVolumeL + 5)}
                    className="w-10 h-10 rounded-lg border border-broth-100 hover:bg-broth-50 text-broth-600 font-bold"
                  >+</button>
                </div>
              </div>

              <div>
                <label className="label">目标出汤量 (L)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.targetYieldL}
                  onChange={(e) => update('targetYieldL', Number(e.target.value))}
                />
              </div>

              <div>
                <label className="label">火力档位</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(FIRE_LEVEL_LABEL) as FireLevel[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => update('fireLevel', f)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        form.fireLevel === f
                          ? 'bg-fire-500 text-white shadow-warm'
                          : 'bg-broth-50 text-broth-600 hover:bg-broth-100'
                      }`}
                    >
                      {FIRE_LEVEL_LABEL[f]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label">香料包</label>
                <select
                  className="input-field"
                  value={form.spicePack}
                  onChange={(e) => update('spicePack', e.target.value)}
                >
                  {SPICE_PACKS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="font-display text-lg font-bold text-broth-800">锅号照片</h3>
            {form.potPhoto ? (
              <div className="relative rounded-xl overflow-hidden aspect-square bg-broth-50">
                <img src={form.potPhoto} alt="锅号照片" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => update('potPhoto', undefined)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm"
                >×</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border-2 border-dashed border-broth-200 bg-broth-50/50 cursor-pointer hover:bg-soup-50 transition-colors">
                <Camera className="w-10 h-10 text-broth-400" />
                <span className="text-sm text-broth-500">点击上传锅号照片</span>
                <span className="text-xs text-broth-400">可选，用于记录核对</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="font-display text-lg font-bold text-broth-800">参数摘要</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-broth-500">骨水比</span>
                <span className="font-semibold text-broth-800">1 : {(form.waterVolumeL / form.boneWeightKg).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-broth-500">预计出汤率</span>
                <span className="font-semibold text-broth-800">{((form.targetYieldL / form.waterVolumeL) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">取消</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              创建批次
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
