import { Bath, Plus, CalendarDays } from 'lucide-react';

interface HeaderProps {
  onAddTask: () => void;
}

export function Header({ onAddTask }: HeaderProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <header
      className="bg-cream-100/80 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-30"
      style={{ animation: 'fadeInUp 0.5s ease-out both' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal to-teal-600 flex items-center justify-center shadow-soft">
            <Bath className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-teal-700 tracking-tight">安心浴</h1>
            <p className="text-xs text-teal-300 -mt-0.5">老人助浴 · 有温度的记录</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-soft border border-cream-200">
            <CalendarDays className="w-4 h-4 text-teal-300" />
            <span className="text-sm text-teal-700 font-medium">{dateStr}</span>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white font-medium shadow-soft hover:shadow-card hover:bg-teal-600 active:translate-y-px transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>新增任务</span>
          </button>
        </div>
      </div>
    </header>
  );
}
