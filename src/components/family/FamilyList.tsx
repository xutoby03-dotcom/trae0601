import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, User, HeartPulse, Pill } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { RELATION_OPTIONS } from '@/types';
import type { FamilyMember } from '@/types';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { clsx } from 'clsx';

interface Props {
  editMember?: FamilyMember | null;
  onCloseEdit?: () => void;
}

export function MemberForm({ editMember, onCloseEdit }: Props) {
  const { addFamilyMember, updateFamilyMember, medicines } = useAppStore();
  const [form, setForm] = useState({
    name: '',
    relation: '本人',
    age: 30,
    gender: 'male' as 'male' | 'female',
    allergies: '',
    chronicConditions: '',
    dedicatedMedicineIds: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMember) {
      setForm({
        name: editMember.name,
        relation: editMember.relation,
        age: editMember.age,
        gender: editMember.gender,
        allergies: editMember.allergies,
        chronicConditions: editMember.chronicConditions,
        dedicatedMedicineIds: editMember.dedicatedMedicineIds,
      });
    }
  }, [editMember]);

  const toggleDedicated = (id: string) => {
    setForm((f) => ({
      ...f,
      dedicatedMedicineIds: f.dedicatedMedicineIds.includes(id)
        ? f.dedicatedMedicineIds.filter((x) => x !== id)
        : [...f.dedicatedMedicineIds, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      if (editMember) {
        updateFamilyMember(editMember.id, form);
      } else {
        addFamilyMember(form);
      }
      setIsSubmitting(false);
      onCloseEdit?.();
    }, 300);
  };

  const isEdit = !!editMember;
  const dedicatedMeds = medicines.filter((m) =>
    form.dedicatedMedicineIds.includes(m.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">姓名 *</label>
          <input
            required
            className="input-field"
            placeholder="如：张小明"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">关系 *</label>
          <select
            className="input-field"
            value={form.relation}
            onChange={(e) => setForm({ ...form, relation: e.target.value })}
          >
            {RELATION_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">年龄 *</label>
          <input
            required
            type="number"
            min={0}
            max={150}
            className="input-field"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">性别</label>
          <div className="flex gap-3">
            {(['male', 'female'] as const).map((g) => (
              <label
                key={g}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 cursor-pointer transition-all',
                  form.gender === g
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-slate-100 hover:border-slate-200'
                )}
              >
                <input
                  type="radio"
                  name="gender"
                  className="sr-only"
                  checked={form.gender === g}
                  onChange={() => setForm({ ...form, gender: g })}
                />
                <User size={16} />
                {g === 'male' ? '男' : '女'}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">过敏史</label>
          <input
            className="input-field"
            placeholder="如：青霉素、海鲜、花粉..."
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          />
        </div>
        <div>
          <label className="label">慢性疾病</label>
          <input
            className="input-field"
            placeholder="如：高血压、糖尿病..."
            value={form.chronicConditions}
            onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label flex items-center gap-1.5">
          <Pill size={14} />
          个人专用常备药
          {dedicatedMeds.length > 0 && (
            <Badge variant="brand" className="ml-auto">
              已选 {dedicatedMeds.length} 种
            </Badge>
          )}
        </label>
        <p className="text-xs text-slate-500 mb-3">
          每次创建旅行时，这些药品会自动加入建议清单（按出行天数计算数量）
        </p>
        {medicines.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 text-center text-sm text-slate-500">
            请先到药品档案页面添加药品，再为成员指定专用药
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-thin">
            {medicines.map((m) => {
              const active = form.dedicatedMedicineIds.includes(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggleDedicated(m.id)}
                  className={clsx(
                    'chip-outline !text-xs !py-1.5',
                    active && 'chip-active'
                  )}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCloseEdit}>
          取消
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isEdit ? '保存修改' : '添加成员'}
        </Button>
      </div>
    </form>
  );
}

export default function Family() {
  const { familyMembers, deleteFamilyMember, medicines, trips } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">家庭成员</h2>
          <p className="section-desc !mb-0">
            管理同行人信息，系统会根据成员健康状况智能推荐药品
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowAdd(true)}>
          添加成员
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card !rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-white border-0 !p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-brand-50/90">家庭成员</p>
            <p className="font-display text-3xl font-bold">{familyMembers.length}</p>
          </div>
        </div>
        <div className="card !p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <HeartPulse size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">健康提醒</p>
            <p className="font-display text-3xl font-bold text-slate-800">
              {familyMembers.filter((m) => m.allergies || m.chronicConditions).length}
            </p>
          </div>
        </div>
        <div className="card !p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Pill size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">专用药品</p>
            <p className="font-display text-3xl font-bold text-slate-800">
              {familyMembers.reduce((s, m) => s + m.dedicatedMedicineIds.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {familyMembers.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="还没有家庭成员档案"
          description="添加同行人信息，旅行时系统会自动匹配个人专用药和慢性病药"
          action={
            <Button leftIcon={<Plus size={18} />} onClick={() => setShowAdd(true)}>
              添加第一位成员
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {familyMembers.map((m, idx) => {
            const dedicatedMeds = medicines.filter((med) =>
              m.dedicatedMedicineIds.includes(med.id)
            );
            const relatedTrips = trips.filter((t) => t.companionIds.includes(m.id)).length;
            return (
              <div
                key={m.id}
                className="card card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={clsx(
                      'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold',
                      m.gender === 'male'
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700'
                        : 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700'
                    )}
                  >
                    {m.name.slice(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{m.name}</h3>
                        <p className="text-sm text-slate-500">
                          {m.relation} · {m.age} 岁 · {m.gender === 'male' ? '♂' : '♀'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditing(m)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`确定删除「${m.name}」吗？`)) deleteFamilyMember(m.id);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {(m.allergies || m.chronicConditions) && (
                    <div className="flex flex-col gap-2">
                      {m.allergies && (
                        <div className="p-3 rounded-xl bg-red-50/70 border border-red-100">
                          <p className="text-xs font-semibold text-red-600 mb-0.5">⚠️ 过敏史</p>
                          <p className="text-sm text-red-800">{m.allergies}</p>
                        </div>
                      )}
                      {m.chronicConditions && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                          <p className="text-xs font-semibold text-amber-700 mb-0.5">🩺 慢性病</p>
                          <p className="text-sm text-amber-800">{m.chronicConditions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50/70">
                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                      <Pill size={12} />
                      专用常备药
                      <Badge variant="brand" className="ml-auto">
                        {dedicatedMeds.length} 种
                      </Badge>
                    </p>
                    {dedicatedMeds.length === 0 ? (
                      <p className="text-xs text-slate-400">暂未指定</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {dedicatedMeds.map((dm) => (
                          <Badge key={dm.id} variant="default">
                            {dm.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>已同行 {relatedTrips} 次旅行</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showAdd || !!editing}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        title={editing ? '编辑成员' : '添加家庭成员'}
      >
        <MemberForm
          editMember={editing}
          onCloseEdit={() => {
            setShowAdd(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}
