import { NavLink } from "react-router-dom";
import { Shirt, WashingMachine, History, PieChart, Sparkles } from "lucide-react";

export default function Navbar() {
  const navItems = [
    { to: "/", label: "衣物档案", icon: Shirt },
    { to: "/washer", label: "开始洗衣", icon: WashingMachine },
    { to: "/history", label: "洗衣历史", icon: History },
    { to: "/summary", label: "数据小结", icon: PieChart },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-primary-100/50 shadow-soft">
      <div className="container flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-elevated">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold text-primary-800">
              洗衣卫士
            </span>
            <span className="text-[10px] text-neutral-500">混洗风险检测</span>
          </div>
        </NavLink>

        <div className="flex items-center gap-1 rounded-full bg-white/60 p-1 shadow-soft">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-500 text-white shadow-elevated"
                    : "text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
