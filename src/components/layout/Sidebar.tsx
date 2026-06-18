import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
  MessageSquareWarning,
  Wrench,
  BarChart3,
  Zap,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

const MENU_ITEMS = [
  {
    group: "概览",
    items: [
      { to: "/", label: "总览看板", icon: LayoutDashboard },
    ],
  },
  {
    group: "设备管理",
    items: [
      { to: "/stations", label: "桩位档案", icon: MapPin },
    ],
  },
  {
    group: "运营管理",
    items: [
      { to: "/inspections/tasks", label: "巡检管理", icon: ClipboardCheck },
      { to: "/repairs/tickets", label: "报修中心", icon: MessageSquareWarning },
      { to: "/maintenance/faults", label: "维修记录", icon: Wrench },
    ],
  },
  {
    group: "数据分析",
    items: [
      { to: "/statistics/fault-rate", label: "数据统计", icon: BarChart3 },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      className={clsx(
        "h-screen bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 text-slate-100 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-60"
      )}
    >
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0">
          <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-display font-bold text-lg text-white tracking-wide">
              充电桩巡检
            </div>
            <div className="text-xs text-primary-300 truncate">
              Charging Station Ops
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
        {MENU_ITEMS.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-primary-400/70 font-semibold">
                {group.group}
              </div>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={clsx(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-primary-500/30 to-primary-500/10 text-white shadow-inner border border-primary-400/20"
                          : "text-primary-200/80 hover:text-white hover:bg-white/5"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={clsx(
                          "w-5 h-5 shrink-0 transition-colors",
                          active ? "text-primary-300" : "text-primary-300/60 group-hover:text-primary-200"
                        )}
                        strokeWidth={active ? 2.3 : 2}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {item.label}
                          </span>
                          {active && (
                            <ChevronRight className="w-4 h-4 text-primary-300" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="rounded-xl bg-white/5 backdrop-blur p-4 border border-white/10">
            <div className="flex items-center gap-2 text-sm font-medium text-white mb-1">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse-soft" />
              系统运行正常
            </div>
            <div className="text-xs text-primary-300/70">
              上次数据同步：刚刚
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
