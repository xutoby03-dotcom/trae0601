import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, Package, ClipboardList, BarChart3, Tent } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '看板' },
  { path: '/plan', icon: MapPin, label: '计划' },
  { path: '/equipment', icon: Package, label: '装备' },
  { path: '/checklist', icon: ClipboardList, label: '清单' },
  { path: '/statistics', icon: BarChart3, label: '统计' },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-cream-100/85 backdrop-blur-md border-b border-cream-200/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-softer">
              <Tent size={22} />
            </div>
            <div>
              <div className="font-display text-2xl text-forest-700 leading-none">露营分包</div>
              <div className="text-xs text-bark-500/50 -mt-0.5">Camping Checklist</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                    isActive
                      ? 'bg-forest-600 text-white shadow-softer'
                      : 'text-bark-500/70 hover:bg-cream-200'
                  }`
                }
              >
                <item.icon size={20} />
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
