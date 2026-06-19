import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { useMemberStore } from '@/store/useMemberStore';
import { cn } from '@/lib/utils';
import { ALLERGY_OPTIONS, RELIGIOUS_DIET_OPTIONS } from '../../../shared/types';

export default function MemberForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { members, createMember, updateMember, fetchMembers } = useMemberStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    allergies: [] as string[],
    religiousDiet: '',
    drinksAlcohol: true,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      fetchMembers();
    }
  }, [isEdit, fetchMembers]);

  useEffect(() => {
    if (isEdit && id) {
      const member = members.find((m) => m.id === id);
      if (member) {
        setFormData({
          name: member.name,
          phone: member.phone,
          allergies: member.allergies,
          religiousDiet: member.religiousDiet,
          drinksAlcohol: member.drinksAlcohol,
          notes: member.notes,
        });
      }
    }
  }, [isEdit, id, members]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系方式';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit && id) {
        await updateMember(id, formData);
      } else {
        await createMember(formData);
      }
      navigate('/members');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const toggleAllergy = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(value)
        ? prev.allergies.filter((a) => a !== value)
        : [...prev.allergies, value],
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phone: e.target.value }));
  };

  const handleReligiousChange = (value: string) => {
    setFormData((prev) => ({ ...prev, religiousDiet: value }));
  };

  const handleDrinksAlcoholChange = (value: boolean) => {
    setFormData((prev) => ({ ...prev, drinksAlcohol: value }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, notes: e.target.value }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link
        to="/members"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        返回成员列表
      </Link>

      <div className="card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary-100 rounded-xl">
            {!isEdit && <UserPlus size={24} className="text-primary-600" />}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {isEdit ? '编辑成员' : '添加新成员'}
            </h1>
            <p className="text-slate-500">
              {isEdit ? '修改成员的饮食禁忌信息' : '录入成员的饮食禁忌信息'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                姓名 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={cn('input', errors.name && 'border-danger-300')}
                placeholder="请输入姓名"
              />
              {errors.name && (
                <p className="text-danger-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="label">
                联系方式 <span className="text-danger-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={cn('input', errors.phone && 'border-danger-300')}
                placeholder="请输入手机号"
              />
              {errors.phone && (
                <p className="text-danger-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label mb-3">过敏源</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleAllergy(option.value)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium border-2 transition-all',
                    formData.allergies.includes(option.value)
                      ? 'bg-danger-50 border-danger-400 text-danger-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              点击选择成员过敏的食材
            </p>
          </div>

          <div>
            <label className="label mb-3">宗教/饮食禁忌</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {RELIGIOUS_DIET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleReligiousChange(option.value)}
                  className={cn(
                    'p-3 rounded-lg text-sm font-medium border-2 transition-all text-left',
                    formData.religiousDiet === option.value
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label mb-3">是否饮酒</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleDrinksAlcoholChange(true)}
                className={cn(
                  'px-6 py-3 rounded-lg text-sm font-medium border-2 transition-all flex-1',
                  formData.drinksAlcohol
                    ? 'bg-amber-50 border-amber-400 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                🍺 喝酒
              </button>
              <button
                type="button"
                onClick={() => handleDrinksAlcoholChange(false)}
                className={cn(
                  'px-6 py-3 rounded-lg text-sm font-medium border-2 transition-all flex-1',
                  !formData.drinksAlcohol
                    ? 'bg-slate-100 border-slate-400 text-slate-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                🚫 不喝酒
              </button>
            </div>
          </div>

          <div>
            <label className="label">备注</label>
            <textarea
              value={formData.notes}
              onChange={handleNotesChange}
              className="input min-h-[100px] resize-none"
              placeholder="其他需要注意的事项..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/members')}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              <Save size={18} />
              {isEdit ? '保存修改' : '添加成员'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
