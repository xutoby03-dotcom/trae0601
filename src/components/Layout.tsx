import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPlus,
  RotateCcw,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { isSoonOverdue } from "@/utils/dateUtils";

const navItems = [
  { to: "/", label: "首页总览", icon: LayoutDashboard },
  { to: "/borrow", label: "借用登记", icon: ClipboardPlus },
  { to: "/return", label: "归还管理", icon: RotateCcw },
  { to: "/statistics", label: "统计分析", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const { getStatsByStatus, getOverdueCount } = useCardStore();
  const stats = getStatsByStatus();
  const overdueCount = getOverdueCount();

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col min-h-screen sticky top-0">
        <div className="h-16 px-6 flex items-center gap-3 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-lg bg-brand-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-brand-900 leading-tight">
              工牌借用系统
            </div>
            <div className="text-xs text-zinc-400">Temporary Card</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
                {item.to === "/return" && overdueCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {overdueCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100 space-y-3">
          <div className="text-xs text-zinc-400 font-medium mb-2">快速状态</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-teal-50 rounded-lg p-2.5">
              <div className="text-teal-700 font-semibold text-base">
                {stats.available.total}
              </div>
              <div className="text-teal-600 text-xs">可借</div>
            </div>
            <div className="bg-brand-50 rounded-lg p-2.5">
              <div className="text-brand-700 font-semibold text-base">
                {stats.inUse.total}
              </div>
              <div className="text-brand-600 text-xs">使用中</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2.5">
              <div className="text-orange-600 font-semibold text-base">
                {stats.soonOverdue.total}
              </div>
              <div className="text-orange-500 text-xs">即将超时</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5">
              <div className="text-red-600 font-semibold text-base">
                {stats.lost.total}
              </div>
              <div className="text-red-500 text-xs">已挂失</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">
              {navItems.find(
                (n) =>
                  n.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(n.to)
              )?.label || "临时工牌借用管理"}
            </h1>
          </div>
          <div className="text-sm text-zinc-500">
            前台接待 · {new Date().toLocaleDateString("zh-CN")}
          </div>
        </header>
        <div className="p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
