import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  PackagePlus,
  SortAsc,
  BarChart3,
  AlertTriangle,
  Recycle,
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/recovery-points', icon: MapPin, label: '回收点档案' },
  { path: '/drop-register', icon: PackagePlus, label: '投放登记' },
  { path: '/sorting', icon: SortAsc, label: '分拣处理' },
  { path: '/statistics', icon: BarChart3, label: '统计分析' },
  { path: '/exceptions', icon: AlertTriangle, label: '异常管理' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">旧衣回收</h1>
            <p className="text-xs text-gray-500">分拣管理系统</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-xl p-4">
            <p className="text-sm font-medium text-primary-700">💡 环保小贴士</p>
            <p className="text-xs text-primary-600 mt-1">
              每回收1公斤衣物，可减少3.6公斤碳排放
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
