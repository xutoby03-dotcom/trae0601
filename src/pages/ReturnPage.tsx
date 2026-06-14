import { useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  ScanFace,
  MapPinCheck,
  Send,
  ShieldAlert,
  CheckCircle2,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Power,
  Cable,
  Plug,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { ReservationStatusBadge } from '../components/Badges';
import { TIME_SLOT_LABEL, RESERVATION_STATUS_LABEL } from '../types';
import type { Reservation, Accessory } from '../types';
import { format, parseISO, isSameDay, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '../lib/utils';

const FIXED_CHECK_ITEMS: {
  key: 'hasScratch' | 'inCorrectLocation';
  label: string;
  desc: string;
  icon: typeof ScanFace;
  positive: boolean;
}[] = [
  { key: 'hasScratch', label: '屏幕无新增划痕', desc: '仔细检查屏幕是否有物理损伤', icon: ScanFace, positive: false },
  { key: 'inCorrectLocation', label: '放回指定位置', desc: '确认设备已放回到设备柜原位', icon: MapPinCheck, positive: true },
];

function getAccessoryIcon(name: string) {
  if (name.includes('电源')) return Power;
  if (name.includes('转接头')) return Plug;
  return Cable;
}

interface AccessoryCheckState {
  [accessoryName: string]: boolean;
}

interface FixedCheckState {
  hasScratch: boolean;
  inCorrectLocation: boolean;
}

interface ReturnCheckState {
  accessories: AccessoryCheckState;
  fixed: FixedCheckState;
}

export default function ReturnPage() {
  const toast = useToast();
  const reservations = useStore((s) => s.reservations);
  const displays = useStore((s) => s.displays);
  const completeReturn = useStore((s) => s.completeReturn);

  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checkStates, setCheckStates] = useState<Record<string, ReturnCheckState>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const today = new Date();

  const displayMap = useMemo(() => {
    const m = new Map<string, typeof displays[number]>();
    displays.forEach((d) => m.set(d.id, d));
    return m;
  }, [displays]);

  const toReturn = useMemo(() => {
    return reservations
      .filter((r) => {
        if (r.status === 'returned' || r.status === 'cancelled') return false;
        if (search) {
          const kw = search.toLowerCase();
          if (!r.userName.toLowerCase().includes(kw)
            && !(displayMap.get(r.displayId)?.code.toLowerCase().includes(kw))
            && !r.workstation.toLowerCase().includes(kw)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aOverdue = isBefore(parseISO(a.useDate), today) && !isSameDay(parseISO(a.useDate), today);
        const bOverdue = isBefore(parseISO(b.useDate), today) && !isSameDay(parseISO(b.useDate), today);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
        return a.useDate.localeCompare(b.useDate);
      });
  }, [reservations, search, displayMap, today]);

  const overdueCount = toReturn.filter((r) => isBefore(parseISO(r.useDate), today) && !isSameDay(parseISO(r.useDate), today)).length;
  const todayCount = toReturn.filter((r) => isSameDay(parseISO(r.useDate), today)).length;

  const ensureCheckState = (rId: string, displayAccessories: Accessory[]): ReturnCheckState => {
    if (!checkStates[rId]) {
      const accState: AccessoryCheckState = {};
      displayAccessories.forEach((a) => {
        accState[a.name] = true;
      });
      return {
        accessories: accState,
        fixed: { hasScratch: false, inCorrectLocation: true },
      };
    }
    return checkStates[rId];
  };

  const toggleAccessory = (rId: string, name: string, displayAccessories: Accessory[]) => {
    setCheckStates((prev) => {
      const current = ensureCheckState(rId, displayAccessories);
      return {
        ...prev,
        [rId]: {
          ...current,
          accessories: {
            ...current.accessories,
            [name]: !current.accessories[name],
          },
        },
      };
    });
  };

  const toggleFixed = (rId: string, key: 'hasScratch' | 'inCorrectLocation', displayAccessories: Accessory[]) => {
    setCheckStates((prev) => {
      const current = ensureCheckState(rId, displayAccessories);
      return {
        ...prev,
        [rId]: {
          ...current,
          fixed: {
            ...current.fixed,
            [key]: !current.fixed[key],
          },
        },
      };
    });
  };

  const getMissingAccessories = (rId: string, displayAccessories: Accessory[]): string[] => {
    const state = checkStates[rId];
    if (!state) return [];
    return displayAccessories.filter((a) => !state.accessories[a.name]).map((a) => a.name);
  };

  const getTotalCheckCount = (rId: string, displayAccessories: Accessory[]): { pass: number; total: number } => {
    const state = checkStates[rId];
    if (!state) return { pass: 0, total: displayAccessories.length + FIXED_CHECK_ITEMS.length };
    let pass = 0;
    const total = displayAccessories.length + FIXED_CHECK_ITEMS.length;
    displayAccessories.forEach((a) => {
      if (state.accessories[a.name]) pass++;
    });
    FIXED_CHECK_ITEMS.forEach((item) => {
      if (item.positive ? state.fixed[item.key] : !state.fixed[item.key]) pass++;
    });
    return { pass, total };
  };

  const handleReturn = async (r: Reservation, displayAccessories: Accessory[]) => {
    const state = checkStates[r.id];
    if (!state) return;
    const missingAccessories = getMissingAccessories(r.id, displayAccessories);
    setSubmitting(r.id);
    await new Promise((x) => setTimeout(x, 600));
    completeReturn(r.id, {
      missingAccessoriesOnReturn: missingAccessories,
      hasScratch: state.fixed.hasScratch,
      inCorrectLocation: state.fixed.inCorrectLocation,
      returnNotes: notes[r.id]?.trim() || undefined,
    });
    const issues: string[] = [];
    if (missingAccessories.length > 0) issues.push(`缺少${missingAccessories.join('、')}`);
    if (state.fixed.hasScratch) issues.push('新增划痕');
    if (!state.fixed.inCorrectLocation) issues.push('未放回原位');
    if (issues.length > 0) {
      toast.show(`归还完成，已记录问题：${issues.join('；')}`, 'warning');
    } else {
      toast.show('归还完成，设备状态良好', 'success');
    }
    setSubmitting(null);
    setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-1">归还检查</h2>
        <p className="text-sm text-zinc-500">使用完毕后逐项检查配件和外观，确认后完成归还</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-sky-700 font-medium mb-1">待归还总计</p>
              <p className="text-3xl font-bold text-sky-800">{toReturn.length}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <Clock size={22} className="text-sky-600" />
            </div>
          </div>
          <p className="text-xs text-sky-600 mt-3 pt-3 border-t border-sky-200/60">
            含 <span className="font-bold">{todayCount}</span> 条今日到期，
            <span className="font-bold text-rose-600"> {overdueCount}</span> 条逾期
          </p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-rose-700 font-medium mb-1">逾期未还</p>
              <p className="text-3xl font-bold text-rose-700">{overdueCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <ShieldAlert size={22} className="text-rose-600" />
            </div>
          </div>
          <p className="text-xs text-rose-600 mt-3 pt-3 border-t border-rose-200/60">
            请尽快联系使用人完成归还检查
          </p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium mb-1">今日到期</p>
              <p className="text-3xl font-bold text-emerald-700">{todayCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <PackageCheck size={22} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-3 pt-3 border-t border-emerald-200/60">
            使用结束后请即刻归还到设备柜
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            className="input pl-9"
            placeholder="搜索姓名/设备编号/工位..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {toReturn.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <p className="text-zinc-700 font-medium text-lg">所有设备都已归还</p>
          <p className="text-sm text-zinc-400 mt-1">当前没有待归还的设备预约</p>
        </div>
      ) : (
        <div className="space-y-3">
          {toReturn.map((r) => {
            const d = displayMap.get(r.displayId);
            const isOverdue = isBefore(parseISO(r.useDate), today) && !isSameDay(parseISO(r.useDate), today);
            const isExpanded = expandedId === r.id;
            const accessories = d?.accessories ?? [];
            const state = ensureCheckState(r.id, accessories);
            const missingAcc = getMissingAccessories(r.id, accessories);
            const { pass: passCount, total: totalCount } = getTotalCheckCount(r.id, accessories);
            const allPass = passCount === totalCount;

            return (
              <div
                key={r.id}
                className={cn(
                  'card overflow-hidden transition-all',
                  isExpanded && 'ring-2 ring-brand-200'
                )}
              >
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-4 p-5 cursor-pointer select-none',
                    isExpanded ? 'bg-brand-50/40' : 'hover:bg-zinc-50/60'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  {d && (
                    <img
                      src={d.photoUrl}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-200 shadow-sm shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-zinc-900">{d?.code ?? '未知设备'}</span>
                      {d && <span className="chip bg-zinc-100 text-zinc-600">{d.size}英寸</span>}
                      <ReservationStatusBadge status={r.status} />
                      {isOverdue && (
                        <span className="chip bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                          <ShieldAlert size={12} /> 已逾期
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
                      <span className="flex items-center gap-1">
                        <User size={14} className="text-zinc-400" />
                        {r.userName} · {r.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-zinc-400" />
                        {format(parseISO(r.useDate), 'M月d日', { locale: zhCN })} {TIME_SLOT_LABEL[r.timeSlot].split(' ')[0]}
                      </span>
                      <span>工位：{r.workstation}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">用途：{r.purpose}</div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex gap-1">
                        {accessories.map((a, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              isExpanded
                                ? (state.accessories[a.name] ? 'bg-emerald-500' : 'bg-rose-500')
                                : 'bg-zinc-300'
                            )}
                          />
                        ))}
                        {FIXED_CHECK_ITEMS.map((item) => {
                          const ok = item.positive ? state.fixed[item.key] : !state.fixed[item.key];
                          return (
                            <div
                              key={item.key}
                              className={cn(
                                'w-2.5 h-2.5 rounded-full',
                                isExpanded ? (ok ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-zinc-300'
                              )}
                            />
                          );
                        })}
                      </div>
                    </div>
                    {isExpanded && (
                      <span className="text-xs font-medium text-zinc-500">
                        {passCount}/{totalCount} 项通过
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && d && (
                  <div className="p-5 border-t border-zinc-100 bg-gradient-to-b from-zinc-50/40 to-white space-y-5 animate-fade-in-up">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
                        <PackageCheck size={16} className="text-brand-600" />
                        配件明细检查
                        <span className="text-xs font-normal text-zinc-500">（默认全部齐全，点掉未带回的配件）</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {accessories.map((a, idx) => {
                          const present = state.accessories[a.name] ?? true;
                          const Icon = getAccessoryIcon(a.name);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleAccessory(r.id, a.name, accessories); }}
                              className={cn(
                                'p-3.5 rounded-xl border-2 transition-all text-left flex gap-3 items-center',
                                present
                                  ? 'bg-emerald-50/60 border-emerald-300'
                                  : 'bg-rose-50/60 border-rose-300'
                              )}
                            >
                              <div className={cn(
                                'w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all',
                                present
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'bg-rose-500 text-white shadow-sm'
                              )}>
                                <Icon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-sm text-zinc-800 truncate">{a.name}</span>
                                  <span className={cn(
                                    'text-[11px] font-bold px-2 py-0.5 rounded-full',
                                    present
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-rose-100 text-rose-700'
                                  )}>
                                    {present ? '齐全 ✓' : '缺失 ✗'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-0.5">× {a.quantity}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
                        <ScanFace size={16} className="text-brand-600" />
                        设备外观与位置
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {FIXED_CHECK_ITEMS.map((item) => {
                          const checked = state.fixed[item.key];
                          const passed = item.positive ? checked : !checked;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleFixed(r.id, item.key, accessories); }}
                              className={cn(
                                'p-4 rounded-xl border-2 transition-all text-left flex gap-4 items-start',
                                passed
                                  ? 'bg-emerald-50/60 border-emerald-300'
                                  : 'bg-white border-zinc-200 hover:border-brand-300 hover:bg-brand-50/30'
                              )}
                            >
                              <div className={cn(
                                'w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all',
                                passed ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-zinc-100 text-zinc-500'
                              )}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 pt-0.5">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-bold text-zinc-800">{item.label}</span>
                                  <div className={cn(
                                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                                    passed
                                      ? 'bg-emerald-500 border-emerald-500'
                                      : checked && !item.positive
                                        ? 'bg-rose-500 border-rose-500'
                                        : 'border-zinc-300'
                                  )}>
                                    <CheckSquare size={14} className={cn('text-white', !passed && !checked && 'opacity-0')} />
                                  </div>
                                </div>
                                <p className="text-xs text-zinc-500">{item.desc}</p>
                                <p className={cn(
                                  'text-xs font-medium mt-1.5',
                                  passed ? 'text-emerald-700' : 'text-zinc-400'
                                )}>
                                  当前状态：{passed ? '通过 ✓' : checked && !item.positive ? '存在问题' : '待检查'}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {missingAcc.length > 0 && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                        <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-rose-800 mb-1">以下配件未归还</p>
                          <div className="flex flex-wrap gap-1.5">
                            {missingAcc.map((name) => (
                              <span key={name} className="chip bg-rose-100 text-rose-700 border border-rose-200">
                                {name}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-rose-600 mt-2">这些配件将标记为缺失，设备状态自动变为"配件缺失"，在补齐前不可借出。</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="label">归还备注（可选）</label>
                      <textarea
                        className="input min-h-[80px] resize-y"
                        placeholder="例如：支架调节略有松动、屏幕右下角有轻微灰尘等..."
                        value={notes[r.id] || ''}
                        onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div className="text-sm">
                        <p className="font-medium text-zinc-700 mb-1">
                          检查完成情况：
                          <span className={cn(
                            'ml-1.5',
                            allPass ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'
                          )}>
                            {passCount} / {totalCount} 项通过
                          </span>
                        </p>
                        {missingAcc.length > 0 ? (
                          <p className="text-xs text-rose-600 font-medium">
                            缺失配件：{missingAcc.join('、')}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-500">
                            {RESERVATION_STATUS_LABEL[r.status]} · {d?.code} · 归还后设备状态将自动更新
                          </p>
                        )}
                      </div>
                      <button
                        className={cn(
                          'btn-success gap-2 min-w-[140px]',
                          submitting === r.id && 'opacity-70'
                        )}
                        disabled={submitting === r.id}
                        onClick={(e) => { e.stopPropagation(); handleReturn(r, accessories); }}
                      >
                        {submitting === r.id ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            提交中...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            确认归还
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
