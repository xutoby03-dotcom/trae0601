import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
  Cat,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: '总览仪表盘', icon: LayoutDashboard },
  { to: '/litter-boxes', label: '猫砂盆档案', icon: Boxes },
  { to: '/records', label: '清洁记录', icon: ClipboardList },
  { to: '/stats', label: '统计报表', icon: BarChart3 },
  { to: '/settings', label: '设置', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  return (
    <aside
      className={cn(
        'w-64 shrink-0 h-full bg-gradient-to-b from-[#F5EBDC] to-[#F0DFCA] flex flex-col',
        className
      )}
    >
      <div className="p-6 border-b border-[#E8D8C4]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#A8C5A0] to-[#8BB583] flex items-center justify-center shadow-md">
            <Cat size={24} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#5C4A3A]" style={{ fontFamily: "'LXGW WenKai', system-ui, serif" }}>
              猫砂盆管家
            </h1>
            <p className="text-xs text-[#8B7A6A]">Litter Box Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white shadow-md text-[#5C4A3A] scale-[1.02]'
                    : 'text-[#8B7A6A] hover:bg-white/50 hover:text-[#5C4A3A]'
                )
              }
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/40 border border-white/60">
        <p className="text-xs text-[#8B7A6A] mb-1">🐾 小贴士</p>
        <p className="text-xs text-[#6B5A4A] leading-relaxed">
          定期清洁猫砂盆，不仅让猫咪更健康，也能减少家庭异味哦！
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
