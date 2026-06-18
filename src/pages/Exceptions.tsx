import { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle,
  Package,
  Filter,
  Search,
  User,
  FileWarning,
  Clock,
  CheckCircle2,
} from 'lucide-react';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useExceptionStore } from '@/store/exceptionStore';
import { cn, formatDateTime } from '@/utils';
import { EXCEPTION_TYPE_LABEL } from '@/types';
import type { ExceptionType } from '@/types';

const TYPE_FILTERS: Array<{ key: ExceptionType | 'all'; label: string; color: string }> = [
  { key: 'all', label: '全部', color: 'indigo' },
  { key: 'damaged', label: '包裹破损', color: 'red' },
  { key: 'wrong_pickup', label: '错拿包裹', color: 'amber' },
  { key: 'unclaimed', label: '无人认领', color: 'slate' },
];

const typeColor: Record<ExceptionType, 'critical' | 'warning' | 'slate'> = {
  damaged: 'critical',
  wrong_pickup: 'warning',
  unclaimed: 'slate',
};

export default function ExceptionsPage() {
  const [activeType, setActiveType] = useState<ExceptionType | 'all'>('all');
  const [search, setSearch] = useState('');

  const records = useExceptionStore((s) => s.records);
  const stats = useMemo(() => useExceptionStore.getState().getStats(), [records]);
  const list = useMemo(() => useExceptionStore.getState().getExceptionList(), [records]);

  const filtered = list.filter((r) => {
    const typeOk = activeType === 'all' || r.type === activeType;
    if (!typeOk) return false;
    if (!search.trim()) return true;
    const kw = search.toLowerCase();
    return (
      r.recipientName.toLowerCase().includes(kw) ||
      r.handler.toLowerCase().includes(kw) ||
      r.description.toLowerCase().includes(kw) ||
      r.slotLabel.toLowerCase().includes(kw)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-orange-500" />
          异常记录
        </h1>
        <p className="text-sm text-slate-500 mt-1">查看所有包裹异常处理记录，共 {stats.total} 条</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="异常总数"
          value={stats.total}
          gradient="from-slate-600 to-slate-800"
          icon={<FileWarning className="w-5 h-5 text-white" />}
        />
        <StatCard
          label="包裹破损"
          value={stats.damaged}
          gradient="from-red-500 to-rose-600"
          icon={<Package className="w-5 h-5 text-white" />}
        />
        <StatCard
          label="错拿包裹"
          value={stats.wrongPickup}
          gradient="from-amber-500 to-orange-600"
          icon={<AlertTriangle className="w-5 h-5 text-white" />}
        />
        <StatCard
          label="无人认领"
          value={stats.unclaimed}
          gradient="from-slate-500 to-zinc-700"
          icon={<User className="w-5 h-5 text-white" />}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm flex-wrap gap-1">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all',
                activeType === t.key
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all"
            placeholder="搜索收件人/处理人/描述"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="py-20 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-700">暂无异常记录</h3>
            <p className="text-sm text-slate-500 mt-1">所有包裹状态正常，继续保持 👍</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <Card key={r.id} className="group hover:-translate-y-0.5 transition-transform duration-200">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                      r.type === 'damaged' && 'bg-gradient-to-br from-red-500 to-rose-600 text-white',
                      r.type === 'wrong_pickup' && 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
                      r.type === 'unclaimed' && 'bg-gradient-to-br from-slate-500 to-zinc-700 text-white',
                    )}>
                      {r.type === 'damaged' && <Package className="w-5 h-5" />}
                      {r.type === 'wrong_pickup' && <AlertTriangle className="w-5 h-5" />}
                      {r.type === 'unclaimed' && <User className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-800 text-base">{r.recipientName}</span>
                        <Badge variant={typeColor[r.type]} size="sm">
                          {EXCEPTION_TYPE_LABEL[r.type]}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDateTime(r.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">📍 {r.slotLabel}</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-1.5">情况描述</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{r.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {r.handler.charAt(0)}
                    </div>
                    <span>处理人：<strong className="text-slate-700">{r.handler}</strong></span>
                  </div>
                  <Button size="sm" variant="ghost">查看详情</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  gradient,
  icon,
}: {
  label: string;
  value: number;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-5 text-white shadow-lg',
      `bg-gradient-to-br ${gradient}`,
    )}>
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-10 bottom-0 w-32 h-32 rounded-full bg-white/5" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-90">{label}</div>
          <div className="mt-1.5 text-3xl font-black tracking-tight">{value}</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
