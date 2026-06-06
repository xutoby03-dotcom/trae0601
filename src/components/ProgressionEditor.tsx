import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chord } from '../types';
import { CHORDS } from '../data/chords';
import { X, GripVertical, Play, Trash2, Save, Volume2, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface SortableChordCardProps {
  chord: Chord;
  index: number;
  onRemove: (index: number) => void;
  isPlaying?: boolean;
}

const SortableChordCard: React.FC<SortableChordCardProps> = ({
  chord,
  index,
  onRemove,
  isPlaying,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chord.id + '-' + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const playChord = () => {
    audioEngine.playChord(chord.frets);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 bg-white rounded-xl shadow-md transition-all ${
        isPlaying ? 'ring-2 ring-green-500 bg-green-50' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1 text-center">
        <span className="text-xl font-bold text-amber-900">{chord.name}</span>
      </div>
      
      <button
        onClick={playChord}
        className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
        title="播放和弦"
      >
        <Volume2 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onRemove(index)}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        title="删除"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ProgressionEditorProps {
  chordIds: string[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  onSave: () => void;
  playingIndex?: number;
  transpose?: number;
  onTranspose?: (delta: number) => void;
  onResetTranspose?: () => void;
  onApplyTranspose?: () => void;
}

export const ProgressionEditor: React.FC<ProgressionEditorProps> = ({
  chordIds,
  onReorder,
  onRemove,
  onClear,
  onSave,
  playingIndex = -1,
  transpose = 0,
  onTranspose,
  onResetTranspose,
  onApplyTranspose,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const chords = chordIds.map(id => CHORDS.find(c => c.id === id)).filter(Boolean) as Chord[];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chords.findIndex(
        (_, i) => `${chordIds[i]}-${i}` === active.id
      );
      const newIndex = chords.findIndex(
        (_, i) => `${chordIds[i]}-${i}` === over.id
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="bg-amber-50 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-amber-900">和弦进行</h3>
        <div className="flex items-center gap-2">
          {chords.length > 0 && (
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm px-2 py-1 mr-2">
              <button
                onClick={() => onTranspose?.(-1)}
                className="p-1.5 hover:bg-amber-100 rounded-md transition-colors"
                title="降半音"
              >
                <ChevronDown className="w-4 h-4 text-amber-700" />
              </button>
              <div className="px-2 text-center min-w-[50px]">
                <div className="text-[10px] text-gray-500">移调</div>
                <div className="text-sm font-bold text-amber-900">
                  {transpose === 0 ? '0' : transpose > 0 ? `+${transpose}` : transpose}
                </div>
              </div>
              <button
                onClick={() => onTranspose?.(1)}
                className="p-1.5 hover:bg-amber-100 rounded-md transition-colors"
                title="升半音"
              >
                <ChevronUp className="w-4 h-4 text-amber-700" />
              </button>
              {transpose !== 0 && (
                <>
                  <button
                    onClick={onResetTranspose}
                    className="ml-1 px-2 py-1 text-xs text-amber-600 hover:bg-amber-100 rounded-md transition-colors"
                    title="重置"
                  >
                    重置
                  </button>
                  <button
                    onClick={onApplyTranspose}
                    className="ml-1 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center gap-0.5"
                    title="应用移调"
                  >
                    <Check className="w-3 h-3" />
                    应用
                  </button>
                </>
              )}
            </div>
          )}
          <button
            onClick={onClear}
            disabled={chords.length === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
          <button
            onClick={onSave}
            disabled={chords.length === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>

      {transpose !== 0 && chords.length > 0 && (
        <div className="mb-4 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <span className="text-blue-700 text-sm">
            预览模式：已移调 {transpose > 0 ? '+' : ''}{transpose} 半音
            <span className="text-blue-500 ml-2 text-xs">（点击「应用」永久修改）</span>
          </span>
        </div>
      )}

      {chords.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>从左侧和弦库点击 + 添加和弦</p>
          <p className="text-sm mt-1">拖拽可以调整顺序</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chordIds.map((id, i) => `${id}-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {chords.map((chord, index) => (
                <SortableChordCard
                  key={`${chordIds[index]}-${index}`}
                  chord={chord}
                  index={index}
                  onRemove={onRemove}
                  isPlaying={index === playingIndex}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {chords.length > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <p className="text-sm text-gray-600">
            当前进行: <span className="font-semibold text-amber-900">
              {chords.map(c => c.name).join(' - ')}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
