import { useState } from 'react';
import { Plus, X, Edit2, User, Phone, Clock, AlertTriangle, Droplets, Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import type { ElderProfile, MobilityLevel } from '@/types';
import { cn } from '@/lib/utils';

const mobilityLabels: Record<MobilityLevel, { text: string; color: string }> = {
  independent: { text: '自理', color: 'bg-sage-100 text-sage-600' },
  assist_needed: { text: '需协助', color: 'bg-amber2-100 text-amber2-600' },
  wheelchair: { text: '轮椅', color: 'bg-coral-100 text-coral-600' },
  bedridden: { text: '卧床', color: 'bg-teal-50 text-teal-600' },
};

function getDaysSince(dateStr?: string): number | null {
  if (!dateStr) return null;
  const last = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

interface ElderCardProps {
  elder: ElderProfile;
  onEdit: (elder: ElderProfile) => void;
}

function ElderCard({ elder, onEdit }: ElderCardProps) {
  const days = getDaysSince(elder.lastBathDate);
  const mob = mobilityLabels[elder.mobilityLevel];
  const warning = days !== null && days >= 5;

  return (
    <div
      className={cn(
        'shrink-0 w-72 rounded-card bg-white shadow-card border border-cream-200 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer group',
        warning && 'ring-2 ring-coral/40'
      )}
      onClick={() => onEdit(elder)}
      style={{ animation: 'fadeInUp 0.5s ease-out both' }}
    >
      <div className="relative p-5 pb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(elder);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-50 hover:text-teal"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-4xl shadow-inner">
            {elder.avatar || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-teal-700 font-serif">{elder.name}</h3>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', mob.color)}>
                {mob.text}
              </span>
            </div>
            <p className="text-sm text-teal-300 mt-0.5">
              {elder.age}岁 · {elder.gender === 'female' ? '女' : '男'}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-teal-300">
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate">合适时段：{elder.preferredTime}</span>
          </div>
          <div className="flex items-center gap-2 text-teal-300">
            <Phone className="w-3.5 h-3.5" />
            <span className="truncate">紧急联系人：{elder.emergencyContact}</span>
          </div>
          {elder.contraindications.length > 0 && (
            <div className="flex items-start gap-2 text-coral-600">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-1">禁忌：{elder.contraindications.join('、')}</span>
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        'px-5 py-3 border-t flex items-center justify-between text-sm',
        warning ? 'bg-coral-50 border-coral/20' : 'bg-cream-50 border-cream-200'
      )}>
        <div className="flex items-center gap-1.5">
          <Droplets className={cn('w-4 h-4', warning ? 'text-coral' : 'text-teal-300')} />
          <span className={warning ? 'text-coral font-medium' : 'text-teal-300'}>
            距上次助浴
          </span>
        </div>
        {days !== null ? (
          <span className={cn('font-bold tabular-nums', warning ? 'text-coral' : 'text-teal-700')}>
            {days} 天
          </span>
        ) : (
          <span className="text-teal-300">暂无记录</span>
        )}
      </div>
    </div>
  );
}

interface ElderFormState {
  name: string;
  age: string;
  gender: 'male' | 'female';
  mobilityLevel: MobilityLevel;
  contraindications: string;
  toiletries: string;
  preferredTime: string;
  emergencyContact: string;
  emergencyPhone: string;
  avatar: string;
}

const emptyForm: ElderFormState = {
  name: '',
  age: '',
  gender: 'female',
  mobilityLevel: 'assist_needed',
  contraindications: '',
  toiletries: '',
  preferredTime: '',
  emergencyContact: '',
  emergencyPhone: '',
  avatar: '👵',
};

interface ElderProfilesProps {
  onAddTaskForElder?: (elderId: string) => void;
}

export function ElderProfiles({ onAddTaskForElder }: ElderProfilesProps) {
  const { elders, addElder, updateElder } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingElder, setEditingElder] = useState<ElderProfile | null>(null);
  const [form, setForm] = useState<ElderFormState>(emptyForm);

  const openNew = () => {
    setEditingElder(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (elder: ElderProfile) => {
    setEditingElder(elder);
    setForm({
      name: elder.name,
      age: String(elder.age),
      gender: elder.gender,
      mobilityLevel: elder.mobilityLevel,
      contraindications: elder.contraindications.join('、'),
      toiletries: elder.toiletries.join('、'),
      preferredTime: elder.preferredTime,
      emergencyContact: elder.emergencyContact,
      emergencyPhone: elder.emergencyPhone,
      avatar: elder.avatar,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.age) return;
    const payload = {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      mobilityLevel: form.mobilityLevel,
      contraindications: form.contraindications.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
      toiletries: form.toiletries.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
      preferredTime: form.preferredTime.trim(),
      emergencyContact: form.emergencyContact.trim(),
      emergencyPhone: form.emergencyPhone.trim(),
      avatar: form.avatar || '👤',
    };
    if (editingElder) {
      updateElder(editingElder.id, payload);
    } else {
      addElder(payload);
    }
    setDrawerOpen(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-teal-700 font-serif flex items-center gap-2">
            <User className="w-5 h-5" /> 老人档案
          </h2>
          <p className="text-sm text-teal-300 mt-1">点击卡片可编辑详情</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-dashed border-teal-200 text-teal-300 text-sm font-medium hover:border-teal hover:text-teal hover:bg-teal-50 transition-all"
        >
          <Plus className="w-4 h-4" /> 新建档案
        </button>
      </div>

      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
        {elders.map((e, i) => (
          <div key={e.id} style={{ animationDelay: `${i * 80}ms` }}>
            <ElderCard elder={e} onEdit={openEdit} />
          </div>
        ))}

        <button
          onClick={openNew}
          className="shrink-0 w-72 h-[208px] rounded-card border-2 border-dashed border-cream-300 flex flex-col items-center justify-center gap-2 text-teal-300 hover:border-teal-200 hover:text-teal hover:bg-white/50 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">添加新档案</span>
        </button>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-teal-700/30 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-cream-50 shadow-2xl overflow-y-auto animate-[slideInRight_0.4s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-cream-50/90 backdrop-blur-sm px-6 py-5 border-b border-cream-200 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-teal-700 font-serif">
                {editingElder ? '编辑老人档案' : '新建老人档案'}
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-teal-300 hover:text-teal hover:bg-teal-50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-5xl shadow-inner">
                  {form.avatar || '👤'}
                </div>
                <div className="flex-1 grid grid-cols-6 gap-2">
                  {['👵', '👴', '👩‍🦳', '🧓', '👴🏻', '👵🏼'].map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, avatar: e })}
                      className={cn(
                        'aspect-square rounded-xl text-xl flex items-center justify-center transition-all',
                        form.avatar === e
                          ? 'bg-teal text-white shadow-soft scale-105'
                          : 'bg-white border border-cream-200 hover:bg-teal-50'
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="姓名">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-sm"
                    placeholder="请输入姓名"
                  />
                </Field>
                <Field label="年龄">
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-sm"
                    placeholder="岁"
                  />
                </Field>
              </div>

              <Field label="性别">
                <div className="grid grid-cols-2 gap-3">
                  {(['female', 'male'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, gender: g })}
                      className={cn(
                        'py-2.5 rounded-xl border font-medium text-sm transition-all',
                        form.gender === g
                          ? 'bg-teal border-teal text-white shadow-soft'
                          : 'bg-white border-cream-200 text-teal-300 hover:border-teal-200'
                      )}
                    >
                      {g === 'female' ? '👩 女' : '👨 男'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="行动能力">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(mobilityLabels) as MobilityLevel[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setForm({ ...form, mobilityLevel: m })}
                      className={cn(
                        'py-2 rounded-lg border text-xs font-medium transition-all',
                        form.mobilityLevel === m
                          ? 'bg-teal-50 border-teal text-teal-700'
                          : 'bg-white border-cream-200 text-teal-300 hover:border-teal-200'
                      )}
                    >
                      {mobilityLabels[m].text}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="禁忌事项" icon={<AlertTriangle className="w-4 h-4 text-coral" />}>
                <input
                  value={form.contraindications}
                  onChange={(e) => setForm({ ...form, contraindications: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-sm"
                  placeholder="高血压、心脏病...（用顿号分隔）"
                />
              </Field>

              <Field label="常用洗护品" icon={<Sparkles className="w-4 h-4 text-teal-300" />}>
                <input
                  value={form.toiletries}
                  onChange={(e) => setForm({ ...form, toiletries: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-sm"
                  placeholder="无泪配方沐浴露...（用顿号分隔）"
                />
              </Field>

              <Field label="合适时段" icon={<Clock className="w-4 h-4 text-teal-300" />}>
                <input
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-sm"
                  placeholder="如：上午 9:00 - 10:00"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="紧急联系人">
                  <input
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-sm"
                    placeholder="姓名"
                  />
                </Field>
                <Field label="联系电话">
                  <input
                    value={form.emergencyPhone}
                    onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-sm"
                    placeholder="电话"
                  />
                </Field>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-cream-200 text-teal-300 font-medium text-sm hover:bg-white transition"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.name.trim() || !form.age}
                  className="flex-1 py-3 rounded-xl bg-teal text-white font-medium text-sm shadow-soft hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {editingElder ? '保存修改' : '创建档案'}
                </button>
              </div>

              {onAddTaskForElder && editingElder && (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onAddTaskForElder(editingElder.id);
                  }}
                  className="w-full py-3 rounded-xl bg-amber2-100 text-amber2-600 font-medium text-sm hover:bg-amber2-200 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> 为 TA 安排助浴任务
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-teal-300 mb-2 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
