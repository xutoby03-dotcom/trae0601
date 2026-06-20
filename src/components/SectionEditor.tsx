import { useState } from 'react';
import {
  Layers,
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
  Check,
  X,
  GripVertical,
} from 'lucide-react';
import type { Section, Tag, SectionType } from '@/types';
import { SECTION_TYPE_LABELS, SECTION_TYPE_COLORS } from '@/types';
import { formatTimeShort } from '@/utils';

interface SectionEditorProps {
  sections: Section[];
  tags: Tag[];
  songDuration: number;
  songId: string;
  onSectionClick: (startTime: number) => void;
  onAddSection: (songId: string, type: SectionType, startTime: number, endTime: number) => Section;
  onDeleteSection: (id: string) => void;
  onUpdateSection: (id: string, updates: Partial<Section>) => void;
}

const sectionTypes: SectionType[] = ['intro', 'verse', 'chorus', 'bridge', 'outro', 'other'];
const sectionTypeColors: Record<SectionType, string> = {
  intro: '#3b82f6',
  verse: '#22c55e',
  chorus: '#f97316',
  bridge: '#8b5cf6',
  outro: '#6b7280',
  other: '#9ca3af',
};

export function SectionEditor({
  sections,
  tags,
  songDuration,
  songId,
  onSectionClick,
  onAddSection,
  onDeleteSection,
  onUpdateSection,
}: SectionEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    type: SectionType;
    startTime: string;
    endTime: string;
  }>({ name: '', type: 'verse', startTime: '0', endTime: '0' });

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<{
    name: string;
    type: SectionType;
    startTime: string;
    endTime: string;
  }>({ name: '', type: 'verse', startTime: '0', endTime: '30' });

  const startEdit = (section: Section) => {
    setEditingId(section.id);
    setEditForm({
      name: section.name || SECTION_TYPE_LABELS[section.type],
      type: section.type,
      startTime: section.startTime.toFixed(2),
      endTime: section.endTime.toFixed(2),
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    const startTime = parseFloat(editForm.startTime);
    const endTime = parseFloat(editForm.endTime);
    if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
      alert('请输入有效的起止时间（秒），结束时间需大于开始时间');
      return;
    }
    onUpdateSection(editingId, {
      name: editForm.name,
      type: editForm.type,
      startTime: Math.max(0, startTime),
      endTime: Math.min(songDuration, endTime),
      color: sectionTypeColors[editForm.type],
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleAdd = () => {
    const startTime = parseFloat(addForm.startTime);
    const endTime = parseFloat(addForm.endTime);
    if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
      alert('请输入有效的起止时间（秒）');
      return;
    }
    const section = onAddSection(
      songId,
      addForm.type,
      Math.max(0, startTime),
      Math.min(songDuration, endTime)
    );
    onUpdateSection(section.id, {
      name: addForm.name || SECTION_TYPE_LABELS[addForm.type],
      color: sectionTypeColors[addForm.type],
    });
    setIsAdding(false);
    setAddForm({ name: '', type: 'verse', startTime: '0', endTime: '30' });
  };

  const getSectionTagCount = (sectionId: string) =>
    tags.filter((t) => t.sectionId === sectionId).length;

  const getSectionUnresolvedCount = (sectionId: string) =>
    tags.filter((t) => t.sectionId === sectionId && t.status !== 'resolved').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Layers size={14} />
          <span>段落编辑</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors ${
            isAdding
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              : 'border-slate-700 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          <Plus size={12} />
          新增段落
        </button>
      </div>

      {isAdding && (
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2">
          <p className="text-xs font-medium text-slate-300 mb-2">新增段落</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">名称</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="如：主歌3"
                className="w-full px-2 py-1.5 text-xs bg-slate-900/60 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">类型</label>
              <select
                value={addForm.type}
                onChange={(e) =>
                  setAddForm({ ...addForm, type: e.target.value as SectionType })
                }
                className="w-full px-2 py-1.5 text-xs bg-slate-900/60 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-orange-500/50"
              >
                {sectionTypes.map((t) => (
                  <option key={t} value={t}>
                    {SECTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">开始(秒)</label>
              <input
                type="number"
                step="0.1"
                value={addForm.startTime}
                onChange={(e) => setAddForm({ ...addForm, startTime: e.target.value })}
                className="w-full px-2 py-1.5 text-xs font-mono bg-slate-900/60 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">结束(秒)</label>
              <input
                type="number"
                step="0.1"
                value={addForm.endTime}
                onChange={(e) => setAddForm({ ...addForm, endTime: e.target.value })}
                className="w-full px-2 py-1.5 text-xs font-mono bg-slate-900/60 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() => {
                setIsAdding(false);
                setAddForm({ name: '', type: 'verse', startTime: '0', endTime: '30' });
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs rounded-md border border-slate-700 text-slate-400 hover:bg-slate-700/50 transition-colors"
            >
              <X size={12} />
              取消
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30 transition-colors"
            >
              <Check size={12} />
              确认添加
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
        {sections.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            暂无段落，点击上方"新增段落"开始划分
          </p>
        ) : (
          sections.map((section) => {
            const isEditing = editingId === section.id;
            const tagCount = getSectionTagCount(section.id);
            const unresolvedCount = getSectionUnresolvedCount(section.id);

            if (isEditing) {
              return (
                <div
                  key={section.id}
                  className="p-3 rounded-lg bg-slate-800/70 border border-orange-500/40 space-y-2"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">名称</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs bg-slate-900/60 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">类型</label>
                      <select
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm({ ...editForm, type: e.target.value as SectionType })
                        }
                        className="w-full px-2 py-1.5 text-xs bg-slate-900/60 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-orange-500/50"
                      >
                        {sectionTypes.map((t) => (
                          <option key={t} value={t}>
                            {SECTION_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">开始(秒)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs font-mono bg-slate-900/60 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">结束(秒)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.endTime}
                        onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs font-mono bg-slate-900/60 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded-md border border-slate-700 text-slate-400 hover:bg-slate-700/50 transition-colors"
                    >
                      <X size={12} />
                      取消
                    </button>
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30 transition-colors"
                    >
                      <Check size={12} />
                      保存
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={section.id}
                className="group rounded-lg border border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600/50 transition-colors overflow-hidden"
              >
                <button
                  onClick={() => onSectionClick(section.startTime)}
                  className="w-full flex items-center gap-3 p-2.5 text-left"
                >
                  <div
                    className="w-1 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: section.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <GripVertical
                        size={12}
                        className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
                      <span className="text-sm text-slate-200 font-medium truncate">
                        {section.name || SECTION_TYPE_LABELS[section.type]}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{
                          backgroundColor: `${section.color}20`,
                          color: section.color,
                        }}
                      >
                        {SECTION_TYPE_LABELS[section.type]}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 ml-5">
                      {formatTimeShort(section.startTime)} -{' '}
                      {formatTimeShort(section.endTime)}
                      <span className="ml-2 text-slate-600">
                        ({(section.endTime - section.startTime).toFixed(1)}秒)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {tagCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                        {tagCount}
                      </span>
                    )}
                    {unresolvedCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                        {unresolvedCount}
                      </span>
                    )}
                    <ChevronRight
                      size={14}
                      className="text-slate-600 group-hover:text-slate-400 transition-colors"
                    />
                  </div>
                </button>
                <div className="hidden group-hover:flex border-t border-slate-700/40 bg-slate-800/40 px-2 py-1.5 justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(section);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                  >
                    <Edit3 size={12} />
                    编辑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除段落 "${section.name || SECTION_TYPE_LABELS[section.type]}" 吗？`)) {
                        onDeleteSection(section.id);
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] rounded text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={12} />
                    删除
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
