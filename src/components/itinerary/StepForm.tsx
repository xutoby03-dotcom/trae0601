import { useState, useEffect, FormEvent } from 'react';
import { ItineraryStep, ItineraryType } from '../../types';
import { itineraryTypeConfig, cn } from '../../utils/helpers';
import { Save, X, Flag, ShoppingCart, Fuel, Tent, Camera } from 'lucide-react';

interface StepFormProps {
  step?: ItineraryStep;
  onSubmit: (data: Omit<ItineraryStep, 'id'>) => void;
  onCancel: () => void;
}

const formatDateTimeLocal = (isoString?: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const iconMap = {
  meetup: Flag,
  supply: ShoppingCart,
  fuel: Fuel,
  camp: Tent,
  scenic: Camera,
};

export function StepForm({ step, onSubmit, onCancel }: StepFormProps) {
  const [type, setType] = useState<ItineraryType>(step?.type || 'meetup');
  const [name, setName] = useState(step?.name || '');
  const [address, setAddress] = useState(step?.address || '');
  const [arriveTime, setArriveTime] = useState(formatDateTimeLocal(step?.arriveTime));
  const [departTime, setDepartTime] = useState(formatDateTimeLocal(step?.departTime));
  const [note, setNote] = useState(step?.note || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (step) {
      setType(step.type);
      setName(step.name);
      setAddress(step.address);
      setArriveTime(formatDateTimeLocal(step.arriveTime));
      setDepartTime(formatDateTimeLocal(step.departTime));
      setNote(step.note || '');
    }
  }, [step]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = '请输入地点名称';
    if (!arriveTime) newErrors.arriveTime = '请选择到达时间';
    if (departTime && arriveTime && new Date(departTime) <= new Date(arriveTime)) {
      newErrors.departTime = '出发时间需晚于到达时间';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      type,
      name: name.trim(),
      address: address.trim(),
      arriveTime: new Date(arriveTime).toISOString(),
      departTime: departTime ? new Date(departTime).toISOString() : undefined,
      note: note.trim() || undefined,
      order: step?.order ?? 0,
    });
  };

  const itineraryTypes: ItineraryType[] = ['meetup', 'supply', 'fuel', 'camp', 'scenic'];

  const inputClass = (field: string) =>
    cn(
      'w-full px-4 py-2.5 rounded-xl border bg-white text-gray-800 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-300',
      errors[field] ? 'border-red-300 focus:border-red-400' : 'border-cream-200 focus:border-forest-400'
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">行程类型</label>
        <div className="grid grid-cols-5 gap-2">
          {itineraryTypes.map((t) => {
            const config = itineraryTypeConfig[t];
            const Icon = iconMap[t];
            const selected = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                  selected
                    ? `${config.color} border-transparent text-white shadow-md`
                    : 'bg-white border-cream-200 text-gray-600 hover:border-cream-300 hover:bg-cream-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          地点名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如：八达岭长城景区"
          className={inputClass('name')}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">地址</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="如：北京市延庆区G6京藏高速58号出口"
          className={inputClass('address')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            到达时间 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={arriveTime}
            onChange={(e) => setArriveTime(e.target.value)}
            className={inputClass('arriveTime')}
          />
          {errors.arriveTime && <p className="text-xs text-red-500 mt-1">{errors.arriveTime}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">出发时间（可选）</label>
          <input
            type="datetime-local"
            value={departTime}
            onChange={(e) => setDepartTime(e.target.value)}
            className={inputClass('departTime')}
          />
          {errors.departTime && <p className="text-xs text-red-500 mt-1">{errors.departTime}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="如：需要提前预约门票，停车费20元/天"
          rows={3}
          className={cn(inputClass('note'), 'resize-none')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-600 bg-cream-100 hover:bg-cream-200 transition-colors font-medium"
        >
          <X className="w-4 h-4" />
          取消
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-forest-600 hover:bg-forest-700 transition-colors font-medium shadow-md"
        >
          <Save className="w-4 h-4" />
          {step ? '保存修改' : '添加节点'}
        </button>
      </div>
    </form>
  );
}
