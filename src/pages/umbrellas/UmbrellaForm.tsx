import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Save,
  Umbrella as UmbrellaIcon,
  AlertCircle,
  X,
  UploadCloud,
} from 'lucide-react';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import type { UmbrellaSize, UmbrellaStatus } from '@/types';
import clsx from 'clsx';

const COLOR_OPTIONS = ['墨黑', '藏蓝', '酒红', '军绿', '驼色', '烟灰', '深棕', '钛灰', '米白', '枣红'];
const SIZE_OPTIONS: Array<{ value: UmbrellaSize; label: string; desc: string }> = [
  { value: 'small', label: '单人', desc: '55cm 直径' },
  { value: 'medium', label: '双人', desc: '65cm 直径' },
  { value: 'large', label: '加大', desc: '75cm 直径' },
];
const DEPOSIT_OPTIONS = [20, 30, 50, 80, 100];
const PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1534309466160-70b22cc6252c?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1577965535295-6f3e46b23e13?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1586610881410-321a835a3b9a?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1545727614-1e289fa6b3a4?w=600&h=600&fit=crop',
];

interface FormState {
  code: string;
  color: string;
  size: UmbrellaSize;
  deposit: number;
  storeId: string;
  status: UmbrellaStatus;
  damageNote: string;
  photoUrl: string;
}

const EMPTY_FORM: FormState = {
  code: '',
  color: COLOR_OPTIONS[0],
  size: 'medium',
  deposit: 50,
  storeId: '',
  status: 'available',
  damageNote: '',
  photoUrl: PHOTO_PRESETS[0],
};

export default function UmbrellaForm() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;

  const getUmbrella = useUmbrellaStore((s) => s.getUmbrella);
  const stores = useUmbrellaStore((s) => s.stores);
  const currentStoreId = useUmbrellaStore((s) => s.currentStoreId);
  const addUmbrella = useUmbrellaStore((s) => s.addUmbrella);
  const updateUmbrella = useUmbrellaStore((s) => s.updateUmbrella);
  const umbrellas = useUmbrellaStore((s) => s.umbrellas);

  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, storeId: currentStoreId });
  const [showPresets, setShowPresets] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saved, setSaved] = useState(false);

  const existing = useMemo(() => (params.id ? getUmbrella(params.id) : null), [params.id, getUmbrella]);

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        code: existing.code,
        color: existing.color,
        size: existing.size,
        deposit: existing.deposit,
        storeId: existing.storeId,
        status: existing.status,
        damageNote: existing.damageNote,
        photoUrl: existing.photoUrl,
      });
    }
  }, [isEdit, existing]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.code.trim()) next.code = '请输入雨伞编号';
    else if (!/^[A-Za-z0-9-]{3,16}$/.test(form.code.trim())) next.code = '编号需3-16位字母数字或横线';
    else if (!isEdit && umbrellas.some((u) => u.code.toLowerCase() === form.code.trim().toLowerCase())) {
      next.code = '该编号已存在';
    } else if (isEdit && existing && form.code.trim().toLowerCase() !== existing.code.toLowerCase()
      && umbrellas.some((u) => u.code.toLowerCase() === form.code.trim().toLowerCase())) {
      next.code = '该编号已被其他雨伞使用';
    }
    if (!form.color.trim()) next.color = '请选择颜色';
    if (!form.storeId) next.storeId = '请选择所属门店';
    if (form.deposit <= 0) next.deposit = '押金需大于0';
    if (form.status === 'damaged' && !form.damageNote.trim()) next.damageNote = '请描述破损情况';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form, code: form.code.trim().toUpperCase(), color: form.color.trim() };
    if (isEdit && params.id) {
      updateUmbrella(params.id, data);
    } else {
      addUmbrella(data);
    }
    setSaved(true);
    setTimeout(() => navigate('/umbrellas'), 500);
  }

  return (
    <div className="space-y-6 animate-fadeInUp max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/umbrellas" className="btn-ghost !p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-serif-sc text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UmbrellaIcon className="h-6 w-6 text-teal-700" />
            {isEdit ? '编辑雨伞档案' : '新增雨伞档案'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isEdit ? '修改雨伞详细信息并保存' : '填写雨伞基础信息以录入系统'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="label-base !mb-0 flex items-center gap-1.5">
                <Camera className="h-4 w-4" /> 雨伞照片
              </span>
              <button
                type="button"
                onClick={() => setShowPresets((v) => !v)}
                className="text-xs text-teal-600 hover:underline"
              >
                选择预设
              </button>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-slate-100 aspect-square ring-1 ring-slate-200">
              <img
                src={form.photoUrl}
                alt="预览"
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 flex items-end justify-center pb-6 bg-gradient-to-t from-black/40 via-transparent opacity-0 hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow">
                  <UploadCloud className="h-3.5 w-3.5" /> 更换照片
                </span>
              </div>
            </div>
            <div className="mt-3">
              <label className="label-base">自定义图片 URL</label>
              <input
                type="url"
                value={form.photoUrl}
                onChange={(e) => update('photoUrl', e.target.value)}
                placeholder="https://..."
                className="input-base text-xs"
              />
            </div>
            {showPresets && (
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                {PHOTO_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { update('photoUrl', p); setShowPresets(false); }}
                    className={clsx(
                      'overflow-hidden rounded-lg ring-2 transition-all aspect-square',
                      form.photoUrl === p ? 'ring-teal-500' : 'ring-transparent hover:ring-slate-300'
                    )}
                  >
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="font-serif-sc text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 -mx-5 px-5 -mt-1">
              基础信息
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-base">雨伞编号 <span className="text-orange-500">*</span></label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => update('code', e.target.value)}
                  placeholder="如 U-A-001"
                  className={clsx('input-base uppercase tracking-wider', errors.code && '!border-orange-400 !ring-orange-500/20')}
                />
                {errors.code && <p className="mt-1 flex items-center gap-1 text-xs text-orange-600"><AlertCircle className="h-3 w-3" />{errors.code}</p>}
              </div>
              <div>
                <label className="label-base">所属门店 <span className="text-orange-500">*</span></label>
                <select
                  value={form.storeId}
                  onChange={(e) => update('storeId', e.target.value)}
                  className={clsx('input-base', errors.storeId && '!border-orange-400 !ring-orange-500/20')}
                >
                  <option value="">请选择门店</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.storeId && <p className="mt-1 flex items-center gap-1 text-xs text-orange-600"><AlertCircle className="h-3 w-3" />{errors.storeId}</p>}
              </div>
            </div>

            <div>
              <label className="label-base">颜色</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update('color', c)}
                    className={clsx(
                      'rounded-lg px-3.5 py-2 text-sm font-medium transition-all border',
                      form.color === c
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-base">尺寸规格</label>
              <div className="grid grid-cols-3 gap-3">
                {SIZE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => update('size', o.value)}
                    className={clsx(
                      'rounded-xl border p-3.5 text-left transition-all',
                      form.size === o.value
                        ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="font-semibold text-slate-900">{o.label}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-base">押金金额 <span className="text-orange-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {DEPOSIT_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update('deposit', d)}
                    className={clsx(
                      'rounded-lg px-4 py-2 font-semibold transition-all border',
                      form.deposit === d
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    ¥{d}
                  </button>
                ))}
                <div className="relative w-28">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
                  <input
                    type="number"
                    min={0}
                    value={form.deposit}
                    onChange={(e) => update('deposit', Number(e.target.value) || 0)}
                    className={clsx('input-base !pl-7', errors.deposit && '!border-orange-400')}
                  />
                </div>
              </div>
              {errors.deposit && <p className="mt-1 flex items-center gap-1 text-xs text-orange-600"><AlertCircle className="h-3 w-3" />{errors.deposit}</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="font-serif-sc text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 -mx-5 px-5 -mt-1">
              状态设置
            </h3>
            <div>
              <label className="label-base">当前状态</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { v: 'available', label: '可借', color: 'emerald' },
                  { v: 'lent', label: '借出中', color: 'sky' },
                  { v: 'damaged', label: '破损待修', color: 'orange' },
                  { v: 'scrapped', label: '已报废', color: 'slate' },
                ] as Array<{ v: UmbrellaStatus; label: string; color: string }>).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => update('status', o.v)}
                    className={clsx(
                      'rounded-lg border p-3 text-sm font-medium transition-all',
                      form.status === o.v
                        ? o.color === 'emerald'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                          : o.color === 'sky'
                          ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500/20'
                          : o.color === 'orange'
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                          : 'border-slate-500 bg-slate-100 text-slate-700 ring-2 ring-slate-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {form.status === 'damaged' && (
              <div>
                <label className="label-base">破损说明 <span className="text-orange-500">*</span></label>
                <textarea
                  value={form.damageNote}
                  onChange={(e) => update('damageNote', e.target.value)}
                  rows={3}
                  placeholder="请描述破损位置和程度，如：第3根伞骨断裂，伞面右上角有2cm破洞"
                  className={clsx('input-base resize-none', errors.damageNote && '!border-orange-400 !ring-orange-500/20')}
                />
                {errors.damageNote && <p className="mt-1 flex items-center gap-1 text-xs text-orange-600"><AlertCircle className="h-3 w-3" />{errors.damageNote}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/umbrellas" type="button" className="btn-secondary">
              <X className="h-4 w-4" /> 取消
            </Link>
            <button type="submit" className="btn-primary min-w-[120px]" disabled={saved}>
              {saved ? <CheckCircle2 className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
              {saved ? '已保存' : isEdit ? '保存修改' : '创建档案'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
