import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from './lib/utils';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import LitterBoxList from './pages/LitterBoxList';
import LitterBoxDetail from './pages/LitterBoxDetail';
import Records from './pages/Records';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

const mobileTabItems = [
  { to: '/', label: '总览', icon: LayoutDashboard, end: true },
  { to: '/litter-boxes', label: '猫砂盆', icon: Boxes },
  { to: '/records', label: '记录', icon: ClipboardList },
  { to: '/stats', label: '统计', icon: BarChart3 },
  { to: '/settings', label: '设置', icon: SettingsIcon },
];

const MobileTabBar: React.FC = () => {
  const location = useLocation();
  const activeItem =
    mobileTabItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    ) || mobileTabItems[0];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DFD2] pb-safe">
      <div className="flex items-end justify-around px-2 pt-2 pb-3">
        {mobileTabItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          const showLabel = isActive;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300',
                  isActive
                    ? 'text-[#D4896A]'
                    : 'text-[#A09484] hover:text-[#5C4A3A]'
                )
              }
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all duration-300',
                  isActive ? 'bg-[#D4896A]/12 scale-105' : ''
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-all duration-300',
                  showLabel ? 'opacity-100 max-w-[60px]' : 'opacity-0 max-w-0 overflow-hidden'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <div className="hidden lg:flex h-screen w-full overflow-hidden">
        <Sidebar className="fixed left-0 top-0 h-screen" />
        <div className="flex-1 flex flex-col ml-64 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto bg-[#FAF6F0] px-8 py-6 custom-scrollbar">
            <div className="min-h-full">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/litter-boxes" element={<LitterBoxList />} />
                <Route path="/litter-boxes/:id" element={<LitterBoxDetail />} />
                <Route path="/records" element={<Records />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>

      <div className="lg:hidden flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#FAF6F0] px-5 py-4 pb-24 custom-scrollbar">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/litter-boxes" element={<LitterBoxList />} />
            <Route path="/litter-boxes/:id" element={<LitterBoxDetail />} />
            <Route path="/records" element={<Records />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
