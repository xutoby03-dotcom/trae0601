import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '首页看板', icon: LayoutDashboard },
  { to: '/rooms', label: '会议室管理', icon: Building2 },
  { to: '/inspection', label: '巡检中心', icon: ClipboardCheck },
  { to: '/report', label: '故障报修', icon: AlertTriangle },
  { to: '/tickets', label: '维修工单', icon: Wrench },
  { to: '/stats', label: '数据统计', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-emerald-400" />
          巡检台
        </h1>
        <p className="text-xs text-slate-400 mt-1">会议室设备管理系统</p>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
            管
          </div>
          <div>
            <p className="text-sm font-medium">管理员</p>
            <p className="text-xs text-slate-400">admin@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
