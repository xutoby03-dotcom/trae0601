import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Zap, AlertCircle, Clock, Coffee } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { UrgencyLevel } from '@/types';

export default function RequestForm() {
  const navigate = useNavigate();
  const items = useStore((s) => s.items);
  const addRequest = useStore((s) => s.addRequest);

  const [form, setForm] = useState({
    itemId: '',
    currentRemaining: '',
    urgency: 'normal' as UrgencyLevel,
    remark: '',
    applicantName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dangerItems = items.filter((i) => i.currentStock < i.minStock);

  const urgencyOptions: { value: UrgencyLevel; label: string; desc: string; icon: typeof Zap; color: string }[] = [
    { value: 'low', label: '不急', desc: '最近 1 周内补上就行', icon: Coffee, color: 'slate' },
    { value: 'normal', label: '普通', desc: '3 天内补上比较好', icon: Clock, color: 'brand' },
    { value: 'high', label: '较急', desc: '1-2 天内需要', icon: AlertCircle, color: 'warn' },
    { value: 'urgent', label: '紧急', desc: '今天就要，影响使用', icon: Zap, color: 'danger' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.itemId) newErrors.itemId = '请选择物品';
    if (form.currentRemaining === '' || parseFloat(form.currentRemaining) < 0)
      newErrors.currentRemaining = '请填写有效的剩余数量';
    if (!form.applicantName.trim()) newErrors.applicantName = '请填写您的姓名';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addRequest({
      itemId: form.itemId,
      currentRemaining: parseFloat(form.currentRemaining) || 0,
      urgency: form.urgency,
      remark: form.remark.trim(),
      applicantName: form.applicantName.trim(),
    });
    navigate('/requests');
  };

  const selectedItem = items.find((i) => i.id === form.itemId);

  return (
    <div className="animate-slide-up">
      <Link
        to="/requests"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回申请列表
      </Link>

      <div className="card p-6 max-w-2xl">
        <h2 className="title-display !text-2xl mb-2">提交补货申请</h2>
        <p className="text-sm text-slate-500 mb-6">发现物品快用完了？快速提交申请，采购会尽快处理</p>

        {dangerItems.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-100">
            <p className="text-sm font-medium text-danger-700 mb-2">⚠️ 以下物品库存已低于下限：</p>
            <div className="flex flex-wrap gap-2">
              {dangerItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, itemId: item.id, currentRemaining: item.currentStock.toString() });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.itemId === item.id
                      ? 'bg-danger-500 text-white'
                      : 'bg-white text-danger-600 border border-danger-200 hover:bg-danger-100'
                  }`}
                >
                  {item.name}（剩 {item.currentStock}）
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">选择物品 *</label>
            <select
              value={form.itemId}
              onChange={(e) => setForm({ ...form, itemId: e.target.value })}
              className={`input ${errors.itemId ? 'border-danger-300' : ''}`}
            >
              <option value="">请选择需要补货的物品</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.specification}（当前库存：{item.currentStock}）
                </option>
              ))}
            </select>
            {errors.itemId && <p className="text-xs text-danger-500 mt-1">{errors.itemId}</p>}
            {selectedItem && (
              <p className="text-xs text-slate-500 mt-2">
                📍 {selectedItem.location} · 下限 {selectedItem.minStock} · 单价 ¥{selectedItem.unitPrice}
              </p>
            )}
          </div>

          <div>
            <label className="label">当前剩余数量 *</label>
            <input
              type="number"
              min="0"
              value={form.currentRemaining}
              onChange={(e) => setForm({ ...form, currentRemaining: e.target.value })}
              placeholder="大概还剩多少？"
              className={`input ${errors.currentRemaining ? 'border-danger-300' : ''}`}
            />
            {errors.currentRemaining && (
              <p className="text-xs text-danger-500 mt-1">{errors.currentRemaining}</p>
            )}
          </div>

          <div>
            <label className="label">紧急程度 *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {urgencyOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.urgency === opt.value;
                const colorClasses = {
                  slate: isSelected ? 'bg-slate-500 text-white border-slate-500' : 'border-slate-200 hover:border-slate-300',
                  brand: isSelected ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-200 hover:border-brand-300',
                  warn: isSelected ? 'bg-warn-400 text-white border-warn-400' : 'border-slate-200 hover:border-warn-300',
                  danger: isSelected ? 'bg-danger-500 text-white border-danger-500' : 'border-slate-200 hover:border-danger-300',
                };
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, urgency: opt.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${colorClasses[opt.color]} ${
                      !isSelected ? 'bg-white' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? '' : 'text-slate-500'}`} />
                    <p className={`font-semibold text-sm ${isSelected ? '' : 'text-slate-900'}`}>{opt.label}</p>
                    <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">备注</label>
            <textarea
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
              rows={3}
              placeholder="有什么要说明的？比如特殊要求、使用场景等"
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label">您的姓名 *</label>
            <input
              type="text"
              value={form.applicantName}
              onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
              placeholder="请输入您的姓名"
              className={`input ${errors.applicantName ? 'border-danger-300' : ''}`}
            />
            {errors.applicantName && <p className="text-xs text-danger-500 mt-1">{errors.applicantName}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="submit" className="btn-primary">
              <Send className="w-4 h-4" />
              提交申请
            </button>
            <button type="button" onClick={() => navigate('/requests')} className="btn-secondary">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
