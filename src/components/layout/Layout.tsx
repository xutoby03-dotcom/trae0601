import { NavLink, Outlet } from 'react-router-dom';
import { Leaf, Calendar, Plus } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-forest-700 text-white shadow-soft-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-forest-600 flex items-center justify-center group-hover:bg-forest-500 transition-colors">
                <Leaf className="w-5 h-5 text-leaf-300" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold leading-tight">绿意手记</h1>
                <p className="text-xs text-forest-200 leading-tight">盆栽照护记录</p>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-forest-600 text-white'
                      : 'text-forest-100 hover:bg-forest-600 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-1.5">
                  <Leaf className="w-4 h-4" />
                  我的盆栽
                </span>
              </NavLink>
              <NavLink
                to="/monthly"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-forest-600 text-white'
                      : 'text-forest-100 hover:bg-forest-600 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  月度视图
                </span>
              </NavLink>
            </nav>

            <NavLink to="/plants/create" className="btn-primary !py-2 !px-4 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新增植物</span>
            </NavLink>
          </div>
        </div>
      </header>

      <nav className="md:hidden bg-forest-600 text-white border-t border-forest-500 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-12">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all ${
                  isActive ? 'text-leaf-300' : 'text-forest-100'
                }`
              }
            >
              <Leaf className="w-4 h-4" />
              盆栽
            </NavLink>
            <NavLink
              to="/monthly"
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all ${
                  isActive ? 'text-leaf-300' : 'text-forest-100'
                }`
              }
            >
              <Calendar className="w-4 h-4" />
              月度
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 lg:px-8 py-6 md:py-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="bg-forest-800 text-forest-200 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm">
          <p className="font-serif">绿意手记 · 用心呵护每一盆绿植</p>
        </div>
      </footer>
    </div>
  );
}
