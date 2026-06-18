import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Backpack,
  GitBranch,
  Luggage,
  RotateCcw,
  Fish,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/members', icon: Users, label: '成员管理' },
  { path: '/equipment', icon: Backpack, label: '装备档案' },
  { path: '/allocation', icon: GitBranch, label: '智能分配' },
  { path: '/packing', icon: Luggage, label: '打包清单' },
  { path: '/return', icon: RotateCcw, label: '归还检查' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-30">
      <div className="h-full glass-card border-r border-white/50 flex flex-col">
        <div className="p-6 border-b border-ocean-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center text-white shadow-lg">
              <Fish className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-ocean-800">
                潜水装备
              </h1>
              <p className="text-xs text-ocean-500">分配管理系统</p>
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
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg shadow-ocean-500/30'
                    : 'text-ocean-600 hover:bg-ocean-50 hover:text-ocean-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-ocean-100">
          <div className="glass-card-dark rounded-xl p-4">
            <p className="text-xs text-ocean-600 mb-2">🌊 海岛旅行</p>
            <p className="text-sm font-medium text-ocean-800">
              准备好出发了吗？
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
