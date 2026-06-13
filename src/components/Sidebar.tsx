import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  MoonStar,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/beds', label: '床位管理', icon: BedDouble },
  { path: '/reservations', label: '预约管理', icon: CalendarDays },
  { path: '/check-in', label: '签到管理', icon: ClipboardCheck },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen glass-card flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-primary-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <MoonStar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-gray-800">午休床位</h1>
            <p className="text-xs text-gray-500">预约管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-100">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            💡 温馨提示：请每日完成床位消毒后及时更新状态，保障学生健康。
          </p>
        </div>
      </div>
    </aside>
  );
}
