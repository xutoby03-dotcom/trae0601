import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Plus } from 'lucide-react'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            电子保修卡册
          </Link>
          <div className="navbar-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link-active' : ''}`
              }
            >
              <LayoutDashboard size={18} />
              <span>仪表盘</span>
            </NavLink>
            <NavLink
              to="/devices"
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link-active' : ''}`
              }
            >
              <ClipboardList size={18} />
              <span>设备列表</span>
            </NavLink>
          </div>
          <Link to="/devices/new" className="btn btn-primary navbar-button">
            <Plus size={18} />
            <span>添加设备</span>
          </Link>
        </div>
      </nav>
      <main className="container">{children}</main>
    </div>
  )
}

export default Layout
