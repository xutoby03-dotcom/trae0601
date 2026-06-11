import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Clock, Package, CheckCircle2, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTicketStore } from '@/store/useTicketStore';
import type { TicketStatus } from '@/types';
import { STATUS_LABEL, STATUS_COLOR } from '@/types';
import { formatDateTime } from '@/utils/format';

const columns: { key: TicketStatus; label: string; icon: typeof Clock }[] = [
  { key: 'pending', label: '待接单', icon: Clock },
  { key: 'processing', label: '处理中', icon: Wrench },
  { key: 'waiting_parts', label: '等配件', icon: Package },
  { key: 'completed', label: '已完成', icon: CheckCircle2 },
];

export default function Workbench() {
  const { tickets, assignWorker, updateTicketStatus, currentUserName } = useTicketStore();
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const g: Record<TicketStatus, typeof tickets> = {
      pending: [],
      processing: [],
      waiting_parts: [],
      completed: [],
    };
    const sorted = [...tickets].sort((a, b) => {
      if (a.urgency !== b.urgency) return a.urgency === 'urgent' ? -1 : 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    sorted.forEach((t) => g[t.status].push(t));
    return g;
  }, [tickets]);

  const handleQuickAction = (ticketId: string, from: TicketStatus) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const worker = ticket.assignedWorker || currentUserName || '张师傅';
    if (from === 'pending') {
      assignWorker(ticketId, worker);
      updateTicketStatus(ticketId, 'processing', worker);
    } else if (from === 'processing') {
      updateTicketStatus(ticketId, 'completed', worker);
    } else if (from === 'waiting_parts') {
      updateTicketStatus(ticketId, 'processing', worker);
    }
  };

  return (
    <div className="min-h-screen grain-bg">
      <div className="container py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-ink-500 mb-1">维修工作台</h1>
          <p className="text-ink-300 text-sm">点击卡片查看详情，或使用快捷按钮流转状态</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const Icon = col.icon;
            const items = grouped[col.key];
            const color = STATUS_COLOR[col.key];
            return (
              <div key={col.key} className="bg-white/60 backdrop-blur rounded-2xl border border-teal-600/8 p-4 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color.text}`} />
                    </div>
                    <span className="font-semibold text-ink-500">{col.label}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color.bg} ${color.text} border ${color.border}`}>
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                  {items.length === 0 && (
                    <div className="text-center py-8 text-ink-200 text-sm">暂无工单</div>
                  )}
                  {items.map((t) => (
                    <div
                      key={t.id}
                      className="group bg-white rounded-xl border border-teal-600/8 p-3 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer"
                      onClick={() => navigate(`/ticket/${t.id}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-semibold text-sm text-ink-500 truncate">{t.faultType}</span>
                        {t.urgency === 'urgent' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 flex-shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            紧急
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ink-300 mb-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{t.building} {t.room} · {t.studentName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-ink-200">{formatDateTime(t.createdAt)}</span>
                        {t.assignedWorker && (
                          <span className="text-[10px] text-teal-600 font-medium">{t.assignedWorker}</span>
                        )}
                      </div>
                      {t.status !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction(t.id, t.status);
                          }}
                          className={`mt-2.5 w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                            t.status === 'pending'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                              : t.status === 'processing'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
                          }`}
                        >
                          {t.status === 'pending' ? '接单处理' : t.status === 'processing' ? '标记完成' : '继续处理'}
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
