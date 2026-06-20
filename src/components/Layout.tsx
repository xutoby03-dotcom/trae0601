import { Outlet, NavLink } from 'react-router-dom';
import { Headphones, LayoutDashboard, PlusCircle, Undo2, Settings } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">耳麦管理</h1>
              <p className="text-xs text-slate-500">Headset Manager</p>
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
            <span>看板</span>
          </NavLink>
          
          <NavLink 
            to="/headsets" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <Headphones className="w-5 h-5" />
            <span>耳麦档案</span>
          </NavLink>
          
          <NavLink 
            to="/headsets/new" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <PlusCircle className="w-5 h-5" />
            <span>新增耳麦</span>
          </NavLink>
          
          <NavLink 
            to="/borrow" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <PlusCircle className="w-5 h-5" />
            <span>借用登记</span>
          </NavLink>
          
          <NavLink 
            to="/return" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <Undo2 className="w-5 h-5" />
            <span>归还测试</span>
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <button className="nav-link w-full text-left">
            <Settings className="w-5 h-5" />
            <span>设置</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
