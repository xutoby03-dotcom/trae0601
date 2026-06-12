import { FormEvent, useState } from 'react';
import { Pet, PetType } from '../../../shared/types';
import { PhotoUpload } from '../common/PhotoUpload';
import { usePetStore, selectBuildings } from '../../store/usePetStore';

interface PetFormProps {
  initial?: Pet;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function PetForm({ initial, onSubmit, onCancel }: PetFormProps) {
  const pets = usePetStore((s) => s.pets);
  const addPet = usePetStore((s) => s.addPet);
  const updatePet = usePetStore((s) => s.updatePet);

  const buildings = selectBuildings(pets);
  const buildingOptions = buildings.length
    ? buildings
    : ['1栋', '2栋', '3栋', '4栋', '5栋', '6栋'];

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? ('dog' as PetType),
    breed: initial?.breed ?? '',
    ownerName: initial?.ownerName ?? '',
    building: initial?.building ?? buildingOptions[0],
    phone: initial?.phone ?? '',
    photoUrl: initial?.photoUrl ?? undefined as string | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = '请输入宠物名字';
    if (!form.breed.trim()) nextErrors.breed = '请输入品种';
    if (!form.ownerName.trim()) nextErrors.ownerName = '请输入主人姓名';
    if (!form.phone.trim()) nextErrors.phone = '请输入联系方式';
    else if (!/^1\d{10}$/.test(form.phone.trim()))
      nextErrors.phone = '请输入11位手机号';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    if (initial) {
      updatePet(initial.id, form);
    } else {
      addPet(form);
    }
    onSubmit();
  };

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PhotoUpload
        label="宠物照片"
        value={form.photoUrl}
        onChange={(v) => update('photoUrl', v)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field label="宠物名字" error={errors.name} required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputCls(!!errors.name)}
            placeholder="例如：豆豆"
          />
        </Field>

        <Field label="种类" required>
          <div className="flex gap-2">
            {(
              [
                { v: 'dog', label: '🐶 狗狗' },
                { v: 'cat', label: '🐱 猫咪' },
                { v: 'other', label: '🐾 其他' },
              ] as { v: PetType; label: string }[]
            ).map((o) => (
              <label
                key={o.v}
                className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-sm transition ${
                  form.type === o.v
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  name="type"
                  value={o.v}
                  checked={form.type === o.v}
                  onChange={() => update('type', o.v)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </Field>
      </div>

      <Field label="品种" error={errors.breed} required>
        <input
          type="text"
          value={form.breed}
          onChange={(e) => update('breed', e.target.value)}
          className={inputCls(!!errors.breed)}
          placeholder="例如：金毛寻回犬 / 英短蓝猫"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="主人姓名" error={errors.ownerName} required>
          <input
            type="text"
            value={form.ownerName}
            onChange={(e) => update('ownerName', e.target.value)}
            className={inputCls(!!errors.ownerName)}
            placeholder="姓名"
          />
        </Field>

        <Field label="联系方式" error={errors.phone} required>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputCls(!!errors.phone)}
            placeholder="11位手机号"
          />
        </Field>
      </div>

      <Field label="所在楼栋" required>
        <div className="flex flex-wrap gap-2">
          {buildingOptions.map((b) => (
            <label
              key={b}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                form.building === b
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                className="hidden"
                name="building"
                value={b}
                checked={form.building === b}
                onChange={() => update('building', b)}
              />
              {b}
            </label>
          ))}
          <input
            type="text"
            value={!buildingOptions.includes(form.building) ? form.building : ''}
            onChange={(e) => update('building', e.target.value)}
            placeholder="自定义楼栋..."
            className="flex-1 min-w-[120px] rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-400"
          />
        </div>
      </Field>

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
          {initial ? '保存修改' : '新增宠物'}
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
  label: string;
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
