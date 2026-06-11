import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, ArrowLeft, FileWarning, CheckCircle2, XCircle, Loader2,
  MapPin, User, FileText, Clock, Check, X, Search, Filter,
} from 'lucide-react';
import { useAppStore } from '../store/useStore';
import type { Dispute, Seat } from '../types';
import { apiClient } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { timeAgo, formatDateTime } from '../utils/time';
import { cn } from '../lib/utils';

type FilterStatus = 'all' | 'pending' | 'resolved' | 'rejected';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAdmin, loadSeats, loadDisputes } = useAppStore();
  const [disputes, setDisputes] = useState<Array<Dispute & { seat?: Seat }>>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const loadedRef = useRef(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    if (!loadedRef.current) {
      loadedRef.current = true;
      fetchDisputes();
    }
  }, [isAdmin, navigate]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listDisputes();
      setDisputes(data);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, action: 'recover' | 'reject') => {
    setResolving(id);
    try {
      await apiClient.resolveDispute(id, action);
      showToast(action === 'recover' ? '已确认占座，座位已恢复' : '已驳回该反馈');
      await fetchDisputes();
      loadSeats();
      loadDisputes();
    } finally {
      setResolving(null);
    }
  };

  const filtered = disputes.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (!search.trim()) return true;
    const kw = search.trim().toLowerCase();
    const seatMatch = d.seat
      ? `${d.seat.building}${d.seat.room}${d.seat.seatNumber}`.toLowerCase().includes(kw)
      : false;
    const reporterMatch = d.reporterName.toLowerCase().includes(kw);
    return seatMatch || reporterMatch;
  });

  const counts = {
    all: disputes.length,
    pending: disputes.filter((d) => d.status === 'pending').length,
    resolved: disputes.filter((d) => d.status === 'resolved').length,
    rejected: disputes.filter((d) => d.status === 'rejected').length,
  };

  const filterTabs: { key: FilterStatus; label: string; count: number; color: string }[] = [
    { key: 'all', label: '全部', count: counts.all, color: 'text-slate-700' },
    { key: 'pending', label: '待处理', count: counts.pending, color: 'text-amber-700' },
    { key: 'resolved', label: '已恢复', count: counts.resolved, color: 'text-emerald-700' },
    { key: 'rejected', label: '已驳回', count: counts.rejected, color: 'text-slate-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 py-6 md:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-6">
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">管理员工作台</h1>
                  <p className="text-slate-300 text-sm">处理争议反馈，维护自习室正常秩序</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="text-center bg-white/10 rounded-2xl px-4 py-3 backdrop-blur">
                  <div className="text-2xl font-bold">{counts.pending}</div>
                  <div className="text-xs text-amber-300 font-medium">待处理</div>
                </div>
                <div className="text-center bg-white/10 rounded-2xl px-4 py-3 backdrop-blur">
                  <div className="text-2xl font-bold">{counts.resolved}</div>
                  <div className="text-xs text-emerald-300 font-medium">已恢复</div>
                </div>
                <div className="text-center bg-white/10 rounded-2xl px-4 py-3 backdrop-blur">
                  <div className="text-2xl font-bold">{counts.rejected}</div>
                  <div className="text-xs text-slate-300 font-medium">已驳回</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索座位位置、举报人..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
              <button
                onClick={fetchDisputes}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition"
              >
                <Filter className="w-4 h-4" />
                刷新
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
                    filter === t.key
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <span>{t.label}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    filter === t.key ? 'bg-white/20' : t.color + ' bg-slate-200',
                  )}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <p className="mt-4 text-slate-500 text-sm">加载争议列表中...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                  <FileWarning className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-600 font-semibold text-lg mb-1">暂无争议反馈</p>
                <p className="text-slate-500 text-sm">当有同学提交占座反馈时，会显示在这里</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((d) => (
                  <DisputeCard
                    key={d.id}
                    dispute={d}
                    resolving={resolving === d.id}
                    onResolve={handleResolve}
                    onGoSeat={(sid) => navigate(`/seat/${sid}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function DisputeCard({
  dispute,
  resolving,
  onResolve,
  onGoSeat,
}: {
  dispute: Dispute & { seat?: Seat };
  resolving: boolean;
  onResolve: (id: string, action: 'recover' | 'reject') => void;
  onGoSeat: (seatId: string) => void;
}) {
  const isPending = dispute.status === 'pending';
  return (
    <div className={cn(
      'rounded-2xl p-5 border-2 transition-all',
      isPending
        ? 'bg-amber-50/50 border-amber-200'
        : dispute.status === 'resolved'
        ? 'bg-emerald-50/50 border-emerald-200'
        : 'bg-slate-50 border-slate-200',
    )}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <button
              onClick={() => onGoSeat(dispute.seatId)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition group"
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-slate-800 group-hover:text-teal-700">
                {dispute.seat
                  ? `${dispute.seat.building} ${dispute.seat.room} 座位${dispute.seat.seatNumber}`
                  : `座位 #${dispute.seatId.slice(0, 6)}`}
              </span>
            </button>
            {dispute.seat && <StatusBadge status={dispute.seat.status} size="sm" />}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(dispute.createdAt)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-slate-100">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">举报人</p>
                <p className="font-semibold text-slate-800">{dispute.reporterName}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">提交时间</p>
                <p className="font-semibold text-slate-800 text-sm">{formatDateTime(dispute.createdAt)}</p>
              </div>
            </div>
          </div>

          {dispute.remark && (
            <div className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-slate-100 mb-3">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 mb-1">情况说明</p>
                <p className="text-slate-700 text-sm leading-relaxed">{dispute.remark}</p>
              </div>
            </div>
          )}

          {dispute.photoUrl && (
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">现场照片</p>
              <img
                src={dispute.photoUrl}
                alt="证据照片"
                className="max-h-40 rounded-lg object-cover border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {!isPending && (
            <div className={cn(
              'mt-3 rounded-xl p-3 border flex items-start gap-2.5',
              dispute.status === 'resolved'
                ? 'bg-emerald-100/50 border-emerald-200'
                : 'bg-slate-100 border-slate-200',
            )}>
              {dispute.status === 'resolved' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider mb-0.5">
                  {dispute.status === 'resolved' ? (
                    <span className="text-emerald-700">已处理：确认占座并恢复座位</span>
                  ) : (
                    <span className="text-slate-600">已处理：驳回反馈</span>
                  )}
                </p>
                {dispute.resolverNote && (
                  <p className="text-sm text-slate-700">管理员备注：{dispute.resolverNote}</p>
                )}
                {dispute.resolvedAt && (
                  <p className="text-xs text-slate-500 mt-1">{formatDateTime(dispute.resolvedAt)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {isPending && (
          <div className="flex lg:flex-col gap-2 lg:gap-3 shrink-0">
            <button
              onClick={() => onResolve(dispute.id, 'recover')}
              disabled={resolving}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px]"
            >
              {resolving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              确认占座，恢复座位
            </button>
            <button
              onClick={() => onResolve(dispute.id, 'reject')}
              disabled={resolving}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 transition disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px]"
            >
              <X className="w-4 h-4" />
              驳回反馈
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
