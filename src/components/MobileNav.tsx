import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Calendar } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "看板" },
  { to: "/players", icon: Users, label: "玩家" },
  { to: "/sessions", icon: Calendar, label: "场次" },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-ink-900/95 backdrop-blur-md border-t border-ink-800 px-2 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-white bg-ink-600/40"
                    : "text-ink-400"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
