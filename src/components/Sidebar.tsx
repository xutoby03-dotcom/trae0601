import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Bike,
  ClipboardList,
  AlertTriangle,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/", label: "数据看板", icon: LayoutDashboard },
  { to: "/areas", label: "区域管理", icon: MapPin },
  { to: "/vehicles", label: "车辆管理", icon: Bike },
  { to: "/patrols", label: "巡查记录", icon: ClipboardList },
  { to: "/disposals", label: "处理清单", icon: AlertTriangle },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-primary-600 text-white flex flex-col sticky top-0">
      <div className="px-6 py-6 border-b border-primary-500/30">
        <h1 className="text-lg font-bold tracking-wide">🚲 车棚管理系统</h1>
        <p className="text-xs text-primary-200 mt-1">社区公共车棚智能管理平台</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-primary-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary-400 flex items-center justify-center text-sm font-semibold">
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">系统管理员</p>
            <p className="text-xs text-primary-200 truncate">admin@community.cn</p>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary-700/60 hover:bg-primary-700 text-xs text-primary-100 transition-colors">
          <LogOut size={14} />
          退出登录
        </button>
      </div>
    </aside>
  );
}
