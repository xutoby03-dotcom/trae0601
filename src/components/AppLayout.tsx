import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import {
  Disc3,
  Gauge,
  Headphones,
  BarChart3,
  Home,
  Disc,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const navItems = [
  { to: '/', icon: Home, label: '仪表盘' },
  { to: '/equipment', icon: Disc3, label: '设备台账' },
  { to: '/calibration', icon: Gauge, label: '校准记录' },
  { to: '/listening', icon: Headphones, label: '试听记录' },
  { to: '/analysis', icon: BarChart3, label: '数据分析' },
];

export default function AppLayout() {
  const equipments = useAppStore((s) => s.equipments);
  const calibrations = useAppStore((s) => s.calibrations);
  const listeningTests = useAppStore((s) => s.listeningTests);
  const generateAlerts = useAppStore((s) => s.generateAlerts);
  const location = useLocation();

  const { dangerCount, warningCount } = useMemo(() => {
    const alerts = generateAlerts();
    return {
      dangerCount: alerts.filter((a) => a.severity === 'danger').length,
      warningCount: alerts.filter((a) => a.severity === 'warning').length,
    };
  }, [equipments, calibrations, listeningTests, generateAlerts]);

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 bg-oak-800 text-oak-100 min-h-screen sticky top-0 flex flex-col">
        <div className="p-6 border-b border-oak-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brass-400 to-brass-600 flex items-center justify-center shadow-vinyl">
              <Disc className="w-7 h-7 text-oak-800" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-brass-200">黑胶试听室</h1>
              <p className="text-xs text-oak-300 mt-0.5">针压校准台账系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.to === '/' && (dangerCount > 0 || warningCount > 0) && (
                <span className="ml-auto flex gap-1">
                  {dangerCount > 0 && (
                    <span className="badge badge-danger !py-0.5">{dangerCount}</span>
                  )}
                  {warningCount > 0 && (
                    <span className="badge badge-warning !py-0.5">{warningCount}</span>
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-oak-700/50">
          <div className="p-3 rounded-xl bg-oak-700/50 border border-oak-600/30">
            <p className="text-xs text-oak-300 mb-2">当前告警</p>
            <div className="flex gap-2">
              <div className="flex-1 text-center py-2 rounded-lg bg-red-500/20">
                <p className="text-lg font-bold text-red-300">{dangerCount}</p>
                <p className="text-[10px] text-red-200/80">严重</p>
              </div>
              <div className="flex-1 text-center py-2 rounded-lg bg-amber-500/20">
                <p className="text-lg font-bold text-amber-300">{warningCount}</p>
                <p className="text-[10px] text-amber-200/80">注意</p>
              </div>
              <div className="flex-1 text-center py-2 rounded-lg bg-forest-500/20">
                <p className="text-lg font-bold text-forest-300">{equipments.length}</p>
                <p className="text-[10px] text-forest-200/80">设备</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white/70 backdrop-blur-md border-b border-oak-100 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-oak-800">
                {navItems.find((n) => {
                  if (n.to === '/') return location.pathname === '/';
                  return location.pathname.startsWith(n.to);
                })?.label || ''}
              </h2>
              <p className="text-sm text-ink-400 mt-0.5">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-oak-50 border border-oak-100">
                <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse-slow" />
                <span className="text-sm text-oak-700">系统运行正常</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
