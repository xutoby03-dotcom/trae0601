import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, EyeOff, Copy } from 'lucide-react';
import { useRef } from 'react';
import type { FormField } from '../../types/form';
import { renderPreviewField } from '../fields';
import { useUIStore } from '../../store/useUIStore';
import { useFormStore } from '../../store/useFormStore';
import { cn } from '@/lib/utils';

interface FieldItemProps {
  field: FormField;
  index: number;
  hasCondition?: boolean;
}

export function FieldItem({ field, index, hasCondition }: FieldItemProps) {
  const { selectedFieldId, selectField } = useUIStore();
  const { deleteField, duplicateField, formData } = useFormStore();
  const itemRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedFieldId === field.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { type: 'existing-field', fieldId: field.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectField(field.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteField(field.id);
    if (isSelected) {
      selectField(null);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFieldId = duplicateField(field.id);
    if (newFieldId) {
      setTimeout(() => {
        selectField(newFieldId);
        const newIndex = formData.fields.findIndex((f) => f.id === newFieldId);
        if (newIndex !== -1) {
          const fieldElements = document.querySelectorAll('[data-field-item]');
          const targetElement = fieldElements[newIndex] as HTMLElement;
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 50);
    }
  };

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
    <div
      ref={(node) => {
        setNodeRef(node);
        (itemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      data-field-item
      style={style}
      onClick={handleClick}
      className={cn(
        'group relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer',
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md',
        isDragging && 'opacity-50 scale-105 shadow-2xl z-50',
        'animate-in fade-in slide-in-from-bottom-2 duration-300'
      )}
    >
      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={18} className="text-gray-400" />
        </div>
      </div>

      <button
        onClick={handleDuplicate}
        title="复制字段"
        className="absolute right-12 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-50 text-gray-400 hover:text-blue-500 z-10"
      >
        <Copy size={16} />
      </button>

      <button
        onClick={handleDelete}
        title="删除字段"
        className="absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 text-gray-400 hover:text-red-500 z-10"
      >
        <X size={16} />
      </button>

      <div className="absolute left-12 top-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
          Q{index + 1}
        </span>
        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
          {fieldTypeLabels[field.type]}
        </span>
        {hasCondition && (
          <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full flex items-center gap-1">
            <EyeOff size={12} />
            条件显示
          </span>
        )}
        {field.required && (
          <span className="text-xs px-2 py-0.5 bg-red-50 text-red-500 rounded-full">
            必填
          </span>
        )}
      </div>

      <div className="p-5 pl-12 pt-8">
        <div className="flex items-start gap-3 mb-3">
          <span className="flex-shrink-0 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            Q{index + 1}
          </span>
          <span className="font-medium text-gray-800 flex-1">{field.title}</span>
          {field.required && <span className="text-red-500 font-bold flex-shrink-0">*</span>}
        </div>
        <div className="pointer-events-none opacity-90">
          {renderPreviewField(field, undefined, () => {}, true)}
        </div>
      </div>
    </div>
  );
}
