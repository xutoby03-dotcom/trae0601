import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, Footprints, BarChart3, PlusCircle } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isAddPage = location.pathname.includes('/new');

  return (
    <div className="min-h-screen bg-night-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-grain pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-energy-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-fresh-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex">
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-night-700 bg-night-900/50 backdrop-blur-sm">
          <div className="p-6 border-b border-night-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-energy-500 to-energy-600 flex items-center justify-center shadow-lg shadow-energy-500/25">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-white">ShoeTrack</h1>
                <p className="text-xs text-gray-500">跑鞋里程管家</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>鞋柜</span>
            </NavLink>
            <NavLink
              to="/shoe/new"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <PlusCircle className="w-5 h-5" />
              <span>添加跑鞋</span>
            </NavLink>
            <NavLink
              to="/run/new"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <Plus className="w-5 h-5" />
              <span>记录跑步</span>
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <BarChart3 className="w-5 h-5" />
              <span>复盘统计</span>
            </NavLink>
          </nav>

          <div className="p-4 border-t border-night-700">
            <div className="card !p-4 bg-gradient-to-br from-night-700 to-night-800">
              <p className="text-xs text-gray-400 mb-1">小贴士</p>
              <p className="text-sm text-gray-200">
                一般跑鞋寿命约 500-800 公里，中底塌陷就要换啦！
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="lg:hidden sticky top-0 z-20 bg-night-900/80 backdrop-blur-sm border-b border-night-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-energy-500 to-energy-600 flex items-center justify-center">
                  <Footprints className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-white">ShoeTrack</span>
              </div>
              <nav className="flex gap-1">
                <NavLink to="/" end className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'bg-night-700 text-white' : 'text-gray-400'}`}>
                  <LayoutDashboard className="w-5 h-5" />
                </NavLink>
                <NavLink to="/shoe/new" className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'bg-night-700 text-white' : 'text-gray-400'}`}>
                  <PlusCircle className="w-5 h-5" />
                </NavLink>
                <NavLink to="/run/new" className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'bg-night-700 text-white' : 'text-gray-400'}`}>
                  <Plus className="w-5 h-5" />
                </NavLink>
                <NavLink to="/stats" className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'bg-night-700 text-white' : 'text-gray-400'}`}>
                  <BarChart3 className="w-5 h-5" />
                </NavLink>
              </nav>
            </div>
          </header>

          <div className={`p-4 md:p-8 ${isAddPage ? 'max-w-2xl mx-auto' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
