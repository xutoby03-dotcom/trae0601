import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  CloudRain,
  Droplets,
  FileWarning,
  RotateCcw,
  Search,
  ShieldCheck,
  Tag,
  Umbrella as UmbrellaIcon,
  XCircle,
  Sparkles,
  Phone,
  CalendarDays,
} from 'lucide-react';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import { useLendStore } from '@/store/lendStore';
import type { Umbrella, LendRecord } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import clsx from 'clsx';
import { formatDateTime, isOverdue } from '@/utils/dateUtils';

interface Inspection {
  frameOk: boolean | null;
  surfaceOk: boolean | null;
  coverOk: boolean | null;
  isWet: boolean | null;
}

const INSPECT_INIT: Inspection = {
  frameOk: null,
  surfaceOk: null,
  coverOk: null,
  isWet: null,
};

const INSPECT_ITEMS = [
  { key: 'frameOk' as const, title: '伞骨检查', desc: '检查伞骨是否断裂、变形、松动', icon: ShieldCheck, wet: false },
  { key: 'surfaceOk' as const, title: '伞面检查', desc: '检查伞面是否有破洞、脱线、褪色', icon: UmbrellaIcon, wet: false },
  { key: 'coverOk' as const, title: '伞套检查', desc: '检查伞套是否完好、无丢失', icon: Tag, wet: false },
  { key: 'isWet' as const, title: '潮湿检查', desc: '雨伞是否仍处于潮湿状态', icon: Droplets, wet: true },
] as const;

export default function ReturnPage() {
  const getUmbrellaByCode = useUmbrellaStore((s) => s.getUmbrellaByCode);
  const getStoreName = useUmbrellaStore((s) => s.getStoreName);
  const stores = useUmbrellaStore((s) => s.stores);
  const getActiveLend = useLendStore((s) => s.getActiveLendByUmbrella);
  const returnUmbrella = useLendStore((s) => s.returnUmbrella);
  const lendRecords = useLendStore((s) => s.lendRecords);
  const returnRecords = useLendStore((s) => s.returnRecords);

  const [codeInput, setCodeInput] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [searched, setSearched] = useState<{ umb: Umbrella; lend: LendRecord } | null>(null);
  const [error, setError] = useState('');
  const [inspection, setInspection] = useState<Inspection>(INSPECT_INIT);
  const [damageNote, setDamageNote] = useState('');
  const [result, setResult] = useState<{ ok: boolean; final?: string } | null>(null);

  const returnedIds = useMemo(() => new Set(returnRecords.map((r) => r.lendRecordId)), [returnRecords]);
  const currentlyLent = useMemo(() => {
    return lendRecords
      .filter((r) => !returnedIds.has(r.id))
      .slice(0, 8)
      .map((r) => {
        const u = getUmbrellaByCode('');
        void u;
        return r;
      });
  }, [lendRecords, returnedIds, getUmbrellaByCode]);

  const lentUmbrellas = useMemo(() => {
    const getU = useUmbrellaStore.getState().getUmbrella;
    return currentlyLent
      .map((r) => ({ lend: r, umb: getU(r.umbrellaId) }))
      .filter((x): x is { lend: LendRecord; umb: Umbrella } => !!x.umb);
  }, [currentlyLent]);

  function searchUmbrella() {
    setError('');
    setSearched(null);
    setResult(null);
    setInspection(INSPECT_INIT);
    setDamageNote('');
    const umb = getUmbrellaByCode(codeInput.trim());
    if (!umb) {
      setError('未找到该编号雨伞，请检查输入');
      return;
    }
    if (umb.status !== 'lent') {
      setError(`此雨伞当前状态为"${umb.status === 'available' ? '可借' : umb.status === 'damaged' ? '破损待修' : '已报废'}"，无法办理归还`);
      return;
    }
    const lend = getActiveLend(umb.id);
    if (!lend) {
      setError('系统未找到对应的借出记录');
      return;
    }
    setSearched({ umb, lend });
  }

  function setInspect<K extends keyof Inspection>(key: K, value: Inspection[K]) {
    setInspection((prev) => ({ ...prev, [key]: value }));
  }

  const allChecked = inspection.frameOk !== null && inspection.surfaceOk !== null
    && inspection.coverOk !== null && inspection.isWet !== null;
  const allPass = inspection.frameOk === true && inspection.surfaceOk === true
    && inspection.coverOk === true && inspection.isWet === false;

  function handleSubmit() {
    if (!searched || !allChecked) return;
    const r = returnUmbrella({
      lendRecordId: searched.lend.id,
      umbrellaId: searched.umb.id,
      frameOk: inspection.frameOk!,
      surfaceOk: inspection.surfaceOk!,
      coverOk: inspection.coverOk!,
      isWet: inspection.isWet!,
      damageNote,
    });
    setResult({ ok: r.ok, final: r.finalStatus === 'available' ? '可正常入库' : '已标记为破损待修' });
    setTimeout(() => {
      setSearched(null);
      setCodeInput('');
      setInspection(INSPECT_INIT);
      setDamageNote('');
      setResult(null);
    }, 2600);
  }

  function onKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && codeInput.trim()) searchUmbrella();
  }

  return (
    <div className="space-y-6 animate-fadeInUp max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif-sc text-2xl font-bold text-slate-900">雨伞归还</h1>
            <p className="mt-0.5 text-sm text-slate-500">扫码或输入编号查找，完成四项质检</p>
          </div>
        </div>
        <Link to="/lend" className="btn-secondary">前往借出页面</Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <label className="label-base text-base">输入雨伞编号</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value); setSearchKey(e.target.value); }}
              onKeyDown={onKeyPress}
              placeholder="请输入或扫描雨伞编号，如 U-A-001"
              className="input-base pl-12 !py-3.5 text-base font-mono tracking-wider"
            />
          </div>
          <button
            onClick={searchUmbrella}
            disabled={!codeInput.trim()}
            className="btn-primary !px-6 text-base"
          >
            查找雨伞
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800 animate-fadeIn">
            <XCircle className="h-5 w-5 shrink-0" />
            <div>
              <div className="font-semibold">查找失败</div>
              <div className="text-xs mt-0.5 opacity-90">{error}</div>
            </div>
          </div>
        )}

        {!searched && !error && lentUmbrellas.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> 最近借出中（快速选择）
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {lentUmbrellas.map(({ umb, lend }) => (
                <button
                  key={lend.id}
                  onClick={() => { setCodeInput(umb.code); }}
                  className="group flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 text-left hover:border-teal-300 hover:bg-teal-50/40 transition-all"
                >
                  <img
                    src={umb.photoUrl}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 group-hover:ring-teal-300 transition-all"
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-bold text-slate-900">{umb.code}</div>
                    <div className="text-[11px] text-slate-500">
                      尾号{lend.phoneLast4} · {umb.color}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fadeInUp">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-700 px-5 py-4 text-white">
                <div className="text-sm text-teal-100">雨伞信息</div>
                <div className="mt-1 font-serif-sc text-lg font-bold flex items-center gap-2">
                  {searched.umb.code}
                  <StatusBadge status={searched.umb.status} size="sm" />
                </div>
              </div>
              <div className="relative">
                <img
                  src={searched.umb.photoUrl}
                  alt=""
                  className="w-full aspect-[16/10] object-cover"
                />
                {isOverdue(searched.lend.dueTime) && (
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    <FileWarning className="h-3.5 w-3.5" /> 已逾期
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3 text-sm">
                <Row icon={<UmbrellaIcon className="h-4 w-4" />} label="雨伞规格">
                  {searched.umb.color} · 押金 ¥{searched.umb.deposit}
                </Row>
                <Row icon={<Phone className="h-4 w-4" />} label="顾客尾号">
                  <span className="font-mono font-semibold">****{searched.lend.phoneLast4}</span>
                </Row>
                <Row icon={<CalendarDays className="h-4 w-4" />} label="借出时间">
                  {formatDateTime(searched.lend.lendTime)}
                </Row>
                <Row icon={<CalendarDays className="h-4 w-4" />} label="应归还时间">
                  {formatDateTime(searched.lend.dueTime)}
                </Row>
                <Row icon={<Tag className="h-4 w-4" />} label="预计归还门店">
                  {getStoreName(searched.lend.expectedStoreId)}
                </Row>
                <Row icon={<CloudRain className="h-4 w-4" />} label="押金">
                  {searched.lend.depositStatus === 'paid'
                    ? <span className="text-emerald-700 font-medium">已收取 ¥{searched.umb.deposit}</span>
                    : <span className="text-orange-700 font-medium">待收取</span>}
                </Row>
                {stores.find((s) => s.id === searched.lend.expectedStoreId) && (
                  <p className="pt-2 text-xs text-slate-500 border-t border-slate-100">
                    门店地址：{stores.find((s) => s.id === searched.lend.expectedStoreId)!.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif-sc text-base font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-600" /> 四项质检
                </h2>
                <span className={clsx(
                  'text-xs font-medium rounded-full px-2.5 py-1',
                  allChecked
                    ? allPass
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-orange-50 text-orange-700'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {allChecked
                    ? allPass ? '质检全部通过' : '检测到异常，将标记为破损'
                    : `待完成 ${Object.values(inspection).filter((v) => v === null).length} 项`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INSPECT_ITEMS.map((item) => {
                  const val = inspection[item.key];
                  return (
                    <div
                      key={item.key}
                      className={clsx(
                        'rounded-xl border p-4 transition-all animate-fadeInUp',
                        val === true && !item.wet && 'border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-500/15',
                        val === false && !item.wet && 'border-rose-400 bg-rose-50/60 ring-2 ring-rose-500/15',
                        item.wet && val === false && 'border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-500/15',
                        item.wet && val === true && 'border-sky-400 bg-sky-50/60 ring-2 ring-sky-500/15',
                        val === null && 'border-slate-200'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          val === null && 'bg-slate-100 text-slate-500',
                          val === true && !item.wet && 'bg-emerald-100 text-emerald-700',
                          val === false && !item.wet && 'bg-rose-100 text-rose-700',
                          item.wet && val === false && 'bg-emerald-100 text-emerald-700',
                          item.wet && val === true && 'bg-sky-100 text-sky-700'
                        )}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{item.desc}</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setInspect(item.key, item.wet ? false : true)}
                          className={clsx(
                            'rounded-lg border py-1.5 text-xs font-medium transition-all',
                            (val === true && !item.wet) || (item.wet && val === false)
                              ? 'border-emerald-500 bg-white text-emerald-700 shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          )}
                        >
                          <span className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {item.wet ? '已擦干' : '正常'}
                          </span>
                        </button>
                        <button
                          onClick={() => setInspect(item.key, item.wet ? true : false)}
                          className={clsx(
                            'rounded-lg border py-1.5 text-xs font-medium transition-all',
                            (val === false && !item.wet) || (item.wet && val === true)
                              ? (item.wet ? 'border-sky-500 bg-white text-sky-700 shadow-sm' : 'border-rose-500 bg-white text-rose-700 shadow-sm')
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          )}
                        >
                          <span className="flex items-center justify-center gap-1">
                            {item.wet ? <Droplets className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {item.wet ? '仍潮湿' : '异常'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {allChecked && !allPass && (
                <div className="mt-4 space-y-2 rounded-xl bg-orange-50 border border-orange-200 p-4 animate-fadeIn">
                  <div className="flex items-start gap-2 text-sm text-orange-800">
                    <FileWarning className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">质检未完全通过</div>
                      <div className="text-xs mt-0.5 opacity-90">
                        此伞将被标记为"破损待修"，不可再次借出。请在下方备注破损情况。
                      </div>
                    </div>
                  </div>
                  <textarea
                    value={damageNote}
                    onChange={(e) => setDamageNote(e.target.value)}
                    rows={2}
                    placeholder="请详细描述破损位置和程度，便于后续维修处理..."
                    className="input-base bg-white text-xs"
                  />
                </div>
              )}
            </div>

            {result && (
              <div
                className={clsx(
                  'flex items-start gap-3 rounded-2xl p-5 animate-fadeIn',
                  result.final === '可正常入库'
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-orange-50 border border-orange-200'
                )}
              >
                <div className={clsx(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  result.final === '可正常入库'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-orange-500 text-white'
                )}>
                  {result.final === '可正常入库'
                    ? <CheckCircle2 className="h-6 w-6" />
                    : <FileWarning className="h-6 w-6" />}
                </div>
                <div>
                  <div className="font-serif-sc text-base font-bold text-slate-900">
                    归还登记成功
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {searched.umb.code} · {result.final}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!allChecked || !!result}
              className="btn-primary w-full justify-center !py-3.5 text-base"
            >
              <RotateCcw className="h-5 w-5" />
              确认归还
              {allChecked && !allPass && '（标记破损）'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
        <div className="mt-0.5 text-slate-700">{children}</div>
      </div>
    </div>
  );
}
