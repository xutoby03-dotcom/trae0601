import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import { Bell, Search, Store } from 'lucide-react';
import { useMemo } from 'react';
import { computeOverdueList } from '@/utils/statsUtils';

export default function MainLayout() {
  const { stores, currentStoreId, setCurrentStoreId } = useUmbrellaStore();
  const overdueCount = useMemo(() => computeOverdueList().length, []);

  return (
    <div className="flex h-full w-full bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-8">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索雨伞编号、顾客尾号..."
              className="input-base pl-9 pr-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-slate-500" />
            <select
              value={currentStoreId}
              onChange={(e) => setCurrentStoreId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button className="relative btn-ghost !p-2">
            <Bell className="h-5 w-5" />
            {overdueCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {overdueCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-semibold text-white">
              店
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-slate-800">店员·李明</div>
              <div className="text-[11px] text-slate-500">店长权限</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto scrollbar-thin animate-fadeIn">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
