import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ComponentPanel } from '../components/editor/ComponentPanel';
import { FormCanvas } from '../components/editor/FormCanvas';
import { ConfigPanel } from '../components/editor/ConfigPanel';
import { Toolbar } from '../components/editor/Toolbar';
import { PreviewModal } from '../components/preview/PreviewModal';
import { Toast } from '../components/common/Toast';
import { useFormStore } from '../store/useFormStore';
import { useUIStore } from '../store/useUIStore';
import { useLocalStorageAutoSave } from '../hooks/useLocalStorage';
import type { FieldType, FormField } from '../types/form';
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
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  text: Type,
  textarea: AlignLeft,
  radio: CircleDot,
  checkbox: CheckSquare,
  select: ChevronDown,
  date: Calendar,
  number: Hash,
  rating: Star,
  file: Upload,
};

const FIELD_LABELS: Record<string, string> = {
  text: '单行文本',
  textarea: '多行文本',
  radio: '单选',
  checkbox: '多选',
  select: '下拉框',
  date: '日期选择',
  number: '数字',
  rating: '评分星星',
  file: '文件上传',
};

export function EditorPage() {
  const { formData, init, addField, reorderFields } = useFormStore();
  const { isPreviewMode, setPreviewMode, selectedFieldId, toast } = useUIStore();
  const [activeFieldType, setActiveFieldType] = useState<FieldType | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);

  useLocalStorageAutoSave();

  useEffect(() => {
    init();
  }, [init]);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const selectedField = formData.fields.find((f) => f.id === selectedFieldId) || null;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === 'new-field') {
      setActiveFieldType(data.fieldType);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setIsOverCanvas(over?.id === 'form-canvas');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveFieldType(null);
    setIsOverCanvas(false);

    if (!over) return;

    const activeData = active.data.current;

    if (activeData?.type === 'new-field' && over.id === 'form-canvas') {
      addField(activeData.fieldType);
      return;
    }

    if (activeData?.type === 'existing-field') {
      const oldIndex = formData.fields.findIndex((f) => f.id === active.id);
      const newIndex = formData.fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderFields(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toolbar />

      {isPreviewMode ? (
        <PreviewModal
          open={isPreviewMode}
          onClose={() => setPreviewMode(false)}
          formData={formData}
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-hidden">
            <ComponentPanel />
            <FormCanvas isOver={isOverCanvas} />
            <ConfigPanel selectedField={selectedField} />
          </div>

          <DragOverlay>
            {activeFieldType && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-blue-400 shadow-xl opacity-90">
                {(() => {
                  const Icon = ICON_MAP[activeFieldType];
                  return Icon ? <Icon size={20} className="text-blue-600" /> : null;
                })()}
                <span className="text-sm font-medium text-gray-700">
                  {FIELD_LABELS[activeFieldType]}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {toast && <Toast message={toast.message} type="success" visible={toast.visible} />}
    </div>
  );
}
