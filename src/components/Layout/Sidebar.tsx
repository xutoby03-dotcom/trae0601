import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/', label: '领取看板', icon: LayoutDashboard },
  { path: '/materials', label: '物料管理', icon: Package },
  { path: '/members', label: '成员管理', icon: Users },
  { path: '/reports', label: '统计报告', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-dark-950/80 backdrop-blur-xl z-40">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-display">应援物管理</h1>
              <p className="text-xs text-gray-500">演唱会现场版</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/30 to-accent-600/20 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
              <div>
                <p className="text-sm font-medium text-white">系统运行中</p>
                <p className="text-xs text-gray-500">实时数据同步</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
