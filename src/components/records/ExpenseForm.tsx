import { useState, useEffect, FormEvent } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { expenseCategoryConfig, cn } from '../../utils/helpers';
import { useFleetStore } from '../../store/fleetStore';
import { Save, X, DollarSign, Car, Calendar, FileText, User } from 'lucide-react';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

interface FormData {
  category: ExpenseCategory;
  amount: number;
  vehicleId: string | null;
  payerId: string;
  time: string;
  note: string;
}

interface FormErrors {
  category?: string;
  amount?: string;
  payerId?: string;
  time?: string;
}

const expenseCategoryOptions: ExpenseCategory[] = ['fuel', 'toll', 'parking', 'food', 'supply', 'other'];

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

const getInitialFormData = (people: { id: string }[]): FormData => {
  const now = new Date();
  return {
    category: 'other',
    amount: 0,
    vehicleId: null,
    payerId: people.length > 0 ? people[0].id : '',
    time: formatDateTimeLocal(now.toISOString()),
    note: '',
  };
};

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const vehicles = useFleetStore((state) => state.vehicles);
  const people = useFleetStore((state) => state.people);
  const [formData, setFormData] = useState<FormData>(getInitialFormData(people));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category,
        amount: expense.amount,
        vehicleId: expense.vehicleId,
        payerId: expense.payerId,
        time: formatDateTimeLocal(expense.time),
        note: expense.note || '',
      });
    } else {
      setFormData(getInitialFormData(people));
    }
  }, [expense, people]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category) {
      newErrors.category = '请选择费用类型';
    }
    if (formData.amount <= 0) {
      newErrors.amount = '金额必须大于0';
    }
    if (!formData.payerId) {
      newErrors.payerId = '请选择支付人';
    }
    if (!formData.time) {
      newErrors.time = '请选择时间';
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
            <DollarSign className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            费用类型 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => updateField('category', e.target.value as ExpenseCategory)}
            className={inputClass(errors.category)}
          >
            {expenseCategoryOptions.map((category) => (
              <option key={category} value={category}>
                {expenseCategoryConfig[category].label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-500 mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <DollarSign className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            金额 (元) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={formData.amount}
            onChange={(e) => updateField('amount', Number(e.target.value))}
            placeholder="请输入金额"
            className={inputClass(errors.amount)}
          />
          {errors.amount && (
            <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            支付人 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.payerId}
            onChange={(e) => updateField('payerId', e.target.value)}
            className={inputClass(errors.payerId)}
          >
            <option value="">请选择支付人</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.payerId && (
            <p className="text-xs text-red-500 mt-1">{errors.payerId}</p>
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
            备注
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => updateField('note', e.target.value)}
            placeholder="添加备注信息（可选）..."
            rows={3}
            className={cn(inputClass(), 'resize-none')}
          />
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
          {expense ? '保存修改' : '添加记录'}
        </button>
      </div>
    </form>
  );
}
