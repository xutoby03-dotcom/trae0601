import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Package, Send, RotateCcw } from "lucide-react";

const navItems = [
  { to: "/", label: "看板", icon: LayoutDashboard },
  { to: "/exams", label: "考试档案", icon: FileText },
  { to: "/inventory", label: "库存管理", icon: Package },
  { to: "/distribution", label: "发放记录", icon: Send },
  { to: "/collection", label: "回收录入", icon: RotateCcw },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-60 flex-shrink-0 bg-[#1e3a5f] text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-wide">草稿纸管理系统</h1>
          <p className="text-xs text-white/50 mt-1">发放 · 追踪 · 回收</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white/15 text-white font-medium shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-[10px] text-white/30">考试草稿纸发放回收系统 v1.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
