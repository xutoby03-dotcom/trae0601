import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  CalendarDays,
  Users as UsersIcon,
  Check as CheckIcon,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Trip } from '@/types';
import { todayISO } from '@/utils/date';
import {
  generateSuggestedTripItems,
  detectScenes,
  type TravelScene,
} from '@/utils/medicine';
import { CATEGORY_LABELS } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { isExpired } from '@/utils/medicine';
import { clsx } from 'clsx';

export default function TripWizard() {
  const navigate = useNavigate();
  const { familyMembers, medicines, addTrip, addTripItem } = useAppStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    destination: '',
    startDate: todayISO(),
    days: 3,
    companionIds: [] as string[],
    notes: '',
  });
  const [suggestedItems, setSuggestedItems] = useState<
    { medicineId: string; suggestedQuantity: number; reason: string }[]
  >([]);
  const [manualIds, setManualIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevAutoHash = useRef<string>('');

  const selectedCompanions = familyMembers.filter((fm) =>
    form.companionIds.includes(fm.id)
  );

  const scenes: TravelScene[] = useMemo(
    () => detectScenes(form.destination),
    [form.destination]
  );

  const tempTrip: Trip = useMemo(
    () => ({
      id: 'temp',
      destination: form.destination,
      startDate: form.startDate,
      days: form.days,
      companionIds: form.companionIds,
      status: 'planning',
      notes: form.notes,
      createdAt: new Date().toISOString(),
    }),
    [form]
  );

  const autoHash = useMemo(() => {
    return `${form.destination}|${form.days}|${form.companionIds.join(',')}|${medicines.length}`;
  }, [form, medicines.length]);

  useEffect(() => {
    if (step < 3) return;
    if (autoHash === prevAutoHash.current) return;

    const manualItems = suggestedItems.filter((si) => manualIds.has(si.medicineId));
    const autoSuggestions = generateSuggestedTripItems(
      tempTrip,
      selectedCompanions,
      medicines
    );

    const autoMap = new Map(autoSuggestions.map((a) => [a.medicineId, a]));
    const merged: typeof suggestedItems = [...autoSuggestions];

    manualItems.forEach((mi) => {
      if (!autoMap.has(mi.medicineId)) {
        merged.push(mi);
      }
    });

    setSuggestedItems(merged);
    prevAutoHash.current = autoHash;
  }, [step, autoHash, tempTrip, selectedCompanions, medicines]);

  const handleNext = () => {
    if (step === 2) {
      const autoSuggestions = generateSuggestedTripItems(
        tempTrip,
        selectedCompanions,
        medicines
      );
      setSuggestedItems(autoSuggestions);
      setManualIds(new Set());
      prevAutoHash.current = autoHash;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const autoSuggestions = generateSuggestedTripItems(
      tempTrip,
      selectedCompanions,
      medicines
    );
    setSuggestedItems(autoSuggestions);
    setManualIds(new Set());
    prevAutoHash.current = autoHash;
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleCreate = () => {
    setIsCreating(true);
    const tripId = addTrip(
      {
        destination: form.destination,
        startDate: form.startDate,
        days: form.days,
        companionIds: form.companionIds,
        notes: form.notes,
      },
      suggestedItems.map((si) => ({
        medicineId: si.medicineId,
        suggestedQuantity: si.suggestedQuantity,
      }))
    );
    setTimeout(() => {
      navigate(`/trips/${tripId}`);
    }, 500);
  };

  const addManualItem = (medId: string) => {
    if (suggestedItems.some((si) => si.medicineId === medId)) return;
    setSuggestedItems((s) => [
      ...s,
      { medicineId: medId, suggestedQuantity: 1, reason: '手动添加' },
    ]);
    setManualIds((prev) => new Set(prev).add(medId));
  };

  const removeItem = (medId: string) => {
    setSuggestedItems((s) => s.filter((si) => si.medicineId !== medId));
    setManualIds((prev) => {
      const n = new Set(prev);
      n.delete(medId);
      return n;
    });
  };

  const changeQuantity = (medId: string, delta: number) => {
    setSuggestedItems((s) =>
      s.map((si) =>
        si.medicineId === medId
          ? { ...si, suggestedQuantity: Math.max(1, si.suggestedQuantity + delta) }
          : si
      )
    );
    if (delta !== 0) {
      setManualIds((prev) => new Set(prev).add(medId));
    }
  };

  const availableToAdd = useMemo(() => {
    const added = new Set(suggestedItems.map((s) => s.medicineId));
    return medicines.filter((m) => !added.has(m.id) && !isExpired(m));
  }, [medicines, suggestedItems]);

  const stepInfo = [
    { no: 1, title: '基本信息', icon: Plane },
    { no: 2, title: '选择同行人', icon: UsersIcon },
    { no: 3, title: '确认清单', icon: CheckIcon },
  ];

  const canNext = () => {
    if (step === 1) return form.destination.trim() && form.days > 0;
    if (step === 2) return form.companionIds.length > 0;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/trips')}
          className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-slate-800 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="section-title !mb-0">规划新旅行</h2>
          <p className="section-desc !mb-0">填写信息，系统会根据目的地场景智能推荐药品</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-8">
          {stepInfo.map((info, i) => {
            const Icon = info.icon;
            const done = step > info.no;
            const active = step === info.no;
            return (
              <div key={info.no} className="flex-1 flex items-center">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
                      done && 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50',
                      active &&
                        'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-200/50 scale-105',
                      !done && !active && 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {done ? <CheckIcon size={18} /> : <Icon size={18} />}
                  </div>
                  <span
                    className={clsx(
                      'text-sm font-medium hidden sm:inline truncate',
                      active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'
                    )}
                  >
                    {info.title}
                  </span>
                </div>
                {i < stepInfo.length - 1 && (
                  <div
                    className={clsx(
                      'flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all',
                      done ? 'bg-emerald-400' : 'bg-slate-100'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="label flex items-center gap-1.5">
                <MapPin size={14} /> 目的地 *
              </label>
              <input
                required
                className="input-field text-base"
                placeholder="如：云南大理、三亚、北海道、Tokyo..."
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
              />
              {form.destination.trim() && (
                <div className="mt-3">
                  {scenes.length === 0 ? (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span>💡</span>
                      未识别到特殊场景，按通用旅行推荐。可试试「三亚」「稻城」「北海道」等关键词
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Sparkles size={12} className="text-sand-500" />
                        识别到以下场景，会按规则加权推荐药品：
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {scenes.map((s) => (
                          <span
                            key={s.key}
                            className={clsx(
                              'badge border text-sm !px-3 !py-1.5 animate-scale-in',
                              s.color
                            )}
                          >
                            <span className="mr-1">{s.icon}</span>
                            {s.label}
                            <span className="opacity-70 ml-1.5 text-[10px]">· {s.description}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <CalendarDays size={14} /> 出发日期
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.startDate}
                  min={todayISO()}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">旅行天数 *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="w-11 h-11 rounded-2xl border-2 border-slate-100 text-slate-500 hover:border-brand-300 hover:text-brand-600 transition font-bold"
                    onClick={() => setForm({ ...form, days: Math.max(1, form.days - 1) })}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-display text-3xl font-bold text-slate-900">
                    {form.days}
                    <span className="text-sm font-normal text-slate-500 ml-1">天</span>
                  </div>
                  <button
                    type="button"
                    className="w-11 h-11 rounded-2xl border-2 border-slate-100 text-slate-500 hover:border-brand-300 hover:text-brand-600 transition font-bold"
                    onClick={() => setForm({ ...form, days: form.days + 1 })}
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[1, 3, 5, 7, 14].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, days: d })}
                      className={clsx(
                        'px-3 py-1 rounded-full text-xs font-medium transition-all',
                        form.days === d
                          ? 'bg-brand-400 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      {d}天
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="label">备注说明（选填）</label>
              <textarea
                rows={2}
                className="input-field resize-none"
                placeholder="特殊注意事项..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <p className="text-sm text-slate-600">
              请选择本次旅行的同行人，系统会根据每个人的健康情况推荐药品
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {familyMembers.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                  请先到「家庭成员」页面添加成员档案
                </div>
              ) : (
                familyMembers.map((m) => {
                  const selected = form.companionIds.includes(m.id);
                  const hasAlert = m.allergies || m.chronicConditions;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          companionIds: selected
                            ? f.companionIds.filter((id) => id !== m.id)
                            : [...f.companionIds, m.id],
                        }))
                      }
                      className={clsx(
                        'p-4 rounded-2xl border-2 text-left transition-all relative',
                        selected
                          ? 'border-brand-400 bg-brand-50/70 shadow-sm'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      )}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow">
                          <CheckIcon size={14} />
                        </div>
                      )}
                      <div
                        className={clsx(
                          'w-12 h-12 rounded-xl mb-2 flex items-center justify-center font-bold',
                          m.gender === 'male'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        )}
                      >
                        {m.name.slice(0, 1)}
                      </div>
                      <p className="font-semibold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">
                        {m.relation} · {m.age}岁
                      </p>
                      {hasAlert && (
                        <div className="mt-2">
                          {m.allergies && (
                            <Badge variant="danger" className="!text-[10px] !px-1.5">
                              过敏
                            </Badge>
                          )}
                          {m.chronicConditions && (
                            <Badge variant="warning" className="!text-[10px] !px-1.5 ml-1">
                              慢病
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100">
              <p className="text-sm text-brand-800">
                已选择 <span className="font-bold">{selectedCompanions.length}</span> 位同行人：
                {selectedCompanions.map((c) => c.name).join('、') || '暂未选择'}
              </p>
              {scenes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {scenes.map((s) => (
                    <span
                      key={s.key}
                      className={clsx('badge border !text-[10px] !px-2', s.color)}
                    >
                      <span className="mr-0.5">{s.icon}</span>
                      {s.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-sand-50 to-brand-50 border border-sand-200/60">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="text-sand-500" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 mb-1">智能推荐清单</p>
                <p className="text-xs text-slate-600">
                  基于「{form.destination}」{form.days}天行程，为
                  {selectedCompanions.map((c) => c.name).join('、') || '您'}
                  量身推荐。
                </p>
                {scenes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {scenes.map((s) => (
                      <span
                        key={s.key}
                        className={clsx('badge border !text-[10px] !px-2', s.color)}
                      >
                        <span className="mr-0.5">{s.icon}</span>
                        {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                className={clsx(
                  'p-2 rounded-xl text-slate-500 hover:bg-white/70 hover:text-brand-600 transition shrink-0',
                  isRefreshing && 'animate-spin'
                )}
                title="根据最新输入重新生成"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {suggestedItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 text-slate-500">
                暂无推荐药品，请先在药品档案中录入常备药
              </div>
            ) : (
              <div className="space-y-2">
                {suggestedItems.map((si) => {
                  const med = medicines.find((m) => m.id === si.medicineId);
                  if (!med) return null;
                  const cat = CATEGORY_LABELS[med.category];
                  const isManual = manualIds.has(si.medicineId);
                  return (
                    <div
                      key={si.medicineId}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 animate-fade-in-up"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}
                      >
                        💊
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-slate-900 truncate">{med.name}</p>
                          {isManual && (
                            <Badge variant="info" className="!text-[10px]">
                              手动
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <Badge variant="default" className="!text-[10px]">
                            {cat.label}
                          </Badge>
                          <span className="text-xs text-slate-500">库存 {med.stockQuantity}</span>
                          <span className="text-xs text-brand-600">· {si.reason}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 font-bold"
                          onClick={() => changeQuantity(si.medicineId, -1)}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900">
                          {si.suggestedQuantity}
                        </span>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 font-bold"
                          onClick={() => changeQuantity(si.medicineId, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        onClick={() => removeItem(si.medicineId)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {availableToAdd.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <Plus size={12} /> 手动添加更多药品
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-thin">
                  {availableToAdd.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => addManualItem(m.id)}
                      className="chip-outline !text-xs"
                    >
                      + {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          disabled={step === 1}
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => setStep((s) => s - 1)}
        >
          上一步
        </Button>
        {step < 3 ? (
          <Button
            variant="primary"
            disabled={!canNext()}
            rightIcon={<ArrowRight size={16} />}
            onClick={handleNext}
          >
            下一步
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={isCreating || suggestedItems.length === 0}
            leftIcon={<Sparkles size={16} />}
            onClick={handleCreate}
          >
            {isCreating ? '创建中...' : '创建旅行 & 开始打包'}
          </Button>
        )}
      </div>
    </div>
  );
}
