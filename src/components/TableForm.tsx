import { useState } from 'react';

interface TableFormProps {
  onClose: () => void;
  onSubmit: (data: { tableNumber: number; tableName?: string; capacity: number }) => void;
}

export default function TableForm({ onClose, onSubmit }: TableFormProps) {
  const [tableNumber, setTableNumber] = useState(1);
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ tableNumber, tableName: tableName || undefined, capacity });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-wedding-dark">添加桌位</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              桌号 <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={tableNumber}
              onChange={e => setTableNumber(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              桌名（可选）
            </label>
            <input
              type="text"
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              placeholder="如：主桌、亲友桌"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              座位数 <span className="text-red-400">*</span>
            </label>
            <select
              value={capacity}
              onChange={e => setCapacity(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
            >
              {[6, 8, 10, 12, 14, 16].map(n => (
                <option key={n} value={n}>{n} 人桌</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-wedding-gold text-white rounded-lg hover:bg-wedding-gold/90 transition-colors font-medium"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
