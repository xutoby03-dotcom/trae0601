import type { FormField } from '../../types/form';
import { Switch } from '../common/Switch';
import { useFormStore } from '../../store/useFormStore';

interface BasicConfigProps {
  field: FormField;
}

export function BasicConfig({ field }: BasicConfigProps) {
  const updateField = useFormStore((state) => state.updateField);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          题目标题
        </label>
        <input
          type="text"
          value={field.title}
          onChange={(e) => updateField(field.id, { title: e.target.value })}
          placeholder="请输入题目标题"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          提示文字
        </label>
        <input
          type="text"
          value={field.placeholder}
          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
          placeholder="请输入提示文字"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <label className="text-sm font-medium text-gray-700">必填项</label>
          <p className="text-xs text-gray-400 mt-0.5">用户必须填写此字段</p>
        </div>
        <Switch
          checked={field.required}
          onChange={(checked) => updateField(field.id, { required: checked })}
        />
      </div>

      {field.type === 'number' && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最小值
            </label>
            <input
              type="number"
              value={field.min ?? 0}
              onChange={(e) => updateField(field.id, { min: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大值
            </label>
            <input
              type="number"
              value={field.max ?? 100}
              onChange={(e) => updateField(field.id, { max: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      {field.type === 'rating' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            星星数量
          </label>
          <input
            type="number"
            value={field.max ?? 5}
            min={1}
            max={10}
            onChange={(e) => updateField(field.id, { max: Number(e.target.value) })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      )}
    </div>
  );
}
