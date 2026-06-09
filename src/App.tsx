import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import DetailPage from './pages/DetailPage';
import RulesPage from './pages/RulesPage';
import StatsPage from './pages/StatsPage';

function AppContent() {
  return (
    <div className="app">
      <div className="app__body">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </div>
      <nav className="app__nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} end>
          <span className="nav-item__icon">🏠</span>
          <span className="nav-item__label">首页</span>
        </NavLink>
        <NavLink to="/register" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="nav-item__icon">➕</span>
          <span className="nav-item__label">登记</span>
        </NavLink>
        <NavLink to="/rules" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="nav-item__icon">📋</span>
          <span className="nav-item__label">规则</span>
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
          <span className="nav-item__icon">📊</span>
          <span className="nav-item__label">统计</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
