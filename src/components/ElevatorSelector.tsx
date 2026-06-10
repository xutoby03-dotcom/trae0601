import { useState } from 'react';
import { BUILDINGS, UNITS, ELEVATORS_PER_UNIT } from '@/shared/constants';
import type { ElevatorId } from '@/shared/types';
import { ChevronDown } from 'lucide-react';

interface Props {
  value: ElevatorId;
  onChange: (v: ElevatorId) => void;
}

export default function ElevatorSelector({ value, onChange }: Props) {
  const [openB, setOpenB] = useState(false);
  const [openU, setOpenU] = useState(false);
  const [openE, setOpenE] = useState(false);

  const building = BUILDINGS.find((b) => b.code === value.building);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="label">楼栋 <span className="text-red-500">*</span></label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenB((o) => !o)}
            className="input w-full flex items-center justify-between text-left"
          >
            <span className={value.building ? 'text-slate-800' : 'text-slate-400'}>
              {building ? `${building.name}（${building.floors}层）` : '请选择楼栋'}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {openB && (
            <div className="absolute z-10 mt-1 w-full card max-h-56 overflow-y-auto animate-slide-up">
              {BUILDINGS.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => {
                    onChange({ ...value, building: b.code, floorCount: b.floors });
                    setOpenB(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 border-b border-slate-50 last:border-0 ${value.building === b.code ? 'bg-brand-50/80 text-brand-700 font-medium' : ''}`}
                >
                  {b.name} <span className="text-xs text-slate-400 ml-1">{b.floors}层</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="label">单元 <span className="text-red-500">*</span></label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenU((o) => !o)}
            className="input w-full flex items-center justify-between text-left"
          >
            <span className={value.unit ? 'text-slate-800' : 'text-slate-400'}>
              {value.unit || '请选择单元'}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {openU && (
            <div className="absolute z-10 mt-1 w-full card animate-slide-up">
              {UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    onChange({ ...value, unit: u });
                    setOpenU(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 border-b border-slate-50 last:border-0 ${value.unit === u ? 'bg-brand-50/80 text-brand-700 font-medium' : ''}`}
                >
                  {u}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="label">电梯编号 <span className="text-red-500">*</span></label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenE((o) => !o)}
            className="input w-full flex items-center justify-between text-left"
          >
            <span className={value.elevatorNo ? 'text-slate-800' : 'text-slate-400'}>
              {value.elevatorNo || '请选择电梯'}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {openE && (
            <div className="absolute z-10 mt-1 w-full card animate-slide-up">
              {ELEVATORS_PER_UNIT.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    onChange({ ...value, elevatorNo: e });
                    setOpenE(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 border-b border-slate-50 last:border-0 ${value.elevatorNo === e ? 'bg-brand-50/80 text-brand-700 font-medium' : ''}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
