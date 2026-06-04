import { Trash2, Plus } from 'lucide-react';
import type { FormField, Condition } from '../../types/form';
import { useFormStore } from '../../store/useFormStore';

interface ConditionConfigProps {
  field: FormField;
  allFields: FormField[];
}

export function ConditionConfig({ field, allFields }: ConditionConfigProps) {
  const updateField = useFormStore((state) => state.updateField);

  const availableFields = allFields
    .filter((f) => f.id !== field.id && ['radio', 'checkbox', 'select'].includes(f.type))
    .map((f) => ({
      ...f,
      index: allFields.findIndex((af) => af.id === f.id) + 1,
    }));

  const handleConditionChange = (updates: Partial<Condition>) => {
    const currentCondition = field.condition || {
      fieldId: '',
      operator: 'equals' as const,
      value: '',
    };
    updateField(field.id, {
      condition: { ...currentCondition, ...updates },
    });
  };

  const removeCondition = () => {
    updateField(field.id, { condition: undefined });
  };

  const addCondition = () => {
    if (availableFields.length > 0) {
      const firstField = availableFields[0];
      const firstOption = firstField.options?.[0];
      updateField(field.id, {
        condition: {
          fieldId: firstField.id,
          operator: 'equals',
          value: firstOption?.value || '',
        },
      });
    }
  };

  const selectedField = allFields.find((f) => f.id === field.condition?.fieldId);
  const selectedOptions = selectedField?.options || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">条件逻辑</label>
        <span className="text-xs text-gray-400">设置显示条件</span>
      </div>

      {availableFields.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            请先添加单选、多选或下拉框类型的题目，才能设置条件逻辑
          </p>
        </div>
      )}

      {!field.condition && availableFields.length > 0 && (
        <button
          onClick={addCondition}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-500 hover:text-blue-600"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">添加显示条件</span>
        </button>
      )}

      {field.condition && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
          <p className="text-sm text-blue-700 font-medium">
            满足以下条件时显示本题
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">关联题目</label>
              <select
                value={field.condition.fieldId}
                onChange={(e) => {
                  const newField = allFields.find((f) => f.id === e.target.value);
                  const firstOption = newField?.options?.[0];
                  handleConditionChange({
                    fieldId: e.target.value,
                    value: firstOption?.value || '',
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    Q{f.index} {f.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">判断条件</label>
              <select
                value={field.condition.operator}
                onChange={(e) =>
                  handleConditionChange({
                    operator: e.target.value as 'equals' | 'not_equals' | 'contains',
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="equals">等于</option>
                <option value="not_equals">不等于</option>
                <option value="contains">包含</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">目标选项</label>
              <select
                value={field.condition.value}
                onChange={(e) => handleConditionChange({ value: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedOptions.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={removeCondition}
            className="w-full flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 size={16} />
            删除条件
          </button>
        </div>
      )}
    </div>
  );
}
