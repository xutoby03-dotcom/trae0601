import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  ChefHat,
  BarChart3,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "数据总览", icon: LayoutDashboard, emoji: "📊" },
  { path: "/menu", label: "菜单管理", icon: UtensilsCrossed, emoji: "🍱" },
  { path: "/orders", label: "订餐管理", icon: ClipboardList, emoji: "📋" },
  { path: "/kitchen", label: "厨房看板", icon: ChefHat, emoji: "👨‍🍳" },
  { path: "/stats", label: "统计分析", icon: BarChart3, emoji: "📈" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-brand-50">
      {/* 侧边栏 */}
      <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-brand-100 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-brand-100 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-xl shadow-md">
            🍚
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-brand-900">社区饭堂</h1>
            <p className="text-xs text-brand-500">备餐管理系统</p>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-md shadow-brand-200"
                        : "text-brand-700 hover:bg-brand-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        isActive ? "text-white" : "text-brand-500 group-hover:scale-110"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto text-base">{item.emoji}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 底部信息 */}
        <div className="border-t border-brand-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-200 text-brand-700">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-800">社区管理员</p>
              <p className="truncate text-xs text-brand-500">为老人暖心服务</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="ml-60 flex-1">
        <div className="mx-auto w-full max-w-7xl px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
