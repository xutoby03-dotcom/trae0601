import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ChefHat,
  ScanQrCode,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '工作台' },
  { path: '/students', icon: Users, label: '学生档案' },
  { path: '/menu', icon: UtensilsCrossed, label: '菜单管理' },
  { path: '/prep', icon: ChefHat, label: '后厨备餐' },
  { path: '/pickup', icon: ScanQrCode, label: '领取登记' },
  { path: '/statistics', icon: BarChart3, label: '数据统计' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-danger-500 to-warning-500 flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">过敏餐管理</h1>
            <p className="text-[10px] text-slate-400">校园食品安全系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-info-500 flex items-center justify-center text-xs font-bold">
              管
            </div>
            <div>
              <p className="text-sm font-medium">管理员</p>
              <p className="text-[10px] text-slate-400">后勤管理处</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
