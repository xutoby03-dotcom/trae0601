import { useState, useEffect } from 'react';
import type { Member, StrengthLevel } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import StrengthStars from './StrengthStars';
import { Star } from 'lucide-react';

interface Props {
  member?: Member | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function MemberForm({ member, onSubmit, onCancel }: Props) {
  const addMember = useAppStore((s) => s.addMember);
  const updateMember = useAppStore((s) => s.updateMember);

  const [form, setForm] = useState({
    name: '',
    avatarUrl: '',
    strengthLevel: 3 as StrengthLevel,
    backpackCapacityKg: 12,
    allergiesText: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    confirmed: false,
    note: '',
  });

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name,
        avatarUrl: member.avatarUrl || '',
        strengthLevel: member.strengthLevel,
        backpackCapacityKg: member.backpackCapacityKg,
        allergiesText: member.allergies.join(', '),
        emergencyContactName: member.emergencyContactName,
        emergencyContactPhone: member.emergencyContactPhone,
        confirmed: member.confirmed,
        note: member.note || '',
      });
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const data = {
      name: form.name.trim(),
      avatarUrl: form.avatarUrl.trim() || undefined,
      strengthLevel: form.strengthLevel,
      backpackCapacityKg: Number(form.backpackCapacityKg),
      allergies: form.allergiesText
        .split(/[,，、\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      emergencyContactName: form.emergencyContactName.trim() || '紧急联系人',
      emergencyContactPhone: form.emergencyContactPhone.trim() || '13800000000',
      confirmed: form.confirmed,
      note: form.note,
    };

    if (member) {
      updateMember(member.id, data);
    } else {
      addMember(data);
    }
    onSubmit();
  };

  const field =
    'w-full px-3.5 py-2.5 rounded-lg border border-parchment-300 bg-white text-forest-900 placeholder:text-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">队员姓名 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例如：张伟"
            className={field}
            required
          />
        </div>
        <div>
          <label className="label">头像 URL</label>
          <input
            type="url"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
            placeholder="https://..."
            className={field}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">体力等级（1-5星）</label>
          <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-lg border border-parchment-300 bg-white">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm({ ...form, strengthLevel: n as StrengthLevel })}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  size={22}
                  className={
                    n <= form.strengthLevel
                      ? 'text-warn-500 fill-warn-500'
                      : 'text-parchment-300 hover:text-warn-300'
                  }
                  strokeWidth={1.8}
                />
              </button>
            ))}
            <div className="ml-2 text-sm text-earth-600">
              <StrengthStars level={form.strengthLevel} size={14} />
            </div>
          </div>
        </div>
        <div>
          <label className="label">背包容量 (kg) *</label>
          <input
            type="number"
            min={1}
            step={0.5}
            value={form.backpackCapacityKg}
            onChange={(e) => setForm({ ...form, backpackCapacityKg: Number(e.target.value) })}
            className={field}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">过敏情况（用逗号分隔）</label>
        <input
          type="text"
          value={form.allergiesText}
          onChange={(e) => setForm({ ...form, allergiesText: e.target.value })}
          placeholder="例如：花生, 海鲜, 青霉素"
          className={field}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">紧急联系人姓名 *</label>
          <input
            type="text"
            value={form.emergencyContactName}
            onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
            placeholder="例如：张妻"
            className={field}
            required
          />
        </div>
        <div>
          <label className="label">紧急联系人电话 *</label>
          <input
            type="tel"
            value={form.emergencyContactPhone}
            onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
            placeholder="11位手机号"
            className={field}
            required
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 p-3 rounded-lg bg-parchment-50 border border-parchment-200 cursor-pointer hover:border-forest-300 transition-colors w-fit">
          <input
            type="checkbox"
            checked={form.confirmed}
            onChange={(e) => setForm({ ...form, confirmed: e.target.checked })}
            className="w-4 h-4 accent-forest-600"
          />
          <span className="text-sm text-forest-800">已确认出发</span>
        </label>
      </div>

      <div>
        <label className="label">备注</label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="其他说明..."
          rows={2}
          className={`${field} resize-none`}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          取消
        </button>
        <button type="submit" className="btn-primary">
          {member ? '保存修改' : '添加队员'}
        </button>
      </div>
    </form>
  );
}
