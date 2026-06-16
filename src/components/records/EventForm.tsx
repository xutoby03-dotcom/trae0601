import { useState, useEffect, FormEvent } from 'react';
import { EventRecord, EventType } from '../../types';
import { eventTypeConfig, cn } from '../../utils/helpers';
import { useFleetStore } from '../../store/fleetStore';
import { Save, X, AlertCircle, Car, Calendar, FileText } from 'lucide-react';

interface EventFormProps {
  event?: EventRecord;
  onSubmit: (data: Omit<EventRecord, 'id'>) => void;
  onCancel: () => void;
}

interface FormData {
  type: EventType;
  vehicleId: string | null;
  time: string;
  description: string;
}

interface FormErrors {
  type?: string;
  time?: string;
  description?: string;
}

const eventTypeOptions: EventType[] = ['delay', 'detour', 'breakdown', 'accident', 'other'];

const formatDateTimeLocal = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getInitialFormData = (): FormData => {
  const now = new Date();
  return {
    type: 'other',
    vehicleId: null,
    time: formatDateTimeLocal(now.toISOString()),
    description: '',
  };
};

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const vehicles = useFleetStore((state) => state.vehicles);
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (event) {
      setFormData({
        type: event.type,
        vehicleId: event.vehicleId,
        time: formatDateTimeLocal(event.time),
        description: event.description,
      });
    }
  }, [event]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.type) {
      newErrors.type = '请选择事件类型';
    }
    if (!formData.time) {
      newErrors.time = '请选择时间';
    }
    if (!formData.description.trim()) {
      newErrors.description = '请输入事件描述';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        time: new Date(formData.time).toISOString(),
      });
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const inputClass = (hasError?: string) =>
    cn(
      'w-full px-3 py-2.5 rounded-xl border bg-white text-gray-800 placeholder-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-forest-500/30 transition-all',
      hasError ? 'border-red-300 focus:border-red-400' : 'border-cream-200 focus:border-forest-400'
    );

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <AlertCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            事件类型 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => updateField('type', e.target.value as EventType)}
            className={inputClass(errors.type)}
          >
            {eventTypeOptions.map((type) => (
              <option key={type} value={type}>
                {eventTypeConfig[type].label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-xs text-red-500 mt-1">{errors.type}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <Car className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            关联车辆
          </label>
          <select
            value={formData.vehicleId || ''}
            onChange={(e) => updateField('vehicleId', e.target.value || null)}
            className={inputClass()}
          >
            <option value="">不关联</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.carModel} ({v.plateNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className={labelClass}>
            <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            时间 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.time}
            onChange={(e) => updateField('time', e.target.value)}
            className={inputClass(errors.time)}
          />
          {errors.time && (
            <p className="text-xs text-red-500 mt-1">{errors.time}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>
            <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            事件描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="请详细描述事件情况..."
            rows={4}
            className={cn(inputClass(errors.description), 'resize-none')}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          取消
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-forest-600 text-white hover:bg-forest-700 transition-colors flex items-center gap-2 shadow"
        >
          <Save className="w-4 h-4" />
          {event ? '保存修改' : '添加记录'}
        </button>
      </div>
    </form>
  );
}
