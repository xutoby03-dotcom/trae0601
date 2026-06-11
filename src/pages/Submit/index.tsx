import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertTriangle, CheckCircle, UtensilsCrossed, Users, Store, DollarSign, Calendar, FileText, Image } from 'lucide-react';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import type { InvoiceStatus, ReimbursementFormData } from '@/types';
import { cn } from '@/lib/utils';

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlmYTNhYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWwj+WNoik8L3RleHQ+PC9zdmc+';

export function SubmitPage() {
  const navigate = useNavigate();
  const { projects, addReimbursement, isOverStandard, getProjectStandard } = useReimbursementStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ReimbursementFormData>({
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    employeeName: '',
    peopleCount: 1,
    shopName: '',
    amount: 0,
    invoiceStatus: 'provided',
    receiptImage: defaultImage,
    overStandardReason: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const overStandard = useMemo(() => {
    if (!formData.projectId || formData.peopleCount === 0 || formData.amount === 0) {
      return false;
    }
    return isOverStandard(formData.amount, formData.peopleCount, formData.projectId);
  }, [formData.amount, formData.peopleCount, formData.projectId, isOverStandard]);

  const standardAmount = useMemo(() => {
    if (!formData.projectId) return 0;
    return getProjectStandard(formData.projectId);
  }, [formData.projectId, getProjectStandard]);

  const perPersonAmount = useMemo(() => {
    if (formData.peopleCount === 0) return 0;
    return formData.amount / formData.peopleCount;
  }, [formData.amount, formData.peopleCount]);

  const canSubmit = useMemo(() => {
    if (!formData.date) return false;
    if (!formData.projectId) return false;
    if (!formData.employeeName.trim()) return false;
    if (formData.peopleCount < 1) return false;
    if (!formData.shopName.trim()) return false;
    if (formData.amount <= 0) return false;
    if (overStandard && !formData.overStandardReason?.trim()) return false;
    return true;
  }, [formData, overStandard]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          receiptImage: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    addReimbursement(formData);
    setShowSuccess(true);

    setTimeout(() => {
      navigate('/review');
    }, 1500);
  };

  const updateField = <K extends keyof ReimbursementFormData>(
    key: K,
    value: ReimbursementFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">提交成功</h2>
          <p className="text-gray-500">报销申请已提交，等待管理员审核</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">提交报销</h1>
        <p className="text-gray-500 mt-1">填写加班餐费用信息，提交后等待审核</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            基本信息
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-gray-400" />
                用餐日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1 text-gray-400" />
                员工姓名
              </label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => updateField('employeeName', e.target.value)}
                placeholder="请输入姓名"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UtensilsCrossed className="w-4 h-4 inline mr-1 text-gray-400" />
                所属项目
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => updateField('projectId', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white"
              >
                <option value="">请选择项目</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.department} (人均标准 ¥{project.standardAmount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1 text-gray-400" />
                用餐人数
              </label>
              <input
                type="number"
                min="1"
                value={formData.peopleCount}
                onChange={(e) => updateField('peopleCount', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Store className="w-4 h-4 inline mr-1 text-gray-400" />
                店铺名称
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => updateField('shopName', e.target.value)}
                placeholder="请输入店铺名称"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            费用信息
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                总金额 (元)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                人均金额
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className={cn(
                  'font-mono font-medium',
                  overStandard ? 'text-amber-600' : 'text-gray-900'
                )}>
                  ¥{perPersonAmount.toFixed(2)}
                </span>
                {standardAmount > 0 && (
                  <span className="text-gray-400 text-sm ml-2">
                    (标准: ¥{standardAmount}/人)
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发票状态
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'provided', label: '有发票' },
                  { value: 'partial', label: '部分发票' },
                  { value: 'missing', label: '无发票' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all',
                      formData.invoiceStatus === option.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )}
                  >
                    <input
                      type="radio"
                      name="invoiceStatus"
                      value={option.value}
                      checked={formData.invoiceStatus === option.value}
                      onChange={(e) => updateField('invoiceStatus', e.target.value as InvoiceStatus)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {overStandard && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-amber-800 font-medium">金额超标准</p>
                  <p className="text-amber-600 text-sm mt-1">
                    人均 ¥{perPersonAmount.toFixed(2)} 超过标准 ¥{standardAmount}，请填写超标原因
                  </p>
                  <textarea
                    value={formData.overStandardReason || ''}
                    onChange={(e) => updateField('overStandardReason', e.target.value)}
                    placeholder="请详细说明超标原因..."
                    rows={3}
                    className="mt-3 w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Image className="w-5 h-5 text-teal-600" />
            餐单截图
          </h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {formData.receiptImage === defaultImage ? (
              <div>
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3 group-hover:text-teal-400 transition-colors" />
                <p className="text-gray-500">点击上传餐单截图</p>
                <p className="text-gray-400 text-sm mt-1">支持 JPG、PNG 格式</p>
              </div>
            ) : (
              <img
                src={formData.receiptImage}
                alt="餐单截图"
                className="max-h-64 mx-auto rounded-lg shadow-sm"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'px-8 py-2.5 rounded-xl font-medium transition-all',
              canSubmit
                ? 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            提交申请
          </button>
        </div>
      </form>
    </div>
  );
}
