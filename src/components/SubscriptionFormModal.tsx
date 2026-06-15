import { useEffect, useState } from 'react';
import { X, Plus, X as XIcon, Image, Link2, Sparkles } from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { CATEGORY_OPTIONS, CHANNEL_OPTIONS, CYCLE_OPTIONS } from '@/utils/constants';
import { cn, calculateNextBillingDate, formatCurrency } from '@/utils/helpers';
import type { BillingCycle, Category, Channel, PriceHistory, Subscription } from '@/types';
import { format } from 'date-fns';

type FormState = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>;

const EMOJI_PRESETS = ['📺', '🎵', '🎬', '🎮', '📚', '✏️', '💼', '☁️', '🛒', '🏋️', '🤖', '📝', '🎨', '📖', '🔐', '📧', '🌐', '🎧'];

const defaultForm: FormState = {
  name: '',
  purpose: '',
  category: 'entertainment',
  channel: 'alipay',
  channelCustom: '',
  billingCycle: 'monthly',
  cycleDays: 30,
  amount: 0,
  currency: 'CNY',
  nextBillingDate: format(new Date(), 'yyyy-MM-dd'),
  lastBillingDate: undefined,
  logoEmoji: '📦',
  screenshot: undefined,
  familyMembers: [],
  isTrial: false,
  trialEndDate: undefined,
  trialReminderDays: 3,
  isPriceIncreased: false,
  priceHistory: [],
  cardFailCount: 0,
  duplicateOfId: undefined,
  lastConfirmedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
  notes: '',
};

export default function SubscriptionFormModal() {
  const modalState = useSubscriptionStore((s) => s.modalState);
  const closeModal = useSubscriptionStore((s) => s.closeModal);
  const addSubscription = useSubscriptionStore((s) => s.addSubscription);
  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const isOpen = modalState.add || modalState.editId !== null;
  const isEdit = modalState.editId !== null;

  const [form, setForm] = useState<FormState>(defaultForm);
  const [familyInput, setFamilyInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newPrice, setNewPrice] = useState('');
  const [priceDate, setPriceDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (modalState.editId) {
      const existing = subscriptions.find((s) => s.id === modalState.editId);
      if (existing) {
        const { id, createdAt, updatedAt, ...rest } = existing;
        setForm(rest);
      }
    } else if (modalState.add) {
      setForm({ ...defaultForm, lastConfirmedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss') });
    }
  }, [modalState, subscriptions]);

  if (!isOpen) return null;

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const addFamilyMember = () => {
    const name = familyInput.trim();
    if (!name || form.familyMembers.includes(name)) return;
    updateField('familyMembers', [...form.familyMembers, name]);
    setFamilyInput('');
  };

  const removeFamilyMember = (name: string) => {
    updateField('familyMembers', form.familyMembers.filter((m) => m !== name));
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateField('screenshot', reader.result as string);
    reader.readAsDataURL(file);
  };

  const addPriceHike = () => {
    const newAmount = parseFloat(newPrice);
    if (!newAmount || newAmount <= form.amount) {
      alert('新价格必须高于当前价格 ¥' + form.amount);
      return;
    }
    const history: PriceHistory = {
      date: priceDate,
      from: form.amount,
      to: newAmount,
    };
    updateField('isPriceIncreased', true);
    updateField('priceHistory', [...form.priceHistory, history]);
    updateField('amount', newAmount);
    setNewPrice('');
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = '请输入服务名称';
    if (form.amount <= 0) newErrors.amount = '请输入有效金额';
    if (!form.nextBillingDate) newErrors.nextBillingDate = '请选择下次扣费日';
    if (form.billingCycle === 'custom' && (!form.cycleDays || form.cycleDays < 1)) {
      newErrors.cycleDays = '请输入自定义周期天数';
    }
    if (form.isTrial && !form.trialEndDate) {
      newErrors.trialEndDate = '请输入试用期结束日期';
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    if (form.lastBillingDate && form.lastBillingDate >= form.nextBillingDate) {
      const calc = calculateNextBillingDate(form.billingCycle, form.lastBillingDate, form.cycleDays);
      updateField('nextBillingDate', format(calc, 'yyyy-MM-dd'));
    }

    if (isEdit && modalState.editId) {
      updateSubscription(modalState.editId, form);
    } else {
      addSubscription(form);
    }
    closeModal();
  };

  const duplicateOptions = subscriptions.filter((s) => s.id !== modalState.editId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative w-full max-w-2xl max-h-[92vh] glass-card overflow-hidden flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-teal-900/30 via-transparent to-amber-900/20">
          <div>
            <h2 className="font-display font-bold text-xl">{isEdit ? '编辑订阅' : '新增订阅'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? '修改订阅的详细信息' : '记录一个新的自动扣费'}
            </p>
          </div>
          <button onClick={closeModal} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-teal-500" /> 基础信息
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="sm:col-span-1">
                <label className="label-base">图标</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-black/30 border border-white/10">
                  {EMOJI_PRESETS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => updateField('logoEmoji', e)}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all',
                        form.logoEmoji === e ? 'bg-teal-500/30 ring-2 ring-teal-500/50 scale-110' : 'hover:bg-white/10'
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-4 space-y-4">
                <div>
                  <label className="label-base">服务名称 <span className="text-red-400">*</span></label>
                  <input
                    className={cn('input-base', errors.name && 'border-red-500/50 focus:ring-red-500/20')}
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="如：Netflix、Figma Pro"
                  />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="label-base">用途描述</label>
                  <input
                    className="input-base"
                    value={form.purpose}
                    onChange={(e) => updateField('purpose', e.target.value)}
                    placeholder="如：看剧、团队协作设计"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="label-base">分类</label>
                <select
                  className="input-base"
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value as Category)}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-base">扣费渠道</label>
                <select
                  className="input-base"
                  value={form.channel}
                  onChange={(e) => updateField('channel', e.target.value as Channel)}
                >
                  {CHANNEL_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div className={cn(form.channel === 'other' ? '' : 'hidden')}>
                <label className="label-base">自定义渠道名</label>
                <input
                  className="input-base"
                  value={form.channelCustom || ''}
                  onChange={(e) => updateField('channelCustom', e.target.value)}
                  placeholder="如：某某钱包"
                />
              </div>
              <div>
                <label className="label-base">扣费周期</label>
                <select
                  className="input-base"
                  value={form.billingCycle}
                  onChange={(e) => updateField('billingCycle', e.target.value as BillingCycle)}
                >
                  {CYCLE_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              {form.billingCycle === 'custom' && (
                <div>
                  <label className="label-base">周期（天）</label>
                  <input
                    type="number"
                    min={1}
                    className={cn('input-base', errors.cycleDays && 'border-red-500/50')}
                    value={form.cycleDays || 30}
                    onChange={(e) => updateField('cycleDays', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-amber-500" /> 金额与日期
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="label-base">金额（元） <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  className={cn('input-base font-display font-bold text-lg', errors.amount && 'border-red-500/50')}
                  value={form.amount || ''}
                  onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="label-base">下次扣费日 <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  className={cn('input-base', errors.nextBillingDate && 'border-red-500/50')}
                  value={form.nextBillingDate}
                  onChange={(e) => updateField('nextBillingDate', e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">上次扣费日（可选）</label>
                <input
                  type="date"
                  className="input-base"
                  value={form.lastBillingDate || ''}
                  onChange={(e) => updateField('lastBillingDate', e.target.value || undefined)}
                />
              </div>
              <div>
                <label className="label-base">年化金额</label>
                <div className="input-base flex items-center text-teal-300 font-display font-semibold bg-teal-500/5 border-teal-500/20">
                  {formatCurrency(
                    form.amount * (CYCLE_OPTIONS.find(c => c.value === form.billingCycle)?.multiplier || 12)
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-emerald-500" /> 试用期设置
              <span className="tag bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ml-2">
                <Sparkles className="w-3 h-3" /> 提前提醒
              </span>
            </h3>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors w-fit">
              <input
                type="checkbox"
                checked={form.isTrial}
                onChange={(e) => updateField('isTrial', e.target.checked)}
                className="w-4 h-4 rounded accent-teal-500"
              />
              <span className="text-sm font-medium">这是试用期订阅</span>
            </label>
            {form.isTrial && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-emerald-500/30">
                <div>
                  <label className="label-base">试用期结束日期</label>
                  <input
                    type="date"
                    className={cn('input-base', errors.trialEndDate && 'border-red-500/50')}
                    value={form.trialEndDate || ''}
                    onChange={(e) => updateField('trialEndDate', e.target.value || undefined)}
                  />
                </div>
                <div>
                  <label className="label-base">提前几天提醒取消</label>
                  <select
                    className="input-base"
                    value={form.trialReminderDays || 3}
                    onChange={(e) => updateField('trialReminderDays', parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 5, 7, 14].map((d) => (
                      <option key={d} value={d}>{d} 天前</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-sky-500" /> 家庭共享
            </h3>
            <div className="flex gap-2">
              <input
                className="input-base flex-1"
                placeholder="添加共享人姓名，回车添加"
                value={familyInput}
                onChange={(e) => setFamilyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFamilyMember();
                  }
                }}
              />
              <button type="button" onClick={addFamilyMember} className="btn-secondary !px-4">
                <Plus className="w-4 h-4" /> 添加
              </button>
            </div>
            {form.familyMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.familyMembers.map((m) => (
                  <span
                    key={m}
                    className="tag bg-sky-500/15 text-sky-300 border border-sky-500/30 gap-1.5 pr-1.5"
                  >
                    👤 {m}
                    <button
                      onClick={() => removeFamilyMember(m)}
                      className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-red-500" /> 异常记录
            </h3>
            <div className="space-y-3 p-4 rounded-xl bg-black/20 border border-white/5">
              {isEdit && duplicateOptions.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <Link2 className="w-4 h-4 text-fuchsia-400" />
                  <label className="text-xs text-slate-400 shrink-0">关联重复订阅：</label>
                  <select
                    className="input-base !w-auto !py-1.5 text-xs flex-1 min-w-[180px]"
                    value={form.duplicateOfId || ''}
                    onChange={(e) => updateField('duplicateOfId', e.target.value || undefined)}
                  >
                    <option value="">无</option>
                    {duplicateOptions.map((s) => (
                      <option key={s.id} value={s.id}>{s.logoEmoji} {s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm">⚠️</span>
                <label className="text-xs text-slate-400 shrink-0">换卡失败次数：</label>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateField('cardFailCount', n)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                        form.cardFailCount === n
                          ? 'bg-orange-500/30 text-orange-300 border border-orange-500/40'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 ml-1">次</span>
                </div>
              </div>

              {form.isPriceIncreased && form.priceHistory.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs font-medium text-red-300 mb-2">涨价记录</p>
                  <div className="space-y-1">
                    {form.priceHistory.map((h, i) => (
                      <div key={i} className="text-xs text-slate-400 flex items-center justify-between">
                        <span>{h.date}</span>
                        <span className="font-display text-red-300">¥{h.from} → ¥{h.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEdit && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
                  <input
                    type="number"
                    placeholder="新价格"
                    className="input-base text-sm"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                  <input
                    type="date"
                    className="input-base text-sm"
                    value={priceDate}
                    onChange={(e) => setPriceDate(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addPriceHike}
                    className="btn-secondary text-sm"
                  >
                    <Plus className="w-4 h-4" /> 记录涨价
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-fuchsia-500" /> 截图与备注
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-base">订阅截图（可选）</label>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshot}
                    className="hidden"
                  />
                  {form.screenshot ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video">
                      <img src={form.screenshot} alt="截图" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => updateField('screenshot', undefined)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl border-2 border-dashed border-white/15 hover:border-teal-500/40 hover:bg-teal-500/5 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-teal-400 transition-all">
                      <Image className="w-8 h-8" />
                      <span className="text-xs">点击上传扣费凭证截图</span>
                    </div>
                  )}
                </label>
              </div>
              <div>
                <label className="label-base">备注</label>
                <textarea
                  className="input-base h-[calc(100%-1.5rem)] resize-none"
                  rows={5}
                  value={form.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="任何需要记录的信息：客服电话、账号关联等..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 bg-black/20">
          <div className="text-xs text-slate-500 hidden sm:block">
            <span className="text-red-400">*</span> 为必填项 · 数据仅保存在本地
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={closeModal} className="btn-secondary">取消</button>
            <button onClick={handleSubmit} className="btn-primary">
              {isEdit ? '保存修改' : '添加订阅'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
