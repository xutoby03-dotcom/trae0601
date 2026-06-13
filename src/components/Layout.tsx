import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Car,
  ClipboardList,
  Undo2,
  KeyRound,
  Bell,
  Search,
} from 'lucide-react'
import type { ReactNode } from 'react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '看板总览' },
  { to: '/vehicles', icon: Car, label: '车辆档案' },
  { to: '/requests', icon: ClipboardList, label: '用车申请' },
  { to: '/returns', icon: Undo2, label: '归还登记' },
]

function Sidebar() {
  const location = useLocation()
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full bg-white border-r border-slate-100">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, #2A548A 0%, #1E3A5F 100%)' }}>
          <KeyRound size={20} />
        </div>
        <div>
          <div className="font-semibold text-slate-900">钥匙排班</div>
          <div className="text-xs text-slate-400">公车管理系统</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <div
                  className={`nav-item ${isActive || active ? 'nav-item-active' : 'nav-item-inactive'}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="p-4">
        <div className="rounded-2xl p-4 text-sm text-slate-500 leading-relaxed"
          style={{ background: 'linear-gradient(180deg, #F0F4FA 0%, #FFFFFF 100%)' }}>
          <div className="font-semibold text-primary-600 mb-1">
            💡 管理提示
          </div>
          取车前请检查车辆油量及车况，归还后请及时登记停车照片。
        </div>
      </div>
    </aside>
  )
}

function Topbar() {
  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
      <div>
        <div className="relative w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索车牌号、驾驶人、目的地..."
            className="form-input pl-10 py-2 bg-slate-50 border-transparent focus:bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-400" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">张经理</div>
            <div className="text-xs text-slate-400">行政部 · 管理员</div>
          </div>
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #F26B3A 0%, #E64E1A 100%)' }}
          >
            张
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
