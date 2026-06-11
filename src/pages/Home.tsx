import { Link } from 'react-router-dom';
import { Plus, ClipboardList, AlertTriangle, Wrench, CheckCircle2, Clock } from 'lucide-react';
import { useTicketStore } from '@/store/useTicketStore';
import TicketCard from '@/components/TicketCard';
import type { TicketStatus } from '@/types';
import { useState } from 'react';

const filters: { key: 'all' | TicketStatus; label: string; icon: typeof Clock }[] = [
  { key: 'all', label: '全部', icon: ClipboardList },
  { key: 'pending', label: '待接单', icon: Clock },
  { key: 'processing', label: '处理中', icon: Wrench },
  { key: 'waiting_parts', label: '等配件', icon: AlertTriangle },
  { key: 'completed', label: '已完成', icon: CheckCircle2 },
];

export default function Home() {
  const { tickets, currentUserName, role } = useTicketStore();
  const [activeFilter, setActiveFilter] = useState<'all' | TicketStatus>('all');

  const filtered = tickets
    .filter((t) => activeFilter === 'all' || t.status === activeFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const counts = {
    all: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    processing: tickets.filter((t) => t.status === 'processing').length,
    waiting_parts: tickets.filter((t) => t.status === 'waiting_parts').length,
    completed: tickets.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="min-h-screen grain-bg">
      <div className="container py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-ink-500 mb-1">你好，{currentUserName}</h1>
          <p className="text-ink-300 text-sm">
            {role === 'student' ? '提交宿舍报修，随时查看维修进度' : '选择角色以查看对应界面'}
          </p>
        </div>

        {role === 'student' && (
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-card hover:shadow-cardHover hover:translate-y-[-1px] transition-all mb-8"
          >
            <Plus className="w-5 h-5" />
            新建报修单
          </Link>
        )}

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {filters.map((f) => {
          const Icon = f.icon;
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-teal-600 text-white shadow-card'
                  : 'bg-white text-ink-400 hover:text-teal-700 border border-teal-600/10 hover:bg-teal-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {f.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-cream-100 text-ink-300'
                }`}
              >
                {counts[f.key]}
              </span>
            </button>
          );
        })}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-teal-600/20 p-16 text-center">
            <ClipboardList className="w-12 h-12 text-ink-200 mx-auto mb-3" />
            <p className="text-ink-400 font-medium">暂无工单</p>
            {role === 'student' && (
              <p className="text-sm text-ink-200 mt-1">点击上方按钮提交第一份报修单</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((t) => (
              <TicketCard key={t.id} ticket={t} showQueue />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
