import { useState } from 'react';
import {
  X,
  Activity,
  Droplets,
  Thermometer,
  Clock,
  StickyNote,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store';
import type { BathTask, SkinCondition } from '@/types';
import { cn } from '@/lib/utils';

interface RecordModalProps {
  task: BathTask | null;
  onClose: () => void;
}

const skinOptions: { value: SkinCondition; label: string; emoji: string; color: string }[] = [
  { value: 'normal', label: '正常', emoji: '✅', color: 'sage' },
  { value: 'dry', label: '干燥', emoji: '🌵', color: 'amber2' },
  { value: 'rash', label: '红疹', emoji: '🔴', color: 'coral' },
  { value: 'bruise', label: '淤青', emoji: '🟣', color: 'teal' },
  { value: 'wound', label: '伤口', emoji: '🩹', color: 'coral' },
];

const fatigueLabels = ['', '很轻松', '略感疲惫', '中度疲惫', '较累', '非常累'];

export function RecordModal({ task, onClose }: RecordModalProps) {
  const { elders, members, completeTask } = useStore();
  const elder = elders.find((e) => e.id === task?.elderId);
  const defaultAssignee = members.find((m) => m.id === task?.assignedTo);

  const [form, setForm] = useState({
    completedBy: task?.assignedTo || members[0]?.id || '',
    completedAt: new Date().toISOString().slice(0, 16),
    bloodPressureSystolic: 130,
    bloodPressureDiastolic: 80,
    skinCondition: 'normal' as SkinCondition,
    fatigueLevel: 2 as 1 | 2 | 3 | 4 | 5,
    remarks: '',
    waterTemperature: 38,
    actualDuration: task?.estimatedMinutes || 40,
  });

  const submit = () => {
    if (!task) return;
    completeTask(task.id, {
      elderId: task.elderId,
      completedBy: form.completedBy,
      completedAt: form.completedAt.replace('T', ' '),
      bloodPressureSystolic: form.bloodPressureSystolic,
      bloodPressureDiastolic: form.bloodPressureDiastolic,
      skinCondition: form.skinCondition,
      fatigueLevel: form.fatigueLevel,
      remarks: form.remarks,
      waterTemperature: form.waterTemperature,
      actualDuration: form.actualDuration,
    });
    onClose();
  };

  if (!task) return null;

  const bpWarning =
    form.bloodPressureSystolic >= 150 ||
    form.bloodPressureDiastolic >= 95 ||
    form.bloodPressureSystolic < 90;

  return (
    <div
      className="fixed inset-0 z-50 bg-teal-700/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-cream-50 shadow-2xl overflow-hidden animate-[fadeInScale_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-7 py-5 bg-gradient-to-r from-teal to-teal-600 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-20 -bottom-16 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl border border-white/20">
                {elder?.avatar || '👤'}
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold">
                  {elder?.name} · 助浴完成记录
                </h3>
                <p className="text-teal-100 text-sm mt-0.5 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  负责人：{defaultAssignee?.name} · {task.bathroom}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-1 rounded-2xl bg-white p-5 shadow-soft border border-cream-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-coral-100 text-coral flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-teal-700 text-sm">血压测量 (mmHg)</h4>
              {bpWarning && (
                <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-coral-100 text-coral font-medium">
                  ⚠️ 需关注
                </span>
              )}
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-[11px] text-teal-300 font-medium block mb-1.5">
                  收缩压（高压）
                </label>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    value={form.bloodPressureSystolic}
                    onChange={(e) =>
                      setForm({ ...form, bloodPressureSystolic: Number(e.target.value) })
                    }
                    className={cn(
                      'w-full px-3 py-2 rounded-xl border bg-cream-50 text-2xl font-bold tabular-nums focus:outline-none focus:ring-2',
                      bpWarning
                        ? 'border-coral/40 focus:ring-coral/30 text-coral'
                        : 'border-cream-200 focus:ring-teal/30 text-teal-700'
                    )}
                  />
                </div>
              </div>
              <div className="text-teal-300 font-bold pb-2">/</div>
              <div className="flex-1">
                <label className="text-[11px] text-teal-300 font-medium block mb-1.5">
                  舒张压（低压）
                </label>
                <input
                  type="number"
                  value={form.bloodPressureDiastolic}
                  onChange={(e) =>
                    setForm({ ...form, bloodPressureDiastolic: Number(e.target.value) })
                  }
                  className={cn(
                    'w-full px-3 py-2 rounded-xl border bg-cream-50 text-2xl font-bold tabular-nums focus:outline-none focus:ring-2',
                    bpWarning
                      ? 'border-coral/40 focus:ring-coral/30 text-coral'
                      : 'border-cream-200 focus:ring-teal/30 text-teal-700'
                  )}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {[
                { s: 120, d: 75, label: '正常' },
                { s: 135, d: 85, label: '偏高' },
                { s: 155, d: 95, label: '较高' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() =>
                    setForm({
                      ...form,
                      bloodPressureSystolic: p.s,
                      bloodPressureDiastolic: p.d,
                    })
                  }
                  className="flex-1 py-1.5 px-2 rounded-lg bg-cream-50 border border-cream-200 text-[11px] font-medium text-teal-300 hover:border-teal-200 hover:text-teal transition"
                >
                  {p.label}
                  <br />
                  <span className="tabular-nums">{p.s}/{p.d}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-1 rounded-2xl bg-white p-5 shadow-soft border border-cream-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-teal-700 text-sm">皮肤情况</h4>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {skinOptions.map((opt) => {
                const activeClasses: Record<string, string> = {
                  sage: 'bg-sage-50 border-sage text-sage-600 shadow-soft scale-[1.03]',
                  amber2: 'bg-amber2-50 border-amber2-600 text-amber2-600 shadow-soft scale-[1.03]',
                  coral: 'bg-coral-50 border-coral text-coral shadow-soft scale-[1.03]',
                  teal: 'bg-teal-50 border-teal text-teal shadow-soft scale-[1.03]',
                };
                return (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, skinCondition: opt.value })}
                    className={cn(
                      'aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all',
                      form.skinCondition === opt.value
                        ? activeClasses[opt.color]
                        : 'bg-cream-50 border-cream-200 text-teal-300 hover:border-teal-200'
                    )}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-[11px] font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-cream-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-teal-300 font-medium flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> 疲劳程度
                </span>
                <span className="text-sm font-bold text-teal-700 tabular-nums">
                  {form.fatigueLevel}/5
                  <span className="ml-1.5 text-xs text-teal-300 font-normal">
                    · {fatigueLabels[form.fatigueLevel]}
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={form.fatigueLevel}
                onChange={(e) =>
                  setForm({ ...form, fatigueLevel: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })
                }
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-[10px] text-teal-200 mt-1 px-0.5">
                <span>轻松</span>
                <span>适中</span>
                <span>很累</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 rounded-2xl bg-white p-5 shadow-soft border border-cream-200">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-teal-300 font-medium flex items-center gap-1.5">
                    <Thermometer className="w-3 h-3 text-coral" /> 水温（°C）
                  </label>
                  <span className="text-sm font-bold text-teal-700 tabular-nums">
                    {form.waterTemperature}°C
                  </span>
                </div>
                <input
                  type="range"
                  min={34}
                  max={44}
                  step={1}
                  value={form.waterTemperature}
                  onChange={(e) =>
                    setForm({ ...form, waterTemperature: Number(e.target.value) })
                  }
                  className="w-full accent-coral"
                />
                <div className="flex justify-between text-[10px] text-teal-200 mt-1 px-0.5">
                  <span>34°偏凉</span>
                  <span>38-40°适宜</span>
                  <span>44°偏热</span>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-200">
                <label className="text-[11px] text-teal-300 font-medium flex items-center gap-1.5 mb-2">
                  <Clock className="w-3 h-3 text-teal-300" /> 实际时长（分钟）
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={form.actualDuration}
                  onChange={(e) => setForm({ ...form, actualDuration: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-teal-700 text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-1 rounded-2xl bg-white p-5 shadow-soft border border-cream-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal flex items-center justify-center">
                <StickyNote className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-teal-700 text-sm">观察备注</h4>
            </div>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none placeholder:text-teal-200"
              placeholder="记录助浴中的反应、状态变化、特殊情况等..."
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {['状态良好', '起身需搀扶', '心情愉悦', '皮肤发红需观察', '水温略高', '时间缩短'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const cur = form.remarks ? form.remarks + '；' + tag : tag;
                      setForm({ ...form, remarks: cur });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cream-50 border border-cream-200 text-[11px] text-teal-300 hover:bg-teal-50 hover:border-teal-200 hover:text-teal transition"
                  >
                    + {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="px-7 py-5 bg-white border-t border-cream-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-4 h-4 text-teal-300" />
            <select
              value={form.completedBy}
              onChange={(e) => setForm({ ...form, completedBy: e.target.value })}
              className="px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-sm text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal/30"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  实际执行人：{m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-cream-200 text-teal-300 text-sm font-medium hover:bg-cream-50 transition"
            >
              稍后补填
            </button>
            <button
              onClick={submit}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-teal to-teal-600 text-white text-sm font-medium shadow-card hover:shadow-card-hover hover:from-teal-600 hover:to-teal-700 active:translate-y-px transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              提交记录，完成助浴
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
