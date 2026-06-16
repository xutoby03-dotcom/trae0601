import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  X,
  Wallet,
  User,
  Tag,
  CreditCard,
  FileText,
  AlertTriangle,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PAYMENT_METHODS, BUDGET_CATEGORIES } from '@/types';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function ReimbursementNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const budgetIdFromUrl = searchParams.get('budgetId');

  const { getActiveBudgets, addReimbursement, getBudgetById, submitReimbursement } = useAppStore();
  const activeBudgets = getActiveBudgets();

  const [formData, setFormData] = useState({
    budgetId: budgetIdFromUrl || '',
    purchaser: '',
    amount: '',
    category: '',
    paymentMethod: '',
    description: '',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [receiptClear, setReceiptClear] = useState<'clear' | 'unclear' | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  const selectedBudget = formData.budgetId ? getBudgetById(formData.budgetId) : null;

  useEffect(() => {
    if (selectedBudget && !formData.category) {
      setFormData((prev) => ({ ...prev, category: selectedBudget.category }));
    }
  }, [selectedBudget]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setReceiptClear('');
      setErrors((prev) => ({
        ...prev,
        receipt: '',
        receiptClear: '',
      }));
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setReceiptPreview('');
    setReceiptClear('');
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.budgetId) newErrors.budgetId = '请选择活动预算';
    if (!receiptFile) newErrors.receipt = '请上传票据照片';
    if (!receiptClear) newErrors.receiptClear = '请确认票据清晰度';
    if (receiptClear === 'unclear') newErrors.receiptClear = '票据不清晰，请重新上传';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.purchaser.trim()) newErrors.purchaser = '请输入购买人姓名';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = '请输入有效金额';
    if (!formData.category) newErrors.category = '请选择品类';
    if (!formData.paymentMethod) newErrors.paymentMethod = '请选择付款方式';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrev = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const isOverBudget =
    selectedBudget && formData.amount
      ? selectedBudget.usedAmount + parseFloat(formData.amount) > selectedBudget.amount
      : false;

  const overAmount =
    selectedBudget && formData.amount
      ? selectedBudget.usedAmount + parseFloat(formData.amount) - selectedBudget.amount
      : 0;

  const handleSubmit = () => {
    if (!validateStep2()) return;
    if (!selectedBudget) return;

    addReimbursement({
      budgetId: formData.budgetId,
      budgetName: selectedBudget.name,
      clubId: selectedBudget.clubId,
      clubName: selectedBudget.clubName,
      purchaser: formData.purchaser.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      receiptUrl: receiptPreview,
      receiptName: receiptFile?.name || '',
      description: formData.description.trim(),
    });

    navigate('/reimbursements?status=draft');
  };

  const handleSubmitAndSend = () => {
    if (!validateStep2()) return;
    if (!selectedBudget) return;

    const newId = addReimbursement({
      budgetId: formData.budgetId,
      budgetName: selectedBudget.name,
      clubId: selectedBudget.clubId,
      clubName: selectedBudget.clubName,
      purchaser: formData.purchaser.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      receiptUrl: receiptPreview,
      receiptName: receiptFile?.name || '',
      description: formData.description.trim(),
    });

    submitReimbursement(newId);

    const targetStatus = isOverBudget ? 'pending_teacher' : 'pending_finance';
    navigate(`/reimbursements?status=${targetStatus}`);
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
          onClick={() => navigate('/reimbursements')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">新建报销单</h1>
          <p className="mt-1 text-sm text-slate-500">填写报销信息并上传票据</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
              step >= 1 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
            )}
          >
            1
          </div>
          <span className="ml-2 text-sm font-medium text-slate-700">选择活动和票据</span>
        </div>
        <div
          className={cn(
            'w-16 h-0.5 mx-4',
            step >= 2 ? 'bg-primary-500' : 'bg-slate-200'
          )}
        ></div>
        <div className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
              step >= 2 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
            )}
          >
            2
          </div>
          <span className="ml-2 text-sm font-medium text-slate-700">填写报销详情</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-fade-in">
              <h3 className="text-base font-semibold text-slate-900 mb-6">选择活动预算</h3>

              <FormField icon={Wallet} label="活动预算" required error={errors.budgetId}>
                <select
                  value={formData.budgetId}
                  onChange={(e) => handleChange('budgetId', e.target.value)}
                  className={`w-full h-11 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                    errors.budgetId ? 'border-danger-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">请选择活动预算</option>
                  {activeBudgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.name} - {budget.clubName} (剩余: {formatCurrency(budget.amount - budget.usedAmount)})
                    </option>
                  ))}
                </select>
              </FormField>

              {selectedBudget && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">预算总额</p>
                      <p className="text-base font-semibold text-slate-800 mt-1">
                        {formatCurrency(selectedBudget.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">已使用</p>
                      <p className="text-base font-semibold text-slate-800 mt-1">
                        {formatCurrency(selectedBudget.usedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">剩余额度</p>
                      <p className="text-base font-semibold text-primary-600 mt-1">
                        {formatCurrency(selectedBudget.amount - selectedBudget.usedAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-base font-semibold text-slate-900 mb-4">上传票据</h3>
                <FormField
                  icon={Upload}
                  label="票据照片"
                  required
                  error={errors.receipt}
                >
                  {!receiptPreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                      <ImageIcon size={32} className="text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 font-medium">
                        点击或拖拽上传票据照片
                      </p>
                      <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG 格式</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={receiptPreview}
                        alt="票据预览"
                        className="w-full h-48 object-cover rounded-xl border border-slate-200"
                      />
                      <button
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                        <FileText size={12} />
                        {receiptFile?.name}
                      </p>

                      <div className="mt-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                          <Check size={14} className="text-slate-400" />
                          票据清晰度确认 <span className="text-danger-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="receiptClear"
                              value="clear"
                              checked={receiptClear === 'clear'}
                              onChange={(e) => {
                                setReceiptClear(e.target.value as 'clear');
                                setErrors((prev) => ({ ...prev, receiptClear: '' }));
                              }}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700">清晰可辨</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="receiptClear"
                              value="unclear"
                              checked={receiptClear === 'unclear'}
                              onChange={(e) => {
                                setReceiptClear(e.target.value as 'unclear');
                                setErrors((prev) => ({
                                  ...prev,
                                  receiptClear: '票据不清晰，请重新上传',
                                }));
                              }}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700">不清晰</span>
                          </label>
                        </div>
                        {errors.receiptClear && (
                          <p className="mt-2 text-xs text-danger-500 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            {errors.receiptClear}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </FormField>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!formData.budgetId || !receiptFile || receiptClear !== 'clear'}
                  className={cn(
                    'px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                    formData.budgetId && receiptFile && receiptClear === 'clear'
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  )}
                >
                  下一步
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-fade-in">
              <h3 className="text-base font-semibold text-slate-900 mb-6">填写报销详情</h3>

              <div className="grid grid-cols-2 gap-5">
                <FormField icon={User} label="购买人" required error={errors.purchaser}>
                  <input
                    type="text"
                    value={formData.purchaser}
                    onChange={(e) => handleChange('purchaser', e.target.value)}
                    placeholder="请输入姓名"
                    className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                      errors.purchaser ? 'border-danger-300' : 'border-slate-200'
                    }`}
                  />
                </FormField>

                <FormField
                  icon={CreditCard}
                  label="付款方式"
                  required
                  error={errors.paymentMethod}
                >
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                      errors.paymentMethod ? 'border-danger-300' : 'border-slate-200'
                    }`}
                  >
                    <option value="">请选择付款方式</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-5">
                <FormField
                  icon={Tag}
                  label="报销品类"
                  required
                  error={errors.category}
                >
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
                      errors.category ? 'border-danger-300' : 'border-slate-200'
                    }`}
                  >
                    <option value="">请选择品类</option>
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  icon={Wallet}
                  label="报销金额"
                  required
                  error={errors.amount}
                >
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

              {isOverBudget && (
                <div className="mt-5 p-4 rounded-xl bg-warning-50 border border-warning-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-warning-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning-800">
                        超预算提醒
                      </p>
                      <p className="text-xs text-warning-700 mt-1">
                        本次报销将超出预算 <span className="font-bold">{formatCurrency(overAmount)}</span>，
                        提交后需要指导老师二次审批
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <FormField icon={FileText} label="费用说明">
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="请简要说明费用用途..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  />
                </FormField>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
                >
                  上一步
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
                  >
                    保存草稿
                  </button>
                  <button
                    onClick={handleSubmitAndSend}
                    disabled={receiptClear !== 'clear'}
                    className={cn(
                      'px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                      receiptClear === 'clear'
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    <Check size={16} />
                    提交报销
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <h3 className="text-base font-semibold text-slate-900 mb-4">报销预览</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50">
                <p className="text-xs text-primary-600 font-medium">活动预算</p>
                <p className="mt-1 text-base font-semibold text-primary-900">
                  {selectedBudget?.name || '未选择'}
                </p>
                <p className="text-xs text-primary-600/70 mt-0.5">
                  {selectedBudget?.clubName || ''}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-warning-50 to-amber-50 border border-warning-200">
                <p className="text-xs text-warning-600 font-medium">报销金额</p>
                <p className="mt-1 text-2xl font-bold text-warning-700">
                  ¥{formData.amount ? parseFloat(formData.amount).toLocaleString() : '0.00'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">购买人</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formData.purchaser || '未填写'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">付款方式</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formData.paymentMethod || '未选择'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-500">票据</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {receiptFile ? '已上传' : '未上传'}
                </p>
              </div>

              {isOverBudget && (
                <div className="p-3 rounded-lg bg-danger-50 border border-danger-200">
                  <p className="text-xs text-danger-600 font-medium flex items-center gap-1">
                    <AlertTriangle size={12} />
                    超预算 {formatCurrency(overAmount)}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                💡 提示：提交后将进入审批流程，请确保信息准确无误
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
