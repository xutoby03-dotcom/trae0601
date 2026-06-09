import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Printer, AlertTriangle, Package, ShoppingCart, BarChart3, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: '设备看板', icon: LayoutDashboard },
  { path: '/printers', label: '打印机管理', icon: Printer },
  { path: '/reports', label: '故障报修', icon: AlertTriangle },
  { path: '/inventory', label: '耗材库存', icon: Package },
  { path: '/procurement', label: '采购跟踪', icon: ShoppingCart },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1e1e3a] text-amber-400 p-2 rounded-lg border border-amber-400/20 shadow-lg"
      >
        {collapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      {collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-[#12122a] border-r border-white/5 z-40 transition-all duration-300 flex flex-col',
          'lg:translate-x-0 lg:w-60',
          collapsed ? 'translate-x-0 w-60' : '-translate-x-full'
        )}
      >
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
              <Printer size={20} className="text-[#12122a]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-wide">耗材看板</h1>
              <p className="text-white/30 text-[10px]">Print Supply Monitor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setCollapsed(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
                )}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-[#12122a]">
              管
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">管理员</p>
              <p className="text-white/30 text-[10px]">admin@company.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
