import { NavLink, Outlet } from 'react-router-dom';
import { Home, Cat, Box, ClipboardList } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/cats', label: '猫咪档案', icon: Cat },
    { path: '/litter-boxes', label: '猫砂盆', icon: Box },
    { path: '/cleaning-records', label: '清理记录', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-warm-100 p-6 fixed h-full">
        <div className="mb-8">
          <h1 className="text-2xl font-display text-sand-300 flex items-center gap-2">
            🐱 猫砂盆管家
          </h1>
          <p className="text-sm text-warm-300 mt-1">猫咪健康从如厕开始</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'text-warm-400'}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="pt-6 border-t border-warm-100">
          <p className="text-xs text-warm-300 text-center">
            数据保存在本地浏览器
          </p>
        </div>
      </aside>
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 px-4 py-2 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive ? 'text-sand-300' : 'text-warm-300'
                }`
              }
            >
              <item.icon size={24} />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
