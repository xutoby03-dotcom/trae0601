import { PawPrint, Phone, Building2 } from 'lucide-react';
import type { PetInfo, PetSize } from '../types';
import { buildings } from '../data/mockData';
import { cn } from '../lib/utils';

interface PetFormProps {
  value: PetInfo;
  onChange: (value: PetInfo) => void;
}

const sizeOptions: { value: PetSize; label: string }[] = [
  { value: 'SMALL', label: '小型犬' },
  { value: 'MEDIUM', label: '中型犬' },
  { value: 'LARGE', label: '大型犬' },
];

export default function PetForm({ value, onChange }: PetFormProps) {
  const update = <K extends keyof PetInfo>(key: K, val: PetInfo[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <PawPrint className="h-4 w-4" />
        <span>宠物信息</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">宠物昵称</label>
        <input
          type="text"
          value={value.nickname}
          onChange={(e) => update('nickname', e.target.value)}
          placeholder="请输入宠物昵称"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">宠物体型</label>
        <div className="grid grid-cols-3 gap-2">
          {sizeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('size', opt.value)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                value.size === opt.value
                  ? 'border-teal-500 bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            所在楼栋
          </span>
        </label>
        <select
          value={value.building}
          onChange={(e) => update('building', e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
        >
          <option value="">请选择楼栋</option>
          {buildings.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            联系电话
          </span>
        </label>
        <input
          type="tel"
          value={value.ownerPhone}
          onChange={(e) => update('ownerPhone', e.target.value)}
          placeholder="请输入手机号"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
        />
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3">
        <input
          type="checkbox"
          id="afraidOfWater"
          checked={value.afraidOfWater}
          onChange={(e) => update('afraidOfWater', e.target.checked)}
          className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="afraidOfWater" className="text-sm text-amber-800">
          宠物怕水，需要工作人员特别注意
        </label>
      </div>
    </div>
  );
}
