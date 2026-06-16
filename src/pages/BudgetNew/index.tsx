import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Wallet, User, BookOpen, UserCheck, Tag, DollarSign } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { BUDGET_CATEGORIES } from '@/types';

export default function BudgetNew() {
  const navigate = useNavigate();
  const { clubs, teachers, addBudget } = useAppStore();

  const [formData, setFormData] = useState({
    clubId: '',
    name: '',
    purpose: '',
    category: '',
    amount: '',
    teacherId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clubId) newErrors.clubId = '请选择社团';
    if (!formData.name.trim()) newErrors.name = '请输入预算名称';
    if (!formData.purpose.trim()) newErrors.purpose = '请输入活动用途';
    if (!formData.category) newErrors.category = '请选择预算科目';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = '请输入有效金额';
    if (!formData.teacherId) newErrors.teacherId = '请选择审批老师';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const selectedClub = clubs.find((c) => c.id === formData.clubId);
    const selectedTeacher = teachers.find((t) => t.id === formData.teacherId);

    if (!selectedClub || !selectedTeacher) return;

    addBudget({
      clubId: formData.clubId,
      clubName: selectedClub.name,
      name: formData.name.trim(),
      purpose: formData.purpose.trim(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      teacherId: formData.teacherId,
      teacherName: selectedTeacher.name,
    });

    navigate('/budgets');
  };

  const handleSaveDraft = () => {
    navigate('/budgets');
  };

  const FormField = ({
    icon: Icon,
    label,
    required,
    error,
    children,
  }: {
    icon: React.ElementType;
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon size={14} className="text-slate-400" />
        {label}
        {required && <span className="text-danger-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/budgets')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">新建活动预算</h1>
          <p className="mt-1 text-sm text-slate-500">填写活动预算信息，提交后等待老师审批</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
                1
              </span>
              基本信息
            </h3>

            <div className="grid grid-cols-2 gap-5">
              <FormField icon={User} label="所属社团" required error={errors.clubId}>
                <select
                  value={formData.clubId}
                  onChange={(e) => handleChange('clubId', e.target.value)}
                  className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                    errors.clubId ? 'border-danger-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">请选择社团</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField icon={Wallet} label="预算名称" required error={errors.name}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="例如：新生杯篮球赛"
                  className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                    errors.name ? 'border-danger-300' : 'border-slate-200'
                  }`}
                />
              </FormField>
            </div>

            <div className="mt-5">
              <FormField icon={BookOpen} label="活动用途" required error={errors.purpose}>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => handleChange('purpose', e.target.value)}
                  placeholder="请详细描述活动的用途和背景..."
                  rows={3}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none ${
                    errors.purpose ? 'border-danger-300' : 'border-slate-200'
                  }`}
                />
              </FormField>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
                2
              </span>
              预算详情
            </h3>

            <div className="grid grid-cols-2 gap-5">
              <FormField icon={Tag} label="预算科目" required error={errors.category}>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                    errors.category ? 'border-danger-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">请选择科目</option>
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField icon={DollarSign} label="预算金额" required error={errors.amount}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full h-10 pl-7 pr-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                      errors.amount ? 'border-danger-300' : 'border-slate-200'
                    }`}
                  />
                </div>
              </FormField>
            </div>

            <div className="mt-5">
              <FormField icon={UserCheck} label="审批老师" required error={errors.teacherId}>
                <select
                  value={formData.teacherId}
                  onChange={(e) => handleChange('teacherId', e.target.value)}
                  className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                    errors.teacherId ? 'border-danger-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">请选择审批老师</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <h3 className="text-base font-semibold text-slate-900 mb-4">预算预览</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50">
                <p className="text-xs text-primary-600 font-medium">预算名称</p>
                <p className="mt-1 text-base font-semibold text-primary-900">
                  {formData.name || '未填写'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">所属社团</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {clubs.find((c) => c.id === formData.clubId)?.name || '未选择'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">预算科目</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formData.category || '未选择'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-warning-50 to-amber-50 border border-warning-200">
                <p className="text-xs text-warning-600 font-medium">预算金额</p>
                <p className="mt-1 text-2xl font-bold text-warning-700">
                  ¥{formData.amount ? parseFloat(formData.amount).toLocaleString() : '0.00'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-500">审批老师</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {teachers.find((t) => t.id === formData.teacherId)?.name || '未选择'}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSubmit}
                className="w-full h-10 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm shadow-primary-200"
              >
                <Save size={16} />
                提交审批
              </button>
              <button
                onClick={handleSaveDraft}
                className="w-full h-10 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
              >
                取消
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400 text-center">
              提交后将发送通知给审批老师
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
