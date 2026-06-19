import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, BellRing } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 ${
              isActive ? 'text-brand-500' : 'text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-brand-50 scale-110' : ''}`}>
                <LayoutDashboard className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[11px] font-medium ${isActive ? 'font-semibold' : ''}`}>仪表盘</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/devices"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 ${
              isActive ? 'text-brand-500' : 'text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-brand-50 scale-110' : ''}`}>
                <ShieldAlert className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[11px] font-medium ${isActive ? 'font-semibold' : ''}`}>设备</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 ${
              isActive ? 'text-brand-500' : 'text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative ${isActive ? 'bg-brand-50 scale-110' : ''}`}>
                <BellRing className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
              </div>
              <span className={`text-[11px] font-medium ${isActive ? 'font-semibold' : ''}`}>告警</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
