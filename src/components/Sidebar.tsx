import { NavLink, useLocation } from 'react-router-dom'
import { Package, Palette, FolderKanban, ShoppingCart, Box } from 'lucide-react'

const navItems = [
  { to: '/', icon: Box, label: '材料抽屉' },
  { to: '/color-search', icon: Palette, label: '颜色搜索' },
  { to: '/projects', icon: FolderKanban, label: '我的项目' },
  { to: '/shopping-list', icon: ShoppingCart, label: '采购清单' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 min-h-screen bg-white border-r-2 border-sand-light flex flex-col">
      <div className="p-6 border-b border-sand-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-caramel rounded-xl flex items-center justify-center shadow-craft">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-bark text-lg leading-tight">手作材料</h1>
            <p className="text-xs text-sand">库存管理盒</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-caramel text-white shadow-craft'
                  : 'text-caramel-dark hover:bg-parchment'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sand-light">
        <div className="card bg-parchment p-4">
          <p className="text-xs text-caramel-dark font-medium font-serif">快速入库</p>
          <p className="text-xs text-sand mt-1">点击右上角按钮新增材料</p>
        </div>
      </div>
    </aside>
  )
}
