import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Battery, Car, ClipboardCheck, CalendarClock, BarChart3, LogOut, Shield, User } from 'lucide-react'
import { useStore } from '@/store/useStore'

const navItems = [
  { to: '/', label: '首页', icon: Battery },
  { to: '/vehicles', label: '车辆管理', icon: Car },
  { to: '/checkup/new', label: '电池体检', icon: ClipboardCheck },
  { to: '/events', label: '集中检测', icon: CalendarClock },
  { to: '/stats', label: '统计中心', icon: BarChart3 },
]

export default function Layout() {
  const { currentUser, loginAsOwner, loginAsAdmin, logout } = useStore()
  const navigate = useNavigate()

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <Battery className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-zinc-50 tracking-tight">电池体检</h1>
            <p className="text-zinc-400 mt-2">小区电动车电池健康管理平台</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => { loginAsOwner(); navigate('/') }}
              className="w-full flex items-center gap-4 px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/50 hover:bg-zinc-800 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-zinc-100">车主登录</div>
                <div className="text-xs text-zinc-500">录入车辆、自助体检、报名检测</div>
              </div>
            </button>
            <button
              onClick={() => { loginAsAdmin(); navigate('/') }}
              className="w-full flex items-center gap-4 px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-amber-500/50 hover:bg-zinc-800 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-zinc-100">物业管理员登录</div>
                <div className="text-xs text-zinc-500">发布检测场次、查看统计</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 fixed inset-y-0">
        <div className="p-5 flex items-center gap-3 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Battery className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-zinc-100 text-sm">电池体检</div>
            <div className="text-[10px] text-zinc-500">{currentUser.role === 'admin' ? '物业管理' : '车主端'}</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-zinc-400 truncate">{currentUser.name}</div>
            <div className="text-[10px] text-zinc-600">{currentUser.building}</div>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-60 lg:ml-64">
        <header className="md:hidden sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">电池体检</span>
          </div>
          <button onClick={() => { logout(); navigate('/') }} className="text-zinc-500 text-xs">退出</button>
        </header>
        <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 z-40">
          <div className="flex justify-around py-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center py-2 px-3 text-[10px] transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-zinc-500'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
