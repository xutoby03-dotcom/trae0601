import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  CheckSquare,
  BarChart3,
  HeartHandshake,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/elders', icon: Users, label: '老人档案' },
  { to: '/courses', icon: BookOpen, label: '课程管理' },
  { to: '/registrations', icon: ClipboardList, label: '报名管理' },
  { to: '/attendance', icon: CheckSquare, label: '签到记录' },
  { to: '/statistics', icon: BarChart3, label: '数据统计' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white">
            <HeartHandshake size={22} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-neutral-800">银龄学苑</h1>
            <p className="text-xs text-neutral-500">手机教学管理系统</p>
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
              `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-100">
        <div className="bg-warm-50 rounded-xl p-4">
          <p className="text-sm text-neutral-600 mb-2">今日课程</p>
          <p className="text-2xl font-bold text-primary-600">2 节</p>
          <p className="text-xs text-neutral-500 mt-1">继续加油哦~</p>
        </div>
      </div>
    </aside>
  );
}
