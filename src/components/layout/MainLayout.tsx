import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const titleMap: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '综合看板', subtitle: '快速掌握小区宠物免疫合规情况' },
  '/pets': { title: '宠物档案', subtitle: '管理所有住户的宠物信息' },
  '/vaccines': { title: '疫苗记录', subtitle: '完整的接种历史与证明资料' },
};

export function MainLayout() {
  const loc = useLocation();
  const key = loc.pathname.startsWith('/pets/') ? '/pets' : loc.pathname;
  const meta = titleMap[key] ?? titleMap['/'];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 font-sans antialiased">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/70 px-8 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{meta.title}</h2>
            <p className="text-xs text-slate-500">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            数据实时同步 · LocalStorage
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
