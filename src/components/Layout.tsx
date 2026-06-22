import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Lightbulb,
  ClipboardList,
  Theater,
} from 'lucide-react';

const navItems = [
  { to: '/equipment', label: '设备登记', icon: LayoutGrid },
  { to: '/calibration', label: '光学校准', icon: Lightbulb },
  { to: '/schedule', label: '光位切换表', icon: ClipboardList },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-ocher-800/95 backdrop-blur-sm border-r border-gold-300/20 flex flex-col">
        <div className="p-6 border-b border-gold-300/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-300 to-ocher-500 flex items-center justify-center shadow-lg">
              <Theater className="w-6 h-6 text-ocher-900" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-gold-200">皮影戏光影校准</h1>
              <p className="text-xs text-ocher-300">Shadow Puppetry Light Calibration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.8} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gold-300/20">
          <div className="paper-card !p-4 !bg-ocher-700/40 !border-gold-300/10">
            <p className="text-xs text-gold-200/70 leading-relaxed">
              💡 提示：灯光距幕布越远，影像边缘越易虚化，请在校准页详细记录各项参数。
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="min-h-screen p-8">{children}</div>
      </main>
    </div>
  );
}
