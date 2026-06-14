import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  Calendar,
  ArrowRightLeft,
  Undo2,
  Droplets,
  BarChart3,
  Menu,
  X,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { useStore } from '../store';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/costumes', icon: Shirt, label: '服装档案' },
  { path: '/reservations', icon: Calendar, label: '预约管理' },
  { path: '/lendings', icon: ArrowRightLeft, label: '借出管理' },
  { path: '/returns', icon: Undo2, label: '归还管理' },
  { path: '/cleaning', icon: Droplets, label: '清洗管理' },
  { path: '/statistics', icon: BarChart3, label: '统计报表' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast, setToast } = useStore();
  const navigate = useNavigate();

  if (toast) {
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-up ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col min-h-screen`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-gold-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="font-serif font-bold text-lg text-primary-500">毕业照服装</h1>
                <p className="text-xs text-gray-500">预约管理系统</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-gray-500" /> : <Menu className="w-5 h-5 text-gray-500" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button className="sidebar-item w-full text-left">
            <LogOut className="w-5 h-5 flex-shrink-0 text-red-500" />
            {sidebarOpen && <span className="text-red-500">退出登录</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-gray-800">
                欢迎使用毕业照服装预约管理系统
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">管理员</p>
                <p className="text-xs text-gray-500">admin@school.edu</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">管</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
