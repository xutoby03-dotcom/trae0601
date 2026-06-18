import { Bell, Search, Leaf } from 'lucide-react';
import { useAppStore } from '../store';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const unresolvedCount = useAppStore((s) => s.alerts.filter((a) => !a.resolved).length);

  return (
    <header className="sticky top-0 z-20 bg-surface-bg/85 backdrop-blur-md border-b border-surface-border">
      <div className="px-8 py-5 flex items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-brand-800 tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-brand-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-surface-border shadow-sm w-64">
            <Search className="w-4 h-4 text-brand-400" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="搜索房间、型号、批次..."
              className="flex-1 text-sm bg-transparent outline-none text-brand-700 placeholder:text-brand-300"
            />
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-air-excellent/10 text-air-excellent">
            <Leaf className="w-4 h-4" strokeWidth={2.2} fill="currentColor" />
            <span className="text-xs font-bold">全屋空气良好</span>
          </div>

          <button className="relative w-11 h-11 rounded-xl bg-white border border-surface-border shadow-sm flex items-center justify-center hover:bg-brand-50 transition-colors">
            <Bell className="w-5 h-5 text-brand-600" strokeWidth={1.8} />
            {unresolvedCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-danger-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
                {unresolvedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
