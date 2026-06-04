import { Plus, X, GripVertical } from 'lucide-react';
import type { FormField } from '../../types/form';
import { useFormStore } from '../../store/useFormStore';
import { cn } from '@/lib/utils';

interface OptionsConfigProps {
  field: FormField;
}

export function OptionsConfig({ field }: OptionsConfigProps) {
  const { addOption, updateOption, deleteOption } = useFormStore();

  if (!['radio', 'checkbox', 'select'].includes(field.type)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">选项列表</label>
        <button
          onClick={() => addOption(field.id)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <Plus size={16} />
          添加选项
        </button>
      </div>

      <div className="space-y-2">
        {field.options?.map((option, index) => (
          <div
            key={option.id}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
          >
            <GripVertical size={16} className="text-gray-300 cursor-grab" />
            <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
            <input
              type="text"
              value={option.label}
              onChange={(e) =>
                updateOption(field.id, option.id, {
                  label: e.target.value,
                  value: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                })
              }
              placeholder="选项内容"
              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => deleteOption(field.id, option.id)}
              className={cn(
                'p-1 rounded transition-colors',
                field.options && field.options.length > 1
                  ? 'opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500'
                  : 'opacity-30 cursor-not-allowed'
              )}
              disabled={!field.options || field.options.length <= 1}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        提示：修改选项内容会自动更新选项值
      </p>
    </div>
  );
}
