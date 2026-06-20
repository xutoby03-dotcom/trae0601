import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Check, CalendarDays, AlertTriangle, Save } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  CLEAN_ACTION_OPTIONS,
  DAMAGE_TYPE_OPTIONS,
  MATERIAL_LABEL_MAP,
  CLEAN_METHOD_LABEL_MAP,
  todayISO,
} from '@/utils/constants';
import type { CleanMethodAction, DamageType, Toy } from '@/types';
import { cn } from '@/lib/utils';

function getToyMaterialInfo(toy: Toy) {
  return MATERIAL_LABEL_MAP.get(toy.material) || { label: '其他', icon: '📦', color: 'bg-gray-100 text-gray-600' };
}

function getCleanMethodInfo(toy: Toy) {
  return CLEAN_METHOD_LABEL_MAP.get(toy.cleanMethod) || { label: '其他', icon: '⚠️', desc: '' };
}

export default function CleaningFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toys, addCleaningRecord } = useAppStore();

  const urlToyId = searchParams.get('toyId') || '';

  const [selectedToyId, setSelectedToyId] = useState<string>(urlToyId);
  const [selectedMethods, setSelectedMethods] = useState<CleanMethodAction[]>([]);
  const [hasDamage, setHasDamage] = useState(false);
  const [damageType, setDamageType] = useState<DamageType | ''>('');
  const [hasOdor, setHasOdor] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayISO().split('T')[0]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (urlToyId) {
      setCurrentStep(2);
    }
  }, [urlToyId]);

  const filteredToys = useMemo(() => {
    if (!searchKeyword.trim()) return toys;
    const kw = searchKeyword.trim().toLowerCase();
    return toys.filter(t =>
      t.name.toLowerCase().includes(kw) ||
      t.storageLocation.toLowerCase().includes(kw)
    );
  }, [toys, searchKeyword]);

  const selectedToy = toys.find(t => t.id === selectedToyId);

  const toggleMethod = (method: CleanMethodAction) => {
    setSelectedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleDamageToggle = (checked: boolean) => {
    setHasDamage(checked);
    if (!checked) {
      setDamageType('');
    }
  };

  const canSubmit =
    selectedToyId &&
    selectedMethods.length > 0 &&
    (!hasDamage || damageType !== '');

  const handleSubmit = () => {
    if (!canSubmit) return;

    const dateISO = new Date(selectedDate + 'T10:00:00.000Z').toISOString();

    addCleaningRecord({
      toyId: selectedToyId,
      date: dateISO,
      methods: selectedMethods,
      hasDamage,
      hasOdor,
      damageType: hasDamage ? damageType as DamageType : undefined,
      notes: notes.trim() || undefined,
    });

    navigate('/cleaning');
  };

  const steps = [
    { id: 1, title: '选择玩具', icon: '🧸' },
    { id: 2, title: '清洁方式', icon: '🧼' },
    { id: 3, title: '异常检查', icon: '🔍' },
    { id: 4, title: '完成记录', icon: '✅' },
  ];

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl py-6">
        <button
          onClick={() => navigate('/cleaning')}
          className="flex items-center gap-2 text-gray-500 hover:text-baby-500 transition-colors mb-5 group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">返回清洁记录</span>
        </button>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-display flex items-center gap-2 mb-2">
            新增清洁记录 <span className="text-baby-400">✨</span>
          </h1>
          <p className="text-gray-500">记录玩具清洁过程，守护宝宝健康</p>
        </div>

        <div className="flex items-center justify-between mb-8 px-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center text-lg transition-all duration-300',
                    currentStep >= step.id
                      ? 'bg-gradient-to-br from-baby-400 to-baby-300 text-white shadow-card'
                      : 'bg-gray-100 text-gray-400'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check size={18} />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-semibold transition-colors',
                    currentStep >= step.id ? 'text-baby-500' : 'text-gray-400'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-1 mx-2 md:mx-4 rounded-full transition-colors',
                  currentStep > step.id ? 'bg-baby-300' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>

        <div className={cn('card-base p-5 md:p-7 animate-fade-in-up', currentStep === 1 && 'block')}>
          <div className={currentStep !== 1 ? 'hidden' : ''}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>1.</span> 选择要清洁的玩具
                </h2>
                <p className="text-sm text-gray-500 mt-1">点击卡片选择一个玩具</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索玩具..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="input-base pl-9 py-2 text-sm"
                />
              </div>
            </div>

            {filteredToys.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500">没有找到匹配的玩具</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {filteredToys.map(toy => {
                  const matInfo = getToyMaterialInfo(toy);
                  const methodInfo = getCleanMethodInfo(toy);
                  const isSelected = selectedToyId === toy.id;
                  return (
                    <button
                      key={toy.id}
                      onClick={() => setSelectedToyId(toy.id)}
                      className={cn(
                        'relative p-4 rounded-2xl text-left transition-all duration-300',
                        'border-2 hover:-translate-y-0.5',
                        isSelected
                          ? 'border-baby-300 bg-baby-50 shadow-glow-pink'
                          : 'border-gray-100 bg-white hover:border-baby-200 hover:shadow-card'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-baby-400 flex items-center justify-center shadow-soft animate-bounce-soft">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto',
                        matInfo.color
                      )}>
                        {matInfo.icon}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-800 truncate text-center mb-1.5">
                        {toy.name}
                      </h3>
                      <div className="flex flex-wrap justify-center gap-1">
                        <span className="tag bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5">
                          {methodInfo.icon} {methodInfo.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => selectedToyId && setCurrentStep(2)}
                disabled={!selectedToyId}
                className={cn(
                  'btn-primary',
                  !selectedToyId && 'opacity-50 cursor-not-allowed hover:from-baby-400 hover:to-baby-300'
                )}
              >
                下一步
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>

          <div className={currentStep !== 2 ? 'hidden' : ''}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
                <span>2.</span> 选择清洁方式
              </h2>
              <p className="text-sm text-gray-500">
                {selectedToy && (
                  <span>
                    已选玩具：<span className="font-medium text-baby-500">{selectedToy.name}</span>
                    {' '}· 推荐清洁方式：
                    <span className="font-medium text-mint-500">
                      {getCleanMethodInfo(selectedToy).icon} {getCleanMethodInfo(selectedToy).label}
                    </span>
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CLEAN_ACTION_OPTIONS.map(opt => {
                const isSelected = selectedMethods.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleMethod(opt.value)}
                    className={cn(
                      'relative p-5 rounded-2xl transition-all duration-300 border-2',
                      'hover:-translate-y-1',
                      isSelected
                        ? 'border-baby-300 bg-baby-50 shadow-glow-pink'
                        : 'border-gray-100 bg-white hover:border-baby-200 hover:shadow-card'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-baby-400 flex items-center justify-center shadow-soft animate-bounce-soft">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                    <div className="text-4xl mb-3">{opt.icon}</div>
                    <div className={cn(
                      'font-bold text-base',
                      isSelected ? 'text-baby-500' : 'text-gray-800'
                    )}>
                      {opt.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedMethods.length === 0 && (
              <p className="mt-4 text-sm text-alert-400 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                请至少选择一种清洁方式
              </p>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-ghost"
              >
                <ArrowLeft size={16} />
                上一步
              </button>
              <button
                onClick={() => selectedMethods.length > 0 && setCurrentStep(3)}
                disabled={selectedMethods.length === 0}
                className={cn(
                  'btn-primary',
                  selectedMethods.length === 0 && 'opacity-50 cursor-not-allowed hover:from-baby-400 hover:to-baby-300'
                )}
              >
                下一步
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>

          <div className={currentStep !== 3 ? 'hidden' : ''}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
                <span>3.</span> 异常检查与备注
              </h2>
              <p className="text-sm text-gray-500">检查玩具有无破损或异常情况</p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-alert-50 flex items-center justify-center text-xl shrink-0">
                    💔
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">是否发现破损？</div>
                    <p className="text-xs text-gray-500 mt-0.5">如掉漆、松动、发霉、开裂等情况</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={hasDamage}
                    onChange={e => handleDamageToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all after:shadow-md peer-checked:bg-alert-300"></div>
                </label>
              </div>

              {hasDamage && (
                <div className="pl-2 animate-fade-in-up">
                  <label className="label-base ml-2">选择破损类型</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {DAMAGE_TYPE_OPTIONS.map(opt => {
                      const isSelected = damageType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setDamageType(opt.value)}
                          className={cn(
                            'p-3 rounded-xl text-center transition-all duration-200 border-2',
                            isSelected
                              ? 'border-alert-300 bg-alert-50 text-alert-400 shadow-soft'
                              : 'border-gray-100 bg-white hover:border-alert-200 text-gray-600'
                          )}
                        >
                          <div className="text-xl mb-1">{opt.icon}</div>
                          <div className="text-xs font-medium">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl shrink-0">
                    👃
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">是否有异味？</div>
                    <p className="text-xs text-gray-500 mt-0.5">如霉味、酸味或其他异常气味</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={hasOdor}
                    onChange={e => setHasOdor(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all after:shadow-md peer-checked:bg-amber-400"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-clean-50 flex items-center justify-center text-xl shrink-0">
                    <CalendarDays size={20} className="text-clean-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">清洁日期</div>
                    <p className="text-xs text-gray-500 mt-0.5">选择本次清洁的实际日期</p>
                  </div>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  max={todayISO().split('T')[0]}
                  className="input-base w-40 py-2 text-sm"
                />
              </div>

              <div>
                <label className="label-base flex items-center gap-2">
                  <span>📝</span>
                  备注说明
                </label>
                <textarea
                  rows={4}
                  placeholder="添加清洁过程中的备注信息，例如：使用了专用清洁剂、阳光下暴晒2小时等..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-base resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-ghost"
              >
                <ArrowLeft size={16} />
                上一步
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  'btn-primary',
                  !canSubmit && 'opacity-50 cursor-not-allowed hover:from-baby-400 hover:to-baby-300'
                )}
              >
                <Save size={16} />
                保存记录
              </button>
            </div>
          </div>
        </div>

        {currentStep >= 2 && selectedToy && (
          <div className="mt-6 card-base p-4 flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0',
              getToyMaterialInfo(selectedToy).color
            )}>
              {getToyMaterialInfo(selectedToy).icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 truncate">{selectedToy.name}</div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {selectedMethods.map(m => {
                  const opt = CLEAN_ACTION_OPTIONS.find(o => o.value === m);
                  if (!opt) return null;
                  return (
                    <span key={m} className={cn('tag', opt.color)}>
                      {opt.icon} {opt.label}
                    </span>
                  );
                })}
                {hasDamage && damageType && (() => {
                  const d = DAMAGE_TYPE_OPTIONS.find(o => o.value === damageType);
                  return d ? (
                    <span className="tag bg-alert-100 text-alert-400">
                      {d.icon} {d.label}
                    </span>
                  ) : null;
                })()}
                {hasOdor && (
                  <span className="tag bg-amber-100 text-amber-600">
                    👃 异味
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-gray-400">清洁日期</div>
              <div className="text-sm font-semibold text-gray-700">{selectedDate}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
