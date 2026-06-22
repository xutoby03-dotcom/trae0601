import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { SamplingSite, PermitStatus } from '@/types';
import { useSamplingStore } from '@/stores/useSamplingStore';
import { cn } from '@/lib/utils';

interface SiteFormProps {
  editingSite?: SamplingSite | null;
  onClose?: () => void;
}

export default function SiteForm({ editingSite, onClose }: SiteFormProps) {
  const { addSite, updateSite } = useSamplingStore();
  const [formData, setFormData] = useState({
    name: '',
    targetSpecies: '',
    lowTideTime: '',
    travelTimeMinutes: 30,
    permitStatus: 'pending' as PermitStatus,
    notes: '',
  });

  useEffect(() => {
    if (editingSite) {
      const date = new Date(editingSite.lowTideTime);
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData({
        name: editingSite.name,
        targetSpecies: editingSite.targetSpecies,
        lowTideTime: localDateTime,
        travelTimeMinutes: editingSite.travelTimeMinutes,
        permitStatus: editingSite.permitStatus,
        notes: editingSite.notes,
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);
      const localDateTime = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData({
        name: '',
        targetSpecies: '',
        lowTideTime: localDateTime,
        travelTimeMinutes: 30,
        permitStatus: 'pending',
        notes: '',
      });
    }
  }, [editingSite]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.targetSpecies.trim()) return;

    const lowTideIso = new Date(formData.lowTideTime).toISOString();

    if (editingSite) {
      updateSite(editingSite.id, {
        ...formData,
        lowTideTime: lowTideIso,
      });
    } else {
      addSite({
        ...formData,
        lowTideTime: lowTideIso,
      });
    }

    if (onClose) onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 font-display">
          {editingSite ? '编辑点位' : '新增点位'}
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            点位名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例如：东滩一号点位"
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm',
              'border-slate-200 bg-white text-slate-800',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
              'transition-all'
            )}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            目标贝种 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="targetSpecies"
            value={formData.targetSpecies}
            onChange={handleChange}
            placeholder="例如：菲律宾蛤仔"
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm',
              'border-slate-200 bg-white text-slate-800',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
              'transition-all'
            )}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              低潮时间
            </label>
            <input
              type="datetime-local"
              name="lowTideTime"
              value={formData.lowTideTime}
              onChange={handleChange}
              className={cn(
                'w-full px-3 py-2 border rounded-lg text-sm',
                'border-slate-200 bg-white text-slate-800',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
                'transition-all'
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              往返路程（分钟）
            </label>
            <input
              type="number"
              name="travelTimeMinutes"
              value={formData.travelTimeMinutes}
              onChange={handleChange}
              min="1"
              max="240"
              className={cn(
                'w-full px-3 py-2 border rounded-lg text-sm',
                'border-slate-200 bg-white text-slate-800',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
                'transition-all'
              )}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            采样许可状态
          </label>
          <select
            name="permitStatus"
            value={formData.permitStatus}
            onChange={handleChange}
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm',
              'border-slate-200 bg-white text-slate-800',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
              'transition-all'
            )}
          >
            <option value="approved">已批准</option>
            <option value="pending">待审批</option>
            <option value="denied">已拒绝</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            备注
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="注意事项、交通路线等..."
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm resize-none',
              'border-slate-200 bg-white text-slate-800',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
              'transition-all'
            )}
          />
        </div>
      </div>

      <button
        type="submit"
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg',
          'bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-sm',
          'transition-all hover:shadow-lg active:scale-[0.98]'
        )}
      >
        <Plus size={16} />
        {editingSite ? '保存修改' : '添加点位'}
      </button>
    </form>
  );
}
