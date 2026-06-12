import { FormEvent, useMemo, useState } from 'react';
import { Pet, VaccineRecord } from '../../../shared/types';
import { PhotoUpload } from '../common/PhotoUpload';
import { usePetStore } from '../../store/usePetStore';
import { addMonths, formatDate } from '../../utils/date';

interface VaccineFormProps {
  initial?: VaccineRecord;
  defaultPetId?: string;
  onSubmit: () => void;
  onCancel?: () => void;
  focusProof?: boolean;
}

const VACCINE_PRESETS = [
  '狂犬疫苗',
  '八联疫苗',
  '六联疫苗',
  '猫三联',
  '猫四联',
  '猫五联',
  '犬窝咳',
  '钩端螺旋体',
];

const HOSPITAL_PRESETS = [
  '新瑞鹏',
  '瑞鹏宠物医院',
  '芭比堂',
  '美联众合',
  '宠颐生',
  '爱宠动物医院',
];

export function VaccineForm({
  initial,
  defaultPetId,
  onSubmit,
  onCancel,
  focusProof,
}: VaccineFormProps) {
  const pets = usePetStore((s) => s.pets);
  const addRecord = usePetStore((s) => s.addVaccineRecord);
  const updateRecord = usePetStore((s) => s.updateVaccineRecord);

  const petMap = useMemo(() => {
    const m = new Map<string, Pet>();
    pets.forEach((p) => m.set(p.id, p));
    return m;
  }, [pets]);

  const todayStr = formatDate(new Date());
  const defaultNext = formatDate(addMonths(new Date(), 12));

  const [form, setForm] = useState({
    petId: initial?.petId ?? defaultPetId ?? pets[0]?.id ?? '',
    vaccineName: initial?.vaccineName ?? '',
    vaccinatedAt: initial?.vaccinatedAt ?? todayStr,
    nextDueAt: initial?.nextDueAt ?? defaultNext,
    hospital: initial?.hospital ?? '',
    proofPhotoUrl: initial?.proofPhotoUrl ?? undefined as string | undefined,
    remark: initial?.remark ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.petId) nextErrors.petId = '请选择宠物';
    if (!form.vaccineName.trim()) nextErrors.vaccineName = '请输入疫苗名称';
    if (!form.vaccinatedAt) nextErrors.vaccinatedAt = '请选择接种日期';
    if (!form.nextDueAt) nextErrors.nextDueAt = '请选择到期日期';
    if (form.nextDueAt && form.vaccinatedAt && form.nextDueAt < form.vaccinatedAt)
      nextErrors.nextDueAt = '到期日不能早于接种日';
    if (!form.hospital.trim()) nextErrors.hospital = '请输入接种医院';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    if (initial) {
      updateRecord(initial.id, form);
    } else {
      addRecord(form);
    }
    onSubmit();
  };

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const autoNext = (months: number) => {
    if (!form.vaccinatedAt) return;
    const d = new Date(form.vaccinatedAt);
    d.setMonth(d.getMonth() + months);
    update('nextDueAt', formatDate(d));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="关联宠物" error={errors.petId} required>
        <select
          value={form.petId}
          onChange={(e) => update('petId', e.target.value)}
          className={inputCls(!!errors.petId)}
        >
          <option value="">请选择宠物</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.type === 'dog' ? '🐶' : p.type === 'cat' ? '🐱' : '🐾'} {p.name}
              （{p.building} · {p.ownerName}）
            </option>
          ))}
        </select>
      </Field>

      <Field label="疫苗名称" error={errors.vaccineName} required>
        <input
          type="text"
          list="vaccine-list"
          value={form.vaccineName}
          onChange={(e) => update('vaccineName', e.target.value)}
          className={inputCls(!!errors.vaccineName)}
          placeholder="输入或选择常用疫苗"
        />
        <datalist id="vaccine-list">
          {VACCINE_PRESETS.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {VACCINE_PRESETS.slice(0, 5).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => update('vaccineName', v)}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 transition hover:bg-emerald-100 hover:text-emerald-700"
            >
              {v}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="接种日期" error={errors.vaccinatedAt} required>
          <input
            type="date"
            value={form.vaccinatedAt}
            onChange={(e) => update('vaccinatedAt', e.target.value)}
            className={inputCls(!!errors.vaccinatedAt)}
          />
        </Field>
        <Field label="下次到期" error={errors.nextDueAt} required>
          <input
            type="date"
            value={form.nextDueAt}
            onChange={(e) => update('nextDueAt', e.target.value)}
            className={inputCls(!!errors.nextDueAt)}
          />
          <div className="flex gap-1.5 pt-1">
            {[
              { m: 6, label: '半年' },
              { m: 12, label: '1年' },
              { m: 36, label: '3年' },
            ].map((x) => (
              <button
                key={x.m}
                type="button"
                onClick={() => autoNext(x.m)}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 transition hover:bg-emerald-100 hover:text-emerald-700"
              >
                +{x.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="接种医院" error={errors.hospital} required>
        <input
          type="text"
          list="hospital-list"
          value={form.hospital}
          onChange={(e) => update('hospital', e.target.value)}
          className={inputCls(!!errors.hospital)}
          placeholder="输入或选择医院"
        />
        <datalist id="hospital-list">
          {HOSPITAL_PRESETS.map((h) => (
            <option key={h} value={h} />
          ))}
        </datalist>
      </Field>

      <div className={focusProof ? 'ring-2 ring-amber-400 rounded-xl p-3 bg-amber-50/40' : ''}>
        <PhotoUpload
          label={
            <span>
              证明照片
              {focusProof && (
                <span className="ml-2 text-xs text-amber-700">（请补录）</span>
              )}
            </span>
          }
          value={form.proofPhotoUrl}
          onChange={(v) => update('proofPhotoUrl', v)}
          aspect="aspect-video"
          placeholder="上传接种证明 / 疫苗本照片"
        />
      </div>

      <Field label="备注">
        <textarea
          value={form.remark}
          onChange={(e) => update('remark', e.target.value)}
          rows={2}
          className={inputCls(false) + ' resize-none'}
          placeholder="可选：特殊情况说明..."
        />
      </Field>

      {form.petId && petMap.get(form.petId) && (
        <div className="rounded-xl bg-emerald-50/60 p-3 ring-1 ring-emerald-100">
          <p className="text-xs text-emerald-800">
            🐾 将为{' '}
            <span className="font-semibold">
              {petMap.get(form.petId)!.name}
            </span>{' '}
            （{petMap.get(form.petId)!.building} ·{' '}
            {petMap.get(form.petId)!.ownerName}）登记疫苗
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:shadow-lg hover:shadow-emerald-300 active:scale-[0.97]"
        >
          {initial ? '保存修改' : '新增疫苗记录'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  required,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 ${
    hasError
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
      : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
  }`;
}
