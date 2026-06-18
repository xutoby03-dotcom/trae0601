import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { FlavorWithStock } from '../../types';
import { useSupplyStore } from '../../store/useSupplyStore';

interface ConsumeFormProps {
  flavor: FlavorWithStock;
  onSubmit: (quantity: number, department: string) => void;
  onCancel: () => void;
}

export function ConsumeForm({ flavor, onSubmit, onCancel }: ConsumeFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [department, setDepartment] = useState('');
  const departments = useSupplyStore((state) => state.departments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) {
      alert('请选择部门');
      return;
    }
    onSubmit(quantity, department);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-6">
        <div className="w-32 h-32 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
          <img
            src={flavor.boxPhoto}
            alt={flavor.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-coffee-900 mb-1">
            {flavor.name}
          </h3>
          <p className="text-coffee-500 mb-2">{flavor.brand}</p>
          <p className="text-sm text-coffee-600">
            当前库存: <span className="font-bold text-coffee-800">{flavor.totalStock}</span> 颗
          </p>
          <p className="text-sm text-coffee-600">
            单价: <span className="font-bold text-coffee-800">¥{flavor.unitPrice.toFixed(2)}</span> / 颗
          </p>
        </div>
      </div>

      <div>
        <label className="label">取用数量</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="btn-secondary w-12 h-12 p-0 text-xl"
          >
            <Minus className="w-5 h-5" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(flavor.totalStock, parseInt(e.target.value) || 1)))}
            className="input w-24 text-center text-xl font-bold"
            min={1}
            max={flavor.totalStock}
          />
          <button
            type="button"
            onClick={() => setQuantity(Math.min(flavor.totalStock, quantity + 1))}
            className="btn-secondary w-12 h-12 p-0 text-xl"
          >
            <Plus className="w-5 h-5" />
          </button>
          <span className="text-coffee-500 text-sm">
            总计: ¥{(quantity * flavor.unitPrice).toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <label className="label">所在部门</label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="select"
          required
        >
          <option value="">请选择部门</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          取消
        </button>
        <button type="submit" className="btn-primary flex-1">
          确认取用
        </button>
      </div>
    </form>
  );
}
