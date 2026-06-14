import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Coffee, BarChart3, Leaf } from 'lucide-react';

const menuItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/batches', label: '批次管理', icon: Package },
  { to: '/jars', label: '封罐管理', icon: Coffee },
  { to: '/statistics', label: '数据统计', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-gradient-to-b from-teaGreen-600 to-teaGreen-800 min-h-screen flex flex-col shadow-xl">
      <div className="px-6 py-6 border-b border-teaGreen-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amberGold-500 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-white">茶韵管理</h1>
            <p className="text-teaGreen-200 text-xs">散装茶叶封罐系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-teaGreen-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-teaGreen-500/30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-tea-200 flex items-center justify-center">
            <span className="text-teaGreen-700 font-semibold text-sm">店</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">张店长</p>
            <p className="text-teaGreen-300 text-xs">管理员</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
