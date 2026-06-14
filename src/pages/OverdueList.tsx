import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import { computeOverdueList } from '@/utils/statsUtils';
import { useLendStore } from '@/store/lendStore';
import { formatDateTime } from '@/utils/dateUtils';
import clsx from 'clsx';

export default function OverdueList() {
  const markReminded = useLendStore((s) => s.markReminded);
  const batchMarkReminded = useLendStore((s) => s.batchMarkReminded);

  const raw = useMemo(() => computeOverdueList(), []);
  const list = useMemo(() => [...raw].sort((a, b) => b.overdueDays - a.overdueDays), [raw]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState('');
  const [filterDays, setFilterDays] = useState<'all' | '3+' | '7+'>('all');
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = list;
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      arr = arr.filter((x) =>
        x.umbrellaCode.toLowerCase().includes(kw) ||
        x.phoneLast4.includes(kw) ||
        x.lentStoreName.toLowerCase().includes(kw)
      );
    }
    if (filterDays === '3+') arr = arr.filter((x) => x.overdueDays >= 3);
    if (filterDays === '7+') arr = arr.filter((x) => x.overdueDays >= 7);
    return arr;
  }, [list, keyword, filterDays]);

  const severe = list.filter((x) => x.overdueDays >= 7).length;
  const medium = list.filter((x) => x.overdueDays >= 3 && x.overdueDays < 7).length;
  const remindedCount = list.filter((x) => x.reminded).length;

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
  function handleExport() {
    const header = ['雨伞编号', '顾客尾号', '借出门店', '预计归还门店', '借出时间', '应归还时间', '逾期天数', '是否已提醒'];
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

  return (
    <div className="space-y-6 animate-fadeInUp max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif-sc text-2xl font-bold text-slate-900">逾期提醒清单</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              借出超过 48 小时未归还 · 共 {list.length} 条记录
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download className="h-4 w-4" /> 导出 CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="逾期总数"
          value={list.length}
          hint="把雨伞，快行动起来"
          color="from-orange-500 to-orange-600"
          tone="orange"
        />
        <SummaryCard
          icon={<FileText className="h-5 w-5" />}
          label="严重逾期 (≥7天)"
          value={severe}
          hint="建议升级沟通方式"
          color="from-rose-500 to-rose-600"
          tone="rose"
        />
        <SummaryCard
          icon={<Bell className="h-5 w-5" />}
          label="已提醒顾客"
          value={remindedCount}
          hint={`剩余 ${list.length - remindedCount} 条待处理`}
          color="from-sky-500 to-sky-600"
          tone="sky"
        />
        <SummaryCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="中期逾期 (3~7天)"
          value={medium}
          hint="重点跟进对象"
          color="from-amber-500 to-amber-600"
          tone="amber"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索编号、顾客尾号、门店..."
              className="input-base pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">
            {(['all', '3+', '7+'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterDays(f)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  filterDays === f
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {f === 'all' ? '全部逾期' : f === '3+' ? '≥3天' : '≥7天'}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="btn-secondary !py-2 text-xs"
            >
              按逾期天数 <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={handleBatchRemind}
            disabled={selected.size === 0}
            className={clsx(
              'btn-primary !py-2 text-xs',
              selected.size === 0 && '!bg-slate-200 !text-slate-500 !shadow-none'
            )}
          >
            <Bell className="h-3.5 w-3.5" />
            标记已提醒 ({selected.size})
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-4 font-serif-sc text-lg font-semibold text-slate-800">
              太棒了，没有符合条件的逾期记录
            </p>
            <p className="mt-1 text-sm text-slate-500">所有雨伞都在按时归还中</p>
          </div>
        ) : (
          <>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">雨伞</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">顾客</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">门店</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">借出 / 应归还</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">逾期</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">状态</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((x, idx) => {
                  const sev = x.overdueDays >= 7 ? 'severe' : x.overdueDays >= 3 ? 'medium' : 'mild';
                  return (
                    <tr key={x.lendRecordId} className="hover:bg-slate-50/70 animate-fadeInUp" style={{ animationDelay: `${idx * 25}ms` }}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected.has(x.lendRecordId)}
                          onChange={() => toggle(x.lendRecordId)}
                          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={x.umbrellaPhoto}
                            alt=""
                            className="h-11 w-11 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-mono font-bold text-slate-900">{x.umbrellaCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="font-mono font-semibold text-slate-800">****{x.phoneLast4}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1 text-slate-700">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[160px]" title={x.lentStoreName}>{x.lentStoreName}</span>
                          </div>
                          <div className="text-slate-400 ml-4">→ {x.expectedStoreName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5 text-xs text-slate-600 font-mono">
                          <div>{formatDateTime(x.lendTime)}</div>
                          <div className="text-orange-600">→ {formatDateTime(x.dueTime)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={clsx(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold',
                          sev === 'severe' && 'bg-rose-100 text-rose-700',
                          sev === 'medium' && 'bg-orange-100 text-orange-700',
                          sev === 'mild' && 'bg-amber-100 text-amber-700'
                        )}>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {x.overdueDays} 天
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {x.reminded ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> 已提醒
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <Bell className="h-3 w-3" /> 待提醒
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex gap-1.5">
                          {!x.reminded && (
                            <button
                              onClick={() => markReminded(x.lendRecordId)}
                              className="rounded-md bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
                            >
                              标记已提醒
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500">
              <div>共 {filtered.length} 条记录 · 已选择 {selected.size} 条</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> 严重逾期 {severe}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500" /> 中期 {medium}
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
  hint,
  color,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  color: string;
  tone: 'orange' | 'rose' | 'sky' | 'amber';
}) {
  const toneMap = {
    orange: 'text-orange-600',
    rose: 'text-rose-600',
    sky: 'text-sky-600',
    amber: 'text-amber-600',
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 card-hover animate-fadeInUp">
      <div className={clsx('absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-10 blur-2xl', color)} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className={clsx('font-serif-sc text-4xl font-bold', toneMap[tone])}>{value}</div>
          </div>
          <div className="mt-2 text-xs text-slate-400">{hint}</div>
        </div>
        <div className={clsx('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
