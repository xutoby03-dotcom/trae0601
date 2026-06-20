import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Backpack, ClipboardList, Droplets, AlertTriangle, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';

const navItems = [
  { path: '/', label: '看板首页', icon: LayoutDashboard, color: 'text-sky-500' },
  { path: '/members', label: '成员档案', icon: Users, color: 'text-emerald-500' },
  { path: '/bags', label: '防水包档案', icon: Backpack, color: 'text-orange-500' },
  { path: '/checklist', label: '出发前清点', icon: ClipboardList, color: 'text-amber-500' },
  { path: '/seal-check', label: '入水前确认', icon: Droplets, color: 'text-cyan-500' },
  { path: '/post-check', label: '返程后检查', icon: AlertTriangle, color: 'text-rose-500' },
];

export default function Sidebar() {
  const resetAllData = useStore(state => state.resetAllData);
  
  return (
    <aside className="w-64 min-h-screen glass-card border-r border-white/50 flex flex-col">
      <div className="p-6 border-b border-white/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">漂流清点</h1>
            <p className="text-xs text-gray-500">物品管理系统</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' 
                : 'text-gray-600 hover:bg-white/50 hover:text-gray-800'
              }
              animate-fade-in-up
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/30">
        <button
          onClick={resetAllData}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重置数据</span>
        </button>
      </div>
    </aside>
  );
}
