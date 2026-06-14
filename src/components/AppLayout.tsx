import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  ClipboardCheck,
  BarChart3,
  Package,
  Bell,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store/useStore";

const navItems = [
  { path: "/", label: "仪表盘", icon: LayoutDashboard },
  { path: "/baskets", label: "储物篮档案", icon: Boxes },
  { path: "/lend", label: "借出登记", icon: ArrowRightLeft },
  { path: "/return", label: "归还检查", icon: ClipboardCheck },
  { path: "/stats", label: "统计分析", icon: BarChart3 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const overdueCount = useStore(
    (s) => s.lendRecords.filter((r) => r.status === "overdue").length
  );

  const currentTitle =
    navItems.find((n) => {
      if (n.path === "/") return location.pathname === "/";
      return location.pathname.startsWith(n.path);
    })?.label || "储物篮管理系统";

  return (
    <div className="min-h-screen flex bg-slate2-100">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-steel-800 text-white transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <Link
            to="/"
            className="flex items-center gap-3 px-5 py-5 border-b border-white/10 bg-noise-overlay"
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-steel-400 to-steel-600 flex items-center justify-center shadow-industrial">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">
                储物篮
              </h1>
              <p className="text-xs text-steel-300 font-mono">归还是美德</p>
            </div>
          </Link>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all relative ${
                      isActive
                        ? "bg-steel-600 text-white shadow-industrial"
                        : "text-steel-200 hover:bg-steel-700/60 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.path === "/" && overdueCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-signal-500 text-white text-xs font-bold animate-pulse-slow">
                      {overdueCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="px-3 py-3 border-t border-white/10 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-steel-300 hover:bg-steel-700/60 hover:text-white transition-all">
              <Settings className="w-5 h-5" />
              <span>系统设置</span>
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate2-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate2-200">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate2-100 transition"
              >
                <Menu className="w-5 h-5 text-slate2-700" />
              </button>
              {menuOpen && (
                <button
                  onClick={() => setMenuOpen(false)}
                  className="lg:hidden fixed top-3 left-44 z-50 p-1.5 rounded-md bg-steel-700 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate2-400 font-mono">
                  / {currentTitle}
                </p>
                <h2 className="font-display font-semibold text-slate2-800 truncate">
                  {currentTitle}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button className="p-2 rounded-md hover:bg-slate2-100 transition">
                  <Bell className="w-5 h-5 text-slate2-600" />
                  {overdueCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-signal-500 animate-blink-dot" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 pl-3 border-l border-slate2-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-steel-400 to-steel-600 flex items-center justify-center text-white text-xs font-bold">
                  管
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate2-800 leading-none">
                    行政管理员
                  </p>
                  <p className="text-xs text-slate2-400 mt-0.5">
                    admin@company
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
