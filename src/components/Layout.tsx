import { NavLink, Outlet } from "react-router-dom"
import { useStore } from "@/store/useStore"
import {
  Monitor,
  ArrowRightLeft,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react"

const navItems = [
  { to: "/devices", label: "样机资产", icon: Monitor },
  { to: "/borrow", label: "外借登记", icon: ArrowRightLeft },
  { to: "/records", label: "外借记录", icon: LayoutDashboard },
  { to: "/alerts", label: "异常预警", icon: AlertTriangle },
]

export default function Layout() {
  const alerts = useStore((s) => s.alerts)
  const unresolvedCount = alerts.filter((a) => !a.resolved).length

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-700/50">
          <h1 className="font-display text-lg font-bold tracking-tight text-brand-400">
            样机追踪
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">设备外借管理系统</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/15 text-brand-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "异常预警" && unresolvedCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {unresolvedCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">v1.0.0 · 样机追踪系统</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
