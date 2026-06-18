import { Bell, Search } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const tasks = useAppStore((state) => state.tasks);
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索会议室..."
            className="pl-10 pr-4 py-2 rounded-lg bg-slate-50 border-0 text-sm w-64 focus:outline-none focus:bg-slate-100 transition-colors"
          />
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {pendingTasks > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {pendingTasks}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
