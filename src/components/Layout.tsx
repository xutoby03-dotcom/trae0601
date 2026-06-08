import { useLocation, Link } from "react-router-dom"
import { Home, List, Snowflake, BarChart3, Plus } from "lucide-react"

const tabs = [
  { path: "/", icon: Home, label: "仪表盘" },
  { path: "/transactions", icon: List, label: "流水" },
  { path: "/cool-zone", icon: Snowflake, label: "冷静区" },
  { path: "/stats", icon: BarChart3, label: "统计" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-midnight max-w-md mx-auto relative flex flex-col">
      <header className="sticky top-0 z-30 px-5 py-3 flex items-center justify-center bg-midnight/80 backdrop-blur-md">
        <h1 className="font-display text-2xl bg-gradient-to-r from-coral to-gold bg-clip-text text-transparent">
          心账
        </h1>
      </header>

      <main className="flex-1 pb-24 px-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 glass-strong">
        <div className="flex items-end justify-around px-2 py-2">
          {tabs.slice(0, 2).map((tab) => {
            const active = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                  active ? "text-coral" : "text-slate-400"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px]">{tab.label}</span>
              </Link>
            )
          })}

          <Link
            to="/new"
            className="flex items-center justify-center -mt-5 w-14 h-14 rounded-full gradient-coral shadow-lg shadow-coral/30 text-white transition-transform active:scale-95"
          >
            <Plus size={28} strokeWidth={2.5} />
          </Link>

          {tabs.slice(2).map((tab) => {
            const active = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                  active ? "text-coral" : "text-slate-400"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px]">{tab.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  )
}
