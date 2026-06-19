import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Calendar } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "数据看板" },
  { to: "/players", icon: Users, label: "玩家档案" },
  { to: "/sessions", icon: Calendar, label: "场次管理" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-ink-900/80 backdrop-blur-md border-r border-ink-800 flex flex-col hidden lg:flex">
      <div className="p-6 border-b border-ink-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ink-500 to-ink-700 flex items-center justify-center text-xl shadow-glow">
            🔐
          </div>
          <div>
            <div className="font-display font-bold text-lg text-white">
              密室拼场
            </div>
            <div className="text-xs text-ink-400">Escape Room Match</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-ink-600/40 text-white shadow-glow"
                    : "text-ink-300 hover:bg-ink-800/60 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-ink-800">
        <div className="text-xs text-ink-400 text-center">
          v1.0 · 拼场不再翻车 ✨
        </div>
      </div>
    </aside>
  );
}
