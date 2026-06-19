import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shirt,
  ClipboardList,
  ShoppingCart,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "数据看板", icon: LayoutDashboard },
  { to: "/students", label: "学生档案", icon: Users },
  { to: "/products", label: "商品档案", icon: Shirt },
  { to: "/orders", label: "补订申请", icon: ClipboardList },
  { to: "/purchases", label: "采购清单", icon: ShoppingCart },
];

export default function Sidebar() {
  return (
    <aside className="w-60 h-screen bg-primary-700 text-white flex flex-col sticky top-0">
      <div className="px-6 py-5 border-b border-primary-600 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-accent-300" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wide">校服补订系统</h1>
          <p className="text-xs text-primary-200">Uniform Management</p>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-primary-100 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-600">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-sm font-bold">
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">系统管理员</p>
            <p className="text-xs text-primary-200 truncate">admin@school.edu</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
