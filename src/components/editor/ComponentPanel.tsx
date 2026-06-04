import { useDraggable } from '@dnd-kit/core';
import {
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Calendar,
  Hash,
  Star,
  Upload,
  GripVertical,
} from 'lucide-react';
import type { FieldComponentInfo, FieldType } from '../../types/form';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Calendar,
  Hash,
  Star,
  Upload,
};

const FIELD_COMPONENTS: FieldComponentInfo[] = [
  { type: 'text', label: '单行文本', icon: 'Type' },
  { type: 'textarea', label: '多行文本', icon: 'AlignLeft' },
  { type: 'radio', label: '单选', icon: 'CircleDot' },
  { type: 'checkbox', label: '多选', icon: 'CheckSquare' },
  { type: 'select', label: '下拉框', icon: 'ChevronDown' },
  { type: 'date', label: '日期选择', icon: 'Calendar' },
  { type: 'number', label: '数字', icon: 'Hash' },
  { type: 'rating', label: '评分星星', icon: 'Star' },
  { type: 'file', label: '文件上传', icon: 'Upload' },
];

interface DraggableComponentProps {
  component: FieldComponentInfo;
}

function DraggableComponent({ component }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${component.type}`,
    data: { type: 'new-field', fieldType: component.type },
  });

  const Icon = ICON_MAP[component.icon];

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 group',
        isDragging && 'opacity-50 shadow-lg scale-105 z-50'
      )}
    >
      <GripVertical size={16} className="text-gray-300 group-hover:text-gray-400" />
      {Icon && <Icon size={20} className="text-blue-600" />}
      <span className="text-sm font-medium text-gray-700">{component.label}</span>
    </div>
  );
}

export function ComponentPanel() {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-base font-semibold text-gray-800">组件库</h2>
        <p className="text-xs text-gray-500 mt-1">拖拽组件到画布</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {FIELD_COMPONENTS.map((component) => (
          <DraggableComponent key={component.type} component={component} />
        ))}
      </div>
    </div>
  );
}
