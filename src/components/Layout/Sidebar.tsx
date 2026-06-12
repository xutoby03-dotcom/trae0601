import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardList, TrendingUp, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "仪表盘", icon: LayoutDashboard },
  { path: "/profiles", label: "老人档案", icon: Users },
  { path: "/records", label: "血压记录", icon: ClipboardList },
  { path: "/trends", label: "趋势分析", icon: TrendingUp },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0",
        className
      )}
    >
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-gray-900">血压复测台</h1>
            <p className="text-xs text-gray-500">健康守护，家人安心</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50">
          <p className="text-sm font-medium text-primary-800">温馨提示</p>
          <p className="text-xs text-primary-600 mt-1">
            早晚各测一次血压，异常记得30分钟内复测哦
          </p>
        </div>
      </div>
    </aside>
  );
}
