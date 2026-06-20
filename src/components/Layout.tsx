import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Scissors,
} from "lucide-react";

const navItems = [
  { to: "/", label: "数据看板", icon: LayoutDashboard },
  { to: "/elders", label: "老人档案", icon: Users },
  { to: "/appointments", label: "预约管理", icon: CalendarDays },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-warm-50 flex">
      <aside className="w-64 bg-white shadow-card flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Scissors className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">爱心理发</h1>
              <p className="text-xs text-gray-500">社区上门服务</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">管</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">管理员</p>
              <p className="text-xs text-gray-500">社区服务中心</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              老人理发预约管理系统
            </h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
