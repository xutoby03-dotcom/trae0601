import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wind, ClipboardList, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '首页概览', icon: LayoutDashboard },
  { to: '/air-conditioners', label: '空调档案', icon: Wind },
  { to: '/cleaning-records', label: '清洗记录', icon: ClipboardList },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-primary-600 to-primary-800 min-h-screen text-white shadow-xl flex flex-col">
      <div className="p-6 border-b border-primary-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Snowflake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">空调清洗管家</h1>
            <p className="text-xs text-primary-200">滤网管理助手</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                isActive
                  ? 'bg-white text-primary-600 shadow-lg shadow-black/10'
                  : 'text-primary-100 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon
              className={cn(
                'w-5 h-5 transition-transform duration-300',
                'group-hover:scale-110'
              )}
            />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-500/30">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-xs text-primary-200 mb-1">💡 温馨提示</p>
          <p className="text-sm text-white">
            定期清洗空调滤网，<br />
            让家人呼吸更清新的空气
          </p>
        </div>
      </div>
    </aside>
  );
}
