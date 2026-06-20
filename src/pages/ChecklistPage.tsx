import { useState } from 'react';
import {
  ClipboardList, ArrowUpDown, Trash2, Edit3, Check, X, Plus,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Package,
  ArrowRight, Eye, StickyNote, GripVertical
} from 'lucide-react';
import { useAstroStore } from '@/store/useAstroStore';
import { formatDateChinese } from '@/utils/astro';
import { EQUIPMENT_CATEGORIES } from '@/data/equipment';
import type { ChecklistTarget, EquipmentCategory } from '@/types';

function TargetItem({
  item,
  index,
  onMove,
  onRemove,
  onToggleDone,
  onEditNote,
}: {
  item: ChecklistTarget;
  index: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  onToggleDone: () => void;
  onEditNote: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(item.notes);
  const diffCls = {
    easy: 'chip-easy',
    medium: 'chip-medium',
    hard: 'chip-hard',
  }[item.target.difficulty];
  const diffLabel = { easy: '入门', medium: '进阶', hard: '挑战' }[item.target.difficulty];

  return (
    <div
      className={`glass-card p-4 transition-all ${item.completed ? 'opacity-60 bg-aurora-green/[0.03] border-aurora-green/20' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/60 cursor-grab">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <button
            onClick={() => onMove(index, index + 1)}
            disabled={index >= 100}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-purple/30 to-nebula-pink/30 border border-white/10 flex items-center justify-center text-lg font-bold text-white">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`font-semibold text-white truncate ${item.completed ? 'line-through decoration-white/30' : ''}`}>
                  {item.target.name}
                </h4>
                <span className={`chip ${diffCls} !text-[10px]`}>{diffLabel}</span>
                <span className="chip bg-white/5 border-white/10 !text-[10px] text-white/60">
                  {item.target.typeLabel}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5 truncate">
                {item.target.commonName} · {item.target.constellation} · 最佳 {item.target.bestTime}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onToggleDone}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                  ${item.completed
                    ? 'bg-aurora-green/20 text-aurora-green border border-aurora-green/30'
                    : 'bg-white/5 border border-white/10 text-white/40 hover:text-aurora-green hover:border-aurora-green/30 hover:bg-aurora-green/10'}`}
                title={item.completed ? '标记为未完成' : '标记为已完成'}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onRemove}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/10 transition-all"
                title="移除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-start gap-2">
              <StickyNote className="w-3.5 h-3.5 text-moonlight/60 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onEditNote(note);
                          setEditing(false);
                        }
                        if (e.key === 'Escape') {
                          setNote(item.notes);
                          setEditing(false);
                        }
                      }}
                      placeholder="添加备注：对焦参数、构图思路、拍摄顺序..."
                      className="flex-1 px-2 py-1 rounded-md bg-space-900 border border-nebula-purple/30 text-xs text-white outline-none"
                    />
                    <button
                      onClick={() => { onEditNote(note); setEditing(false); }}
                      className="w-6 h-6 rounded-md bg-aurora-green/20 text-aurora-green flex items-center justify-center"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { setNote(item.notes); setEditing(false); }}
                      className="w-6 h-6 rounded-md bg-white/5 text-white/50 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full text-left"
                  >
                    <p className={`text-xs leading-relaxed ${item.notes ? 'text-white/70' : 'text-white/30 italic'}`}>
                      {item.notes || '点击添加备注：对焦参数、构图思路...'}
                    </p>
                  </button>
                )}
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 text-[11px] text-white/40 flex-wrap">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              星等 {item.target.magnitude}
            </span>
            <span>📏 {item.target.size}</span>
            <span>🌌 {item.target.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const selectedDate = useAstroStore(s => s.selectedDate);
  const checklistTargets = useAstroStore(s => s.checklistTargets);
  const reorderTargets = useAstroStore(s => s.reorderTargets);
  const removeTarget = useAstroStore(s => s.removeTarget);
  const toggleTargetCompleted = useAstroStore(s => s.toggleTargetCompleted);
  const updateTargetNotes = useAstroStore(s => s.updateTargetNotes);

  const equipment = useAstroStore(s => s.equipment);
  const toggleEquipment = useAstroStore(s => s.toggleEquipment);
  const addCustomEquipment = useAstroStore(s => s.addCustomEquipment);
  const resetEquipment = useAstroStore(s => s.resetEquipment);
  const getPackedProgress = useAstroStore(s => s.getPackedProgress);

  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['optics', 'imaging', 'mount', 'accessory', 'power']));
  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipCat, setNewEquipCat] = useState<EquipmentCategory>('accessory');
  const [showAdd, setShowAdd] = useState(false);

  const progress = getPackedProgress();
  const essentialUnpacked = equipment.filter(e => e.essential && !e.packed);

  const toggleCat = (k: string) => {
    setOpenCats(prev => {
      const s = new Set(prev);
      s.has(k) ? s.delete(k) : s.add(k);
      return s;
    });
  };

  const handleAddEquip = () => {
    if (!newEquipName.trim()) return;
    addCustomEquipment(newEquipName.trim(), newEquipCat);
    setNewEquipName('');
    setShowAdd(false);
  };

  const sortedTargets = [...checklistTargets].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <section>
        <div className="inline-flex items-center gap-2 chip bg-moonlight/15 border border-moonlight/30 text-moonlight mb-3 px-3 py-1.5">
          <ClipboardList className="w-3.5 h-3.5" />
          <span className="font-medium">整装待发</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
          <span className="text-gradient">观测清单</span>
        </h1>
        <p className="text-white/50 text-base">
          {formatDateChinese(selectedDate)} · {checklistTargets.length} 个目标待观测 · 装备打包进度 {progress.percent}%
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              <span>🎯 观测目标顺序</span>
              <span className="chip bg-white/5 border-white/10 text-white/60">
                {checklistTargets.length} 个
              </span>
            </h2>
            {checklistTargets.length >= 2 && (
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>调整顺序</span>
              </div>
            )}
          </div>

          {checklistTargets.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/5 flex items-center justify-center text-5xl">
                🔭
              </div>
              <p className="text-white/60 mb-2">观测清单是空的</p>
              <p className="text-xs text-white/40 mb-5">
                回到「观测计划」，浏览深空目标并添加到清单吧
              </p>
              <a
                href="#/"
                onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; }}
                className="btn-primary"
              >
                浏览深空目标 <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTargets.map((item, i) => (
                <TargetItem
                  key={item.id}
                  item={item}
                  index={i}
                  onMove={(from, to) => {
                    if (to < 0 || to >= checklistTargets.length) return;
                    reorderTargets(from, to);
                  }}
                  onRemove={() => removeTarget(item.id)}
                  onToggleDone={() => toggleTargetCompleted(item.id)}
                  onEditNote={(v) => updateTargetNotes(item.id, v)}
                />
              ))}

              <div className="flex justify-center pt-3">
                <a
                  href={`#/record/${selectedDate}`}
                  onClick={(e) => { e.preventDefault(); window.location.hash = `#/record/${selectedDate}`; }}
                  className="btn-primary !px-8 !py-3 text-base shadow-2xl shadow-nebula-purple/40 animate-pulse-glow"
                >
                  开始观测记录
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-nebula-purple/10 blur-[60px]" />
            <div className="flex items-center justify-between mb-4 relative">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-nebula-purple" />
                装备打包
              </h2>
              <button
                onClick={resetEquipment}
                className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                重置进度
              </button>
            </div>

            <div className="mb-5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">
                  {progress.packed} / {progress.total} 件已打包
                </span>
                <span className={`text-sm font-bold ${progress.percent === 100 ? 'text-aurora-green' : 'text-moonlight'}`}>
                  {progress.percent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-nebula-purple via-nebula-pink to-moonlight transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>

            {essentialUnpacked.length > 0 && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-red-400 mb-1">
                    还有 {essentialUnpacked.length} 件必备装备未打包！
                  </p>
                  <p className="text-[11px] text-red-400/70 leading-relaxed truncate">
                    {essentialUnpacked.slice(0, 3).map(e => e.name).join('、')}
                    {essentialUnpacked.length > 3 ? ' 等' : ''}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {EQUIPMENT_CATEGORIES.map(cat => {
                const items = equipment.filter(e => e.category === cat.key);
                const packedCount = items.filter(e => e.packed).length;
                const isOpen = openCats.has(cat.key);
                return (
                  <div key={cat.key} className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                    <button
                      onClick={() => toggleCat(cat.key)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">{cat.label}</p>
                          <p className="text-[11px] text-white/40">{cat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${packedCount === items.length ? 'text-aurora-green' : 'text-white/60'}`}>
                            {packedCount}/{items.length}
                          </span>
                          {packedCount === items.length && packedCount > 0 && (
                            <CheckCircle2 className="w-4 h-4 text-aurora-green" />
                          )}
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-white/40" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-2 pb-3 space-y-1 border-t border-white/5 pt-2">
                        {items.length === 0 ? (
                          <p className="px-2 py-3 text-xs text-white/30 text-center">暂无装备</p>
                        ) : (
                          items.map(e => (
                            <label
                              key={e.id}
                              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer transition-all
                                ${e.packed ? 'bg-aurora-green/5' : 'hover:bg-white/5'}`}
                            >
                              <div
                                onClick={() => toggleEquipment(e.id)}
                                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer
                                  ${e.packed
                                    ? 'bg-aurora-green border-aurora-green'
                                    : 'border-white/25 hover:border-nebula-purple/60'}`}
                              >
                                {e.packed && <Check className="w-3.5 h-3.5 text-space-950" strokeWidth={3.5} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${e.packed ? 'text-white/40 line-through' : 'text-white/85'}`}>
                                  {e.name}
                                  {e.essential && (
                                    <span className="ml-2 text-[10px] text-red-400 font-medium">必备</span>
                                  )}
                                </p>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5">
              {!showAdd ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/15 text-sm text-white/50 hover:text-white hover:border-white/30 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  自定义添加装备
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <input
                    autoFocus
                    value={newEquipName}
                    onChange={(e) => setNewEquipName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEquip()}
                    placeholder="装备名称..."
                    className="input-field !py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newEquipCat}
                      onChange={(e) => setNewEquipCat(e.target.value as EquipmentCategory)}
                      className="flex-1 input-field !py-2 text-sm"
                    >
                      {EQUIPMENT_CATEGORIES.map(c => (
                        <option key={c.key} value={c.key} className="bg-space-900">{c.icon} {c.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddEquip}
                      className="btn-primary !py-2 !px-4 text-sm"
                    >
                      添加
                    </button>
                    <button
                      onClick={() => { setShowAdd(false); setNewEquipName(''); }}
                      className="btn-secondary !py-2 !px-4 text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
