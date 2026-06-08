import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Task, Scene, EnergyLevel, Step } from '@/types';
import { SCENE_LABELS, ENERGY_LABELS } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { generateId } from '@/utils/id';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editingTask?: Task | null;
}

const EMPTY = { name: '', ageRange: '', durationMin: 30, budget: 0, scene: 'indoor' as Scene, energyLevel: 'low' as EnergyLevel };

export default function TaskForm({ open, onClose, editingTask }: TaskFormProps) {
  const { addTask, updateTask } = useTaskStore();
  const [form, setForm] = useState(EMPTY);
  const [items, setItems] = useState<string[]>(['']);
  const [steps, setSteps] = useState<Step[]>([{ id: generateId(), description: '', order: 1 }]);

  useEffect(() => {
    if (editingTask) {
      setForm({ name: editingTask.name, ageRange: editingTask.ageRange, durationMin: editingTask.durationMin, budget: editingTask.budget, scene: editingTask.scene, energyLevel: editingTask.energyLevel });
      setItems(editingTask.preparationItems.length ? [...editingTask.preparationItems] : ['']);
      setSteps(editingTask.steps.length ? editingTask.steps : [{ id: generateId(), description: '', order: 1 }]);
    } else {
      setForm(EMPTY);
      setItems(['']);
      setSteps([{ id: generateId(), description: '', order: 1 }]);
    }
  }, [editingTask, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItems = items.filter((i) => i.trim());
    const cleanSteps = steps.filter((s) => s.description.trim()).map((s, i) => ({ ...s, order: i + 1 }));
    if (editingTask) {
      updateTask(editingTask.id, { ...form, preparationItems: cleanItems, steps: cleanSteps });
    } else {
      addTask({ id: generateId(), ...form, preparationItems: cleanItems, steps: cleanSteps, createdAt: Date.now() });
    }
    onClose();
  };

  const addItem = () => setItems([...items, '']);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, v: string) => { const next = [...items]; next[i] = v; setItems(next); };

  const addStep = () => setSteps([...steps, { id: generateId(), description: '', order: steps.length + 1 }]);
  const removeStep = (id: string) => setSteps(steps.filter((s) => s.id !== id));
  const updateStep = (id: string, v: string) => setSteps(steps.map((s) => (s.id === id ? { ...s, description: v } : s)));
  const moveStep = (id: string, dir: -1 | 1) => {
    const idx = steps.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[idx], next[target]] = [next[target], next[idx]];
    setSteps(next);
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-[#FFF8F0] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <h2 className="text-xl font-bold text-gray-800">{editingTask ? '编辑任务' : '新建任务'}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">任务名称</label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">适合年龄</label>
              <input className={inputCls} value={form.ageRange} onChange={(e) => setForm({ ...form, ageRange: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">时长(分钟)</label>
              <input type="number" min={1} className={inputCls} value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: +e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">预算(元)</label>
              <input type="number" min={0} className={inputCls} value={form.budget} onChange={(e) => setForm({ ...form, budget: +e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">场景</label>
              <select className={inputCls} value={form.scene} onChange={(e) => setForm({ ...form, scene: e.target.value as Scene })}>
                {(['indoor', 'outdoor', 'both'] as Scene[]).map((s) => <option key={s} value={s}>{SCENE_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">精力水平</label>
            <select className={cn(inputCls, 'w-auto')} value={form.energyLevel} onChange={(e) => setForm({ ...form, energyLevel: e.target.value as EnergyLevel })}>
              {(['low', 'medium', 'high'] as EnergyLevel[]).map((e) => <option key={e} value={e}>{ENERGY_LABELS[e]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">准备物品</label>
            {items.map((item, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input className={cn(inputCls, 'flex-1')} value={item} onChange={(e) => updateItem(i, e.target.value)} placeholder="物品名称" />
                {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>}
              </div>
            ))}
            <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-sm text-[#FF6B35] hover:underline"><Plus size={14} />添加物品</button>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">步骤</label>
            {steps.map((step, i) => (
              <div key={step.id} className="mb-2 flex items-center gap-2">
                <span className="shrink-0 text-xs text-gray-400">{i + 1}.</span>
                <button type="button" onClick={() => moveStep(step.id, -1)} className="text-gray-300 hover:text-gray-500 text-xs">↑</button>
                <button type="button" onClick={() => moveStep(step.id, 1)} className="text-gray-300 hover:text-gray-500 text-xs">↓</button>
                <input className={cn(inputCls, 'flex-1')} value={step.description} onChange={(e) => updateStep(step.id, e.target.value)} placeholder="步骤描述" />
                {steps.length > 1 && <button type="button" onClick={() => removeStep(step.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>}
              </div>
            ))}
            <button type="button" onClick={addStep} className="inline-flex items-center gap-1 text-sm text-[#FF6B35] hover:underline"><Plus size={14} />添加步骤</button>
          </div>
          <button type="submit" className="w-full rounded-xl bg-[#FF6B35] py-2.5 font-semibold text-white shadow-md hover:bg-[#e55e2e] transition-colors">
            {editingTask ? '保存修改' : '创建任务'}
          </button>
        </form>
      </div>
    </div>
  );
}
