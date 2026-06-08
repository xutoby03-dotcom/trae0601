import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import PlantCorner from './pages/PlantCorner'
import CalendarView from './pages/CalendarView'
import PlantDetail from './pages/PlantDetail'
import AddPlant from './pages/AddPlant'
import EditPlant from './pages/EditPlant'
import Diagnosis from './pages/Diagnosis'
import Settings from './pages/Settings'

export default function App() {
  const location = useLocation()
  const hideNav = ['/add', '/settings'].some(p => location.pathname.startsWith(p)) && !location.pathname.includes('/edit')

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1><span>🌿</span> 绿植管家</h1>
        <div className="header-actions">
          <a href="/add" className="header-btn">+ 添加植物</a>
        </div>
      </header>
      {!hideNav && (
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            🏠 植物角
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📅 照料日历
          </NavLink>
          <NavLink to="/diagnosis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            🩺 问题诊断
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            ⚙️ 设置
          </NavLink>
        </nav>
      )}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<PlantCorner />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/plant/:id" element={<PlantDetail />} />
          <Route path="/add" element={<AddPlant />} />
          <Route path="/edit/:id" element={<EditPlant />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
