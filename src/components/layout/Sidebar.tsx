import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, MapPin, Users, FileText, Calculator, Tent } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/vehicles', label: '车辆档案', icon: Car },
  { to: '/itinerary', label: '行程规划', icon: MapPin },
  { to: '/allocation', label: '人员装备', icon: Users },
  { to: '/records', label: '路上记录', icon: FileText },
  { to: '/settlement', label: '费用结算', icon: Calculator },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-forest-700 to-forest-800 text-white min-h-screen flex flex-col shadow-lifted">
      <div className="p-6 border-b border-forest-600/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warm-500 rounded-xl flex items-center justify-center shadow-soft">
            <Tent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold">车队露营</h1>
            <p className="text-xs text-forest-200">Fleet Camping Planner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-warm-500 text-white shadow-soft'
                      : 'text-forest-100 hover:bg-forest-600/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-forest-600/50">
        <div className="bg-forest-900/50 rounded-xl p-4">
          <p className="text-xs text-forest-200 mb-1">当前行程</p>
          <p className="font-medium text-sm">坝上草原三日露营</p>
          <p className="text-xs text-forest-300 mt-1">2026年6月20日 - 22日</p>
        </div>
      </div>
    </aside>
  );
}
