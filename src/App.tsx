import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Coffee, Cog, TrendingDown, BarChart3 } from 'lucide-react';
import { BarView } from './pages/BarView';
import { GrinderView } from './pages/GrinderView';
import { WasteView } from './pages/WasteView';
import { ManagerView } from './pages/ManagerView';

function BottomNav() {
  const navItems = [
    { path: '/', label: '风味窗口', icon: Coffee },
    { path: '/grinders', label: '磨豆机', icon: Cog },
    { path: '/waste', label: '损耗', icon: TrendingDown },
    { path: '/manager', label: '店长', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 px-4 transition-colors ${
                  isActive
                    ? 'text-stone-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

function AppLayout() {
  return (
    <div className="pb-20">
      <Routes>
        <Route path="/" element={<BarView />} />
        <Route path="/grinders" element={<GrinderView />} />
        <Route path="/waste" element={<WasteView />} />
        <Route path="/manager" element={<ManagerView />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
