import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  AlertTriangle,
  CreditCard,
  Wrench,
  Menu,
  X,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/utils/helpers";

const navItems = [
  { path: "/", label: "首页", icon: LayoutDashboard },
  { path: "/devices", label: "设备档案", icon: FileText },
  { path: "/checklist", label: "日常检查", icon: ClipboardList },
  { path: "/incidents", label: "异常记录", icon: AlertTriangle },
  { path: "/repairs", label: "维修任务", icon: Wrench },
  { path: "/quick-card", label: "快速检查卡", icon: CreditCard },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print bg-white/80 backdrop-blur-md border-b border-primary-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">助行器维护系统</h1>
                <p className="text-xs text-gray-500">安全守护，关爱随行</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary-100 bg-white">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                      isActive
                        ? "bg-primary-500 text-white"
                        : "text-gray-600 hover:bg-primary-50"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="no-print bg-white/60 backdrop-blur-sm border-t border-primary-100 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>助行器维护管理系统 · 让每一步都安心</p>
        </div>
      </footer>
    </div>
  );
}
