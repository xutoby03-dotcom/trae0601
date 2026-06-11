import { NavLink, useLocation } from "react-router-dom";
import { Monitor, CalendarPlus, AlertTriangle, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "会议室", icon: Monitor, exact: true },
  { path: "/booking", label: "预约登记", icon: CalendarPlus },
  { path: "/faults", label: "故障管理", icon: AlertTriangle },
  { path: "/stats", label: "数据统计", icon: BarChart3 },
  { path: "/rooms-manage", label: "会议室管理", icon: Settings },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="glass sticky top-0 z-40 border-b border-gray-200/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-soft">
              <Monitor size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">投屏登记</h1>
              <p className="text-xs text-gray-500 -mt-1">会议室投屏管理系统</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary-500 text-white shadow-soft"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
