import { useMemo, useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  CalendarDays,
  CheckCircle2,
  ChevronsUpDown,
  Download,
  FileText,
  Filter,
  MapPin,
  Phone,
  Search,
  Store,
} from 'lucide-react';
import { computeOverdueList } from '@/utils/statsUtils';
import { useLendStore } from '@/store/lendStore';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import { formatDateTime } from '@/utils/dateUtils';
import clsx from 'clsx';

type DayFilter = 'all' | '1-3' | '3-7' | '7+';
type RemindFilter = 'all' | 'pending' | 'done';

export default function OverdueList() {
  const stores = useUmbrellaStore((s) => s.stores);
  const umbrellas = useUmbrellaStore((s) => s.umbrellas);
  const markReminded = useLendStore((s) => s.markReminded);
  const batchMarkReminded = useLendStore((s) => s.batchMarkReminded);
  const lendRecords = useLendStore((s) => s.lendRecords);
  const returnRecords = useLendStore((s) => s.returnRecords);

  const raw = useMemo(
    () => computeOverdueList(),
    [lendRecords, returnRecords, umbrellas, stores]
  );
  const list = useMemo(() => [...raw].sort((a, b) => b.overdueDays - a.overdueDays), [raw]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');
  const [remindFilter, setRemindFilter] = useState<RemindFilter>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filtered = useMemo(() => {
    let arr = list;
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      arr = arr.filter(
        (x) =>
          x.umbrellaCode.toLowerCase().includes(kw) ||
          x.phoneLast4.includes(kw) ||
          x.lentStoreName.toLowerCase().includes(kw)
      );
    }
    if (storeFilter !== 'all') {
      arr = arr.filter((x) => x.lentStoreId === storeFilter);
    }
    if (dayFilter === '1-3') arr = arr.filter((x) => x.overdueDays >= 1 && x.overdueDays < 3);
    if (dayFilter === '3-7') arr = arr.filter((x) => x.overdueDays >= 3 && x.overdueDays < 7);
    if (dayFilter === '7+') arr = arr.filter((x) => x.overdueDays >= 7);
    if (remindFilter === 'pending') arr = arr.filter((x) => !x.reminded);
    if (remindFilter === 'done') arr = arr.filter((x) => x.reminded);
    return [...arr].sort((a, b) =>
      sortOrder === 'desc' ? b.overdueDays - a.overdueDays : a.overdueDays - b.overdueDays
    );
  }, [list, keyword, storeFilter, dayFilter, remindFilter, sortOrder]);

  const total = list.length;
  const reminded = list.filter((x) => x.reminded).length;
  const pending = total - reminded;
  const severe = list.filter((x) => x.overdueDays >= 7).length;

  useEffect(() => {
    setSelected((prev) => {
      const next = new Set<string>();
      const validIds = new Set(filtered.map((x) => x.lendRecordId));
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [filtered]);

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((x) => x.lendRecordId)));
  }
  function handleBatchRemind() {
    if (selected.size === 0) return;
    batchMarkReminded(Array.from(selected));
    setSelected(new Set());
  }
  function toggleRemind(lendRecordId: string, current: boolean) {
    if (current) return;
    markReminded(lendRecordId);
  }
  function handleExport() {
    const header = [
      '雨伞编号',
      '顾客尾号',
      '借出门店',
      '预计归还门店',
      '借出时间',
      '应归还时间',
      '逾期天数',
      '是否已提醒',
    ];
    const rows = filtered.map((x) => [
      x.umbrellaCode,
      `****${x.phoneLast4}`,
      x.lentStoreName,
      x.expectedStoreName,
      formatDateTime(x.lendTime),
      formatDateTime(x.dueTime),
      x.overdueDays + '天',
      x.reminded ? '是' : '否',
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `逾期清单_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasAnyFilter =
    keyword || storeFilter !== 'all' || dayFilter !== 'all' || remindFilter !== 'all';

  return (
    <div className="space-y-6 animate-fadeInUp max-w-7xl mx-auto">
      {/* 顶部标题 + 关键数字 */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif-sc text-2xl font-bold text-slate-900">逾期提醒清单</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              借出超过 48 小时未归还 · 共 {total} 把雨伞逾期
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">待提醒 {pending}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">已提醒 {reminded}</span>
          </div>
          <button onClick={handleExport} className="btn-secondary">
            <Download className="h-4 w-4" /> 导出 CSV
          </button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="逾期总数"
          value={total}
          unit="把"
          hint="借出超过48小时"
          color="from-orange-500 to-orange-600"
          tone="orange"
        />
        <SummaryCard
          icon={<FileText className="h-5 w-5" />}
          label="严重逾期 ≥7天"
          value={severe}
          unit="把"
          hint="建议升级沟通"
          color="from-rose-500 to-rose-600"
          tone="rose"
        />
        <SummaryCard
          icon={<BellOff className="h-5 w-5" />}
          label="待提醒"
          value={pending}
          unit="条"
          hint="需今日处理"
          color="from-amber-500 to-amber-600"
          tone="amber"
        />
        <SummaryCard
          icon={<Bell className="h-5 w-5" />}
          label="已提醒"
          value={reminded}
          unit="条"
          hint="跟进中"
          color="from-emerald-500 to-emerald-600"
          tone="emerald"
        />
      </div>

      {/* 筛选栏 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索编号、顾客尾号、门店..."
              className="input-base pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Store className="h-4 w-4 text-slate-500" />
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-w-[140px]"
            >
              <option value="all">全部门店</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            className="btn-secondary !py-2 text-xs flex items-center gap-1"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {sortOrder === 'desc' ? '逾期天数↓' : '逾期天数↑'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> 逾期天数
          </span>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">
            {(
              [
                { v: 'all', label: '全部' },
                { v: '1-3', label: '1-3天' },
                { v: '3-7', label: '3-7天' },
                { v: '7+', label: '7天以上' },
              ] as Array<{ v: DayFilter; label: string }>
            ).map((f) => (
              <button
                key={f.v}
                onClick={() => setDayFilter(f.v)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  dayFilter === f.v
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="ml-2 text-xs font-medium text-slate-500 flex items-center gap-1">
            <Bell className="h-3.5 w-3.5" /> 提醒状态
          </span>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">
            {(
              [
                { v: 'all' as RemindFilter, label: '全部' },
                { v: 'pending' as RemindFilter, label: '待提醒' },
                { v: 'done' as RemindFilter, label: '已提醒' },
              ]
            ).map((f) => (
              <button
                key={f.v}
                onClick={() => setRemindFilter(f.v)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  remindFilter === f.v
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {hasAnyFilter && (
            <button
              onClick={() => {
                setKeyword('');
                setStoreFilter('all');
                setDayFilter('all');
                setRemindFilter('all');
                setSelected(new Set());
              }}
              className="ml-auto text-xs text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
            >
              清除筛选
            </button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-teal-50 border border-teal-200 px-4 py-2.5 animate-fadeIn">
            <div className="text-sm text-teal-800">
              已选择 <span className="font-bold">{selected.size}</span> 条逾期记录
            </div>
            <button onClick={handleBatchRemind} className="btn-primary !py-1.5 text-xs">
              <Bell className="h-3.5 w-3.5" /> 批量标记已提醒
            </button>
          </div>
        )}
      </div>

      {/* 列表 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-4 font-serif-sc text-lg font-semibold text-slate-800">
              没有符合条件的逾期记录
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {hasAnyFilter ? '换个筛选条件试试？' : '所有雨伞都在按时归还中'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.size === filtered.length && filtered.length > 0}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      雨伞
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      顾客
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      借出门店
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      借出 → 应归还
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      逾期
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      已提醒
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((x, idx) => {
                    const sev =
                      x.overdueDays >= 7
                        ? 'severe'
                        : x.overdueDays >= 3
                        ? 'medium'
                        : 'mild';
                    return (
                      <tr
                        key={x.lendRecordId}
                        className={clsx(
                          'transition-colors',
                          x.reminded ? 'bg-slate-50/40 opacity-75' : 'hover:bg-slate-50/70'
                        )}
                      >
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={selected.has(x.lendRecordId)}
                            onChange={() => toggle(x.lendRecordId)}
                            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={x.umbrellaPhoto}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                            <div className="font-mono font-bold text-sm text-slate-900">
                              {x.umbrellaCode}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="font-mono font-semibold text-slate-800 text-sm">
                              ****{x.phoneLast4}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span
                              className="truncate max-w-[150px]"
                              title={x.lentStoreName}
                            >
                              {x.lentStoreName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5 text-xs text-slate-500 font-mono">
                            <div>{formatDateTime(x.lendTime)}</div>
                            <div className="text-orange-600 font-medium">
                              → {formatDateTime(x.dueTime)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={clsx(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                              sev === 'severe' && 'bg-rose-100 text-rose-700',
                              sev === 'medium' && 'bg-orange-100 text-orange-700',
                              sev === 'mild' && 'bg-amber-100 text-amber-700'
                            )}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {x.overdueDays} 天
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => toggleRemind(x.lendRecordId, x.reminded)}
                            disabled={x.reminded}
                            className={clsx(
                              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                              x.reminded ? 'bg-emerald-500' : 'bg-slate-200 hover:bg-slate-300',
                              x.reminded && 'cursor-default'
                            )}
                            aria-pressed={x.reminded}
                          >
                            <span
                              className={clsx(
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                x.reminded ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                            <span className="sr-only">
                              {x.reminded ? '已提醒' : '待提醒'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500">
              <div>
                共 {filtered.length} 条 · 已选 {selected.size} 条
                {hasAnyFilter && <span className="ml-2">(筛选自 {total} 条全部记录)</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> 严重 {severe}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> 按逾期天数
                  {sortOrder === 'desc' ? '降序' : '升序'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  unit,
  hint,
  color,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  hint: string;
  color: string;
  tone: 'orange' | 'rose' | 'amber' | 'emerald';
}) {
  const toneText = {
    orange: 'text-orange-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  }[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4.5 card-hover animate-fadeInUp p-5">
      <div className={clsx('absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-10 blur-2xl', color)} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <div className={clsx('font-serif-sc text-3xl font-bold', toneText)}>{value}</div>
            <div className={`text-sm font-medium ${toneText} opacity-80`}>{unit}</div>
          </div>
          <div className="mt-1.5 text-xs text-slate-400 truncate">{hint}</div>
        </div>
        <div
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
            color
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
