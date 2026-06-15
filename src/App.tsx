import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Leaf, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import BatchList from '@/pages/BatchList';
import Statistics from '@/pages/Statistics';
import SettingsPage from '@/pages/Settings';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream-100 pb-20 md:pb-6">
        <Routes>
          <Route path="/" element={<BatchList />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-cream-200 md:hidden z-40">
          <div className="flex justify-around py-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                  isActive ? 'text-matcha-600' : 'text-gray-400'
                }`
              }
            >
              <Leaf className="w-5 h-5" />
              <span className="text-xs mt-1">批次</span>
            </NavLink>
            <NavLink
              to="/statistics"
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                  isActive ? 'text-matcha-600' : 'text-gray-400'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs mt-1">统计</span>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                  isActive ? 'text-matcha-600' : 'text-gray-400'
                }`
              }
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="text-xs mt-1">设置</span>
            </NavLink>
          </div>
        </nav>
        
        <nav className="hidden md:block fixed left-0 top-0 bottom-0 w-20 bg-white/80 backdrop-blur-md border-r border-cream-200 z-40">
          <div className="flex flex-col items-center py-6 h-full">
            <div className="w-12 h-12 rounded-xl bg-matcha-500 text-white flex items-center justify-center shadow-md shadow-matcha-200 mb-8">
              <Leaf className="w-6 h-6" />
            </div>
            
            <div className="flex flex-col gap-2 flex-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-matcha-100 text-matcha-600 shadow-sm' 
                      : 'text-gray-400 hover:bg-cream-100 hover:text-gray-600'
                  }`
                }
                title="批次管理"
              >
                <Leaf className="w-5 h-5" />
              </NavLink>
              <NavLink
                to="/statistics"
                className={({ isActive }) =>
                  `w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-matcha-100 text-matcha-600 shadow-sm' 
                      : 'text-gray-400 hover:bg-cream-100 hover:text-gray-600'
                  }`
                }
                title="统计分析"
              >
                <BarChart3 className="w-5 h-5" />
              </NavLink>
            </div>
            
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-matcha-100 text-matcha-600 shadow-sm' 
                    : 'text-gray-400 hover:bg-cream-100 hover:text-gray-600'
                }`
              }
              title="设置"
            >
              <SettingsIcon className="w-5 h-5" />
            </NavLink>
          </div>
        </nav>
      </div>
    </Router>
  );
}
