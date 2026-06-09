import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Home as HomeIcon, BarChart3 } from 'lucide-react'
import Home from './pages/Home'
import NewReport from './pages/NewReport'
import ReportDetail from './pages/ReportDetail'
import Statistics from './pages/Statistics'

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${isActive('/') ? 'nav-active' : ''}`}
        onClick={() => navigate('/')}
      >
        <HomeIcon size={20} />
        <span>首页</span>
      </button>
      <button
        className="nav-item nav-add"
        onClick={() => navigate('/new')}
      >
        <div className="nav-add-btn">
          <Plus size={24} />
        </div>
        <span>上报</span>
      </button>
      <button
        className={`nav-item ${isActive('/stats') ? 'nav-active' : ''}`}
        onClick={() => navigate('/stats')}
      >
        <BarChart3 size={20} />
        <span>统计</span>
      </button>
    </nav>
  )
}

function App() {
  return (
    <div className="app-shell">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewReport />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          <Route path="/stats" element={<Statistics />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default App
