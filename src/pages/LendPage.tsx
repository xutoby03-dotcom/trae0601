import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Phone,
  Search,
  Store,
  Tag,
  Umbrella as UmbrellaIcon,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import { useLendStore } from '@/store/lendStore';
import type { DepositStatus, Umbrella } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import clsx from 'clsx';
import { formatDateTime } from '@/utils/dateUtils';

const sizeLabel = { small: '单人', medium: '双人', large: '加大' };

export default function LendPage() {
  const stores = useUmbrellaStore((s) => s.stores);
  const currentStoreId = useUmbrellaStore((s) => s.currentStoreId);
  const getAvailableByStore = useUmbrellaStore((s) => s.getAvailableByStore);
  const getStoreName = useUmbrellaStore((s) => s.getStoreName);
  const lendUmbrella = useLendStore((s) => s.lendUmbrella);

  const [selected, setSelected] = useState<Umbrella | null>(null);
  const [phoneLast4, setPhoneLast4] = useState('');
  const [expectedStoreId, setExpectedStoreId] = useState(currentStoreId);
  const [depositStatus, setDepositStatus] = useState<DepositStatus>('paid');
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const available = useMemo(() => {
    const list = getAvailableByStore(currentStoreId);
    if (!keyword.trim()) return list;
    const kw = keyword.trim().toLowerCase();
    return list.filter((u) => u.code.toLowerCase().includes(kw) || u.color.toLowerCase().includes(kw));
  }, [getAvailableByStore, currentStoreId, keyword]);

  const phoneValid = /^\d{4}$/.test(phoneLast4);
  const canSubmit = selected && phoneValid && expectedStoreId;

  function handleSubmit() {
    if (!selected || !canSubmit) return;
    const r = lendUmbrella({
      umbrellaId: selected.id,
      phoneLast4,
      expectedStoreId,
      depositStatus,
    });
    if (r.ok) {
      setResult({ ok: true, message: `借出成功！雨伞 ${selected.code} 已登记` });
      setTimeout(() => {
        setSelected(null);
        setPhoneLast4('');
        setDepositStatus('paid');
        setExpectedStoreId(currentStoreId);
        setResult(null);
      }, 2200);
    } else {
      setResult({ ok: false, message: r.message || '借出失败，请检查输入' });
      setTimeout(() => setResult(null), 2500);
    }
  }

  const now = new Date();
  const due = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  return (
    <div className="space-y-6 animate-fadeInUp max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif-sc text-2xl font-bold text-slate-900">雨伞借出</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {getStoreName(currentStoreId)} · 当前可借 {available.length} 把
            </p>
          </div>
        </div>
        <Link to="/return" className="btn-secondary">
          前往归还页面
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif-sc text-base font-semibold text-slate-900">
                选择可借雨伞
              </h2>
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索编号/颜色"
                  className="input-base pl-9 py-2"
                />
              </div>
            </div>

            {available.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
                <UmbrellaIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">当前门店暂无可借雨伞</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[540px] overflow-y-auto scrollbar-thin pr-1">
                {available.map((u) => {
                  const active = selected?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelected(u)}
                      className={clsx(
                        'group relative overflow-hidden rounded-xl border text-left transition-all animate-fadeInUp',
                        active
                          ? 'border-teal-500 ring-2 ring-teal-500/25 shadow-md'
                          : 'border-slate-200 hover:border-teal-300 hover:shadow-sm'
                      )}
                    >
                      {active && (
                        <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white shadow">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                      <div className="aspect-square overflow-hidden bg-slate-100">
                        <img
                          src={u.photoUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-slate-900">{u.code}</span>
                          <span className="text-xs font-semibold text-teal-700">¥{u.deposit}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.color} · {sizeLabel[u.size]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-sky-700 px-5 py-4 text-white">
              <div className="flex items-center gap-2 text-sm text-sky-100">借出登记</div>
              <div className="mt-1 font-serif-sc text-lg font-bold">借出信息确认</div>
            </div>

            <div className="p-5 space-y-4">
              {selected ? (
                <div className="flex gap-3 rounded-xl bg-slate-50 p-3">
                  <img
                    src={selected.photoUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900">{selected.code}</span>
                      <StatusBadge status={selected.status} size="sm" />
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {selected.color} · {sizeLabel[selected.size]}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-teal-700">
                      押金 ¥{selected.deposit}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-7 text-slate-400 text-sm">
                  <UmbrellaIcon className="h-5 w-5" /> 请从左侧选择一把雨伞
                </div>
              )}

              <div>
                <label className="label-base flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> 顾客手机号后四位
                  <span className="text-orange-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                    ****
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={4}
                    value={phoneLast4}
                    onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入最后4位数字"
                    className={clsx(
                      'input-base pl-12 font-mono tracking-[0.4em] text-lg !py-3',
                      phoneLast4.length > 0 && !phoneValid && '!border-orange-400'
                    )}
                  />
                </div>
                {phoneLast4.length > 0 && !phoneValid && (
                  <p className="mt-1 text-xs text-orange-600">请输入完整的4位数字</p>
                )}
              </div>

              <div>
                <label className="label-base flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> 预计归还门店
                </label>
                <div className="relative">
                  <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={expectedStoreId}
                    onChange={(e) => setExpectedStoreId(e.target.value)}
                    className="input-base pl-9"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-base flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" /> 押金收取状态
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositStatus('paid')}
                    className={clsx(
                      'rounded-xl border p-3 text-left transition-all',
                      depositStatus === 'paid'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> 已收取
                    </div>
                    <div className="mt-0.5 text-[11px] opacity-80">顾客已支付押金</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositStatus('unpaid')}
                    className={clsx(
                      'rounded-xl border p-3 text-left transition-all',
                      depositStatus === 'unpaid'
                        ? 'border-orange-500 bg-orange-50 text-orange-800 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> 待收取
                    </div>
                    <div className="mt-0.5 text-[11px] opacity-80">老顾客信任借出</div>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  <span>借出时间：{formatDateTime(now.toISOString())}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-sky-600" />
                  <span>应归还时间：{formatDateTime(due.toISOString())}</span>
                </div>
                <p className="pt-1 text-[11px] text-slate-500 border-t border-sky-100 mt-1.5">
                  借出周期 48 小时，超过将进入逾期提醒清单
                </p>
              </div>

              {result && (
                <div
                  className={clsx(
                    'flex items-start gap-2 rounded-xl p-3 text-sm animate-fadeIn',
                    result.ok
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-orange-50 text-orange-800 border border-orange-200'
                  )}
                >
                  {result.ok ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0" />
                  )}
                  <span className="font-medium">{result.message}</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="btn-primary w-full justify-center !py-3 text-base"
              >
                <ArrowRightLeft className="h-5 w-5" /> 确认借出
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
