import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Shirt, QrCode, ClipboardList, Music } from "lucide-react";

const navItems = [
  { to: "/", label: "仪表板", icon: LayoutDashboard },
  { to: "/students", label: "学生档案", icon: Users },
  { to: "/inventory", label: "服装库存", icon: Shirt },
  { to: "/distribute", label: "发放中心", icon: QrCode },
  { to: "/records", label: "流程记录", icon: ClipboardList },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/60 h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-slate-900">合唱服装</h1>
            <p className="text-xs text-slate-500">尺码管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              isActive ? "sidebar-link-active" : "sidebar-link"
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 p-4">
          <p className="text-sm font-semibold text-primary-700">温馨提示</p>
          <p className="text-xs text-slate-600 mt-1">
            发放服装前请核对学生身高体重，建议试穿确认合身。
          </p>
        </div>
      </div>
    </aside>
  );
}
