import { NavLink, Outlet } from "react-router-dom"
import { Home, Plug, Receipt, BarChart3 } from "lucide-react"

const navItems = [
  { to: "/", label: "时间轴", icon: Home },
  { to: "/appliances", label: "电器", icon: Plug },
  { to: "/bills", label: "电费单", icon: Receipt },
  { to: "/stats", label: "统计", icon: BarChart3 },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r border-slate-700/50 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-white tracking-tight">峰谷账本</h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">Electricity Ledger</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 glow-amber"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="glass-card-sm p-3 text-center">
            <p className="text-[10px] text-slate-500 mb-1">数据存储于本地</p>
            <p className="text-xs text-slate-400">localStorage</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
