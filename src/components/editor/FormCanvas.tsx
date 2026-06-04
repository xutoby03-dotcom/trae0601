import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { FormField } from '../../types/form';
import { FieldItem } from './FieldItem';
import { useFormStore } from '../../store/useFormStore';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '@/lib/utils';

interface FormCanvasProps {
  isOver?: boolean;
}

export function FormCanvas({ isOver }: FormCanvasProps) {
  const { formData, updateFormMeta } = useFormStore();
  const { selectField, selectedFieldId } = useUIStore();
  const fields = formData.fields;

  const { setNodeRef } = useDroppable({
    id: 'form-canvas',
  });

  const handleCanvasClick = () => {
    selectField(null);
  };

  return (
    <div
      className="flex-1 bg-gray-50 overflow-y-auto"
      onClick={handleCanvasClick}
    >
      <div className="max-w-3xl mx-auto p-8">
        <div className="mb-8 bg-white rounded-xl p-8 border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormMeta({ title: e.target.value })}
            placeholder="请输入表单标题"
            onClick={(e) => e.stopPropagation()}
            className="w-full text-2xl font-bold text-gray-800 placeholder-gray-300 border-none outline-none bg-transparent mb-3"
          />
          <textarea
            value={formData.description}
            onChange={(e) => updateFormMeta({ description: e.target.value })}
            placeholder="请输入表单描述（可选）"
            onClick={(e) => e.stopPropagation()}
            rows={2}
            className="w-full text-gray-500 placeholder-gray-300 border-none outline-none bg-transparent resize-none"
          />
        </div>

        <div
          ref={setNodeRef}
          className={cn(
            'space-y-4 min-h-96 transition-all duration-200',
            isOver && 'ring-2 ring-blue-400 ring-offset-4 rounded-xl bg-blue-50/30'
          )}
        >
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Plus className="text-blue-500" size={32} />
              </div>
              <p className="text-gray-500 text-lg font-medium">从左侧拖拽组件到这里</p>
              <p className="text-gray-400 text-sm mt-1">或者点击左侧组件快速添加</p>
            </div>
          ) : (
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field: FormField, index: number) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  index={index}
                  hasCondition={!!field.condition}
                />
              ))}
            </SortableContext>
          )}
        </div>

        {isOver && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-600 text-sm animate-pulse">
            松开鼠标添加字段
          </div>
        )}
      </div>
    </div>
  );
}
