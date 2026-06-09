import { NavLink } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  CalendarPlus,
  LogIn,
  Package,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "前台首页" },
  { to: "/appointment", icon: CalendarPlus, label: "预约登记" },
  { to: "/checkin", icon: LogIn, label: "签到签退" },
  { to: "/items", icon: Package, label: "物品登记" },
  { to: "/alerts", icon: AlertTriangle, label: "风险提醒" },
  { to: "/stats", icon: BarChart3, label: "统计报表" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <Building2 className="w-7 h-7 text-teal-400" />
        <h1 className="text-lg font-semibold tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          访客预约台
        </h1>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors border-l-4 ${
                isActive
                  ? "bg-teal-700/50 border-orange-400 text-white"
                  : "border-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 text-xs text-slate-500 border-t border-slate-700">
        © 2024 访客预约台
      </div>
    </aside>
  );
}
