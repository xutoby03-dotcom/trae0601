import { Settings, X } from 'lucide-react';
import type { FormField } from '../../types/form';
import { BasicConfig } from '../config/BasicConfig';
import { OptionsConfig } from '../config/OptionsConfig';
import { ConditionConfig } from '../config/ConditionConfig';
import { useUIStore } from '../../store/useUIStore';
import { useFormStore } from '../../store/useFormStore';

interface ConfigPanelProps {
  selectedField: FormField | null;
}

export function ConfigPanel({ selectedField }: ConfigPanelProps) {
  const { formData } = useFormStore();
  const { selectField } = useUIStore();

  const currentIndex = selectedField
    ? formData.fields.findIndex((f) => f.id === selectedField.id) + 1
    : 0;
  const totalFields = formData.fields.length;

  if (!selectedField) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-base font-semibold text-gray-800">字段配置</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Settings className="text-gray-400" size={28} />
          </div>
          <p className="text-gray-500 font-medium">点击画布中的字段</p>
          <p className="text-gray-400 text-sm mt-1">进行详细配置</p>
        </div>
      </div>
    );
  }

  const fieldTypeLabels: Record<string, string> = {
    text: '单行文本',
    textarea: '多行文本',
    radio: '单选',
    checkbox: '多选',
    select: '下拉框',
    date: '日期选择',
    number: '数字',
    rating: '评分',
    file: '文件上传',
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-800">字段配置</h2>
          <button
            onClick={() => selectField(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            第 {currentIndex} 题，共 {totalFields} 题
          </span>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
            {fieldTypeLabels[selectedField.type]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <BasicConfig field={selectedField} />

        {['radio', 'checkbox', 'select'].includes(selectedField.type) && (
          <div className="pt-4 border-t border-gray-100">
            <OptionsConfig field={selectedField} />
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <ConditionConfig field={selectedField} allFields={formData.fields} />
        </div>
      </div>
    </div>
  );
}
