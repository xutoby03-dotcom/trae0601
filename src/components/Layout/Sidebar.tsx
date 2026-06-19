import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, BellRing, FileText, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col bg-white/70 backdrop-blur-sm border-r border-cream-200 min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 p-4 space-y-1">
        <div className="mb-4 px-3 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">主导航</p>
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'text-gray-600 hover:bg-cream-100 hover:text-gray-800'
            }`
          }
        >
          <LayoutDashboard className={`w-5 h-5 transition-transform group-hover:scale-110 ${({ isActive }) => (isActive ? 'text-white' : 'text-brand-500')}`} />
          <span>仪表盘</span>
        </NavLink>

        <NavLink
          to="/devices"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'text-gray-600 hover:bg-cream-100 hover:text-gray-800'
            }`
          }
        >
          <ShieldAlert className={`w-5 h-5 transition-transform group-hover:scale-110 ${({ isActive }) => (isActive ? 'text-white' : 'text-warning-500')}`} />
          <span>设备档案</span>
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'text-gray-600 hover:bg-cream-100 hover:text-gray-800'
            }`
          }
        >
          <BellRing className={`w-5 h-5 transition-transform group-hover:scale-110 ${({ isActive }) => (isActive ? 'text-white' : 'text-danger-500')}`} />
          <span>异常维修</span>
        </NavLink>

        <div className="mt-6 mb-4 px-3 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">其他</p>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-cream-100 hover:text-gray-800 transition-all duration-200 group w-full">
          <FileText className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:scale-110" />
          <span>使用说明</span>
        </button>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-cream-100 hover:text-gray-800 transition-all duration-200 group w-full">
          <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:scale-110" />
          <span>系统设置</span>
        </button>
      </nav>

      <div className="p-4 border-t border-cream-200">
        <div className="p-4 rounded-xl bg-gradient-to-br from-brand-50 to-warning-50 border border-cream-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-600">系统运行正常</span>
          </div>
          <p className="text-xs text-gray-500">定期巡检，安全守护每一刻</p>
        </div>
      </div>
    </aside>
  );
}
