import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Footprints,
  AlertTriangle,
  XCircle,
  BarChart3,
  Shield,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/config', icon: MapPin, label: '巡逻配置' },
  { path: '/patrol', icon: Footprints, label: '巡逻打卡' },
  { path: '/exceptions', icon: AlertTriangle, label: '异常事件' },
  { path: '/missed', icon: XCircle, label: '漏打卡' },
  { path: '/statistics', icon: BarChart3, label: '统计分析' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shadow-primary-700/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wide">夜间巡逻</h1>
            <p className="text-slate-500 text-xs">Night Patrol System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-700/80 to-primary-800/60 text-white shadow-lg shadow-primary-700/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <item.icon
              className={`w-5 h-5 transition-colors duration-200`}
            />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
            张
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">张建国</p>
            <p className="text-slate-500 text-xs">巡逻员</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
        </div>
      </div>
    </aside>
  );
}
