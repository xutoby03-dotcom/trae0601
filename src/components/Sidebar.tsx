import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '@/store'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  CheckSquare,
  BarChart3,
  FlaskConical,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页概览' },
  { to: '/consumables', icon: Package, label: '耗材管理' },
  { to: '/request', icon: ClipboardList, label: '领用申请' },
  { to: '/approval', icon: CheckSquare, label: '审批管理' },
  { to: '/statistics', icon: BarChart3, label: '统计分析' },
]

export default function Sidebar() {
  const { currentRole, setCurrentRole, requisitions } = useStore()
  const location = useLocation()
  const pendingCount = requisitions.filter(
    (r) => r.status === 'pending' || r.status === 'hazardous_pending'
  ).length

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-lab-900 text-white flex flex-col z-50">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-lab-900" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight">LabStock</h1>
            <p className="text-xs text-lab-300">耗材领用管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-lab-200 hover:bg-white/8 hover:text-white'
                }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{label}</span>
              {label === '审批管理' && pendingCount > 0 && (
                <span className="ml-auto bg-danger-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-lab-300" />
          <span className="text-xs text-lab-300">角色切换</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
              ${currentRole === 'admin' ? 'bg-amber-500 text-lab-900' : 'bg-white/8 text-lab-200 hover:bg-white/15'}`}
          >
            <User className="w-3.5 h-3.5" />
            老师
          </button>
          <button
            onClick={() => setCurrentRole('student')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
              ${currentRole === 'student' ? 'bg-amber-500 text-lab-900' : 'bg-white/8 text-lab-200 hover:bg-white/15'}`}
          >
            <Users className="w-3.5 h-3.5" />
            学生
          </button>
        </div>
      </div>
    </aside>
  )
}
