import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import NewDream from './pages/NewDream'
import DreamDetail from './pages/DreamDetail'
import Search from './pages/Search'
import Stats from './pages/Stats'

const NAV_ITEMS = [
  { to: '/', label: '展厅走廊', icon: '🏛️' },
  { to: '/new', label: '记录梦境', icon: '✨' },
  { to: '/search', label: '梦境检索', icon: '🔍' },
  { to: '/stats', label: '梦境统计', icon: '📊' },
]

export default function App() {
  const location = useLocation()

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🌙 梦境博物馆</div>
        <div className="sidebar-subtitle">Dream Museum</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(124,111,240,0.15)' : 'transparent',
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
              })}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewDream />} />
          <Route path="/dream/:id" element={<DreamDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </div>
  )
}
