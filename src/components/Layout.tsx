import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Droplets, FileText, Package, BarChart3, Menu, X, Droplet } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/devices', label: '设备档案', icon: Droplets },
  { path: '/records', label: '更换记录', icon: FileText },
  { path: '/inventory', label: '库存管理', icon: Package },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-gray-800">滤芯管家</h1>
              <p className="text-xs text-gray-500">智能更换管理</p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-cyan-50 border border-primary-100">
            <p className="text-sm font-medium text-primary-700">健康饮水小贴士</p>
            <p className="text-xs text-primary-600 mt-1">
              定期更换滤芯，确保水质纯净，守护家人健康。
            </p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-display font-semibold text-xl text-gray-800 hidden sm:block">
              {navItems.find((item) =>
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)
              )?.label || '仪表盘'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-50 text-success-600">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-sm font-medium">数据已同步</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
