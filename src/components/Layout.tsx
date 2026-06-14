import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FlaskConical, TestTubes, LogOut, RotateCcw, BarChart3, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navItems = [
  { to: "/samples", label: "样本档案", icon: TestTubes },
  { to: "/checkout", label: "领用管理", icon: LogOut },
  { to: "/return", label: "归还废弃", icon: RotateCcw },
  { to: "/dashboard", label: "统计仪表盘", icon: BarChart3 },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[260px] bg-[#0F766E] text-white transition-transform duration-200 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <FlaskConical className="h-7 w-7 shrink-0" />
          <span className="text-xl font-bold tracking-wide">生物样本流转</span>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#115E59] border-l-4 border-white text-white"
                    : "border-l-4 border-transparent text-teal-100 hover:bg-teal-800 hover:text-white"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="md:pl-[260px]">
        <header className="sticky top-0 z-10 flex h-14 items-center bg-white px-4 shadow-sm md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="ml-3 text-lg font-semibold text-[#0F766E]">生物样本流转</span>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
