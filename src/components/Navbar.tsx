import { NavLink } from 'react-router-dom';
import { Calendar, Building2, LayoutDashboard, ClipboardCheck } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/reservation', label: '预约申请', icon: Calendar },
  { path: '/elevators', label: '电梯档案', icon: Building2 },
  { path: '/dashboard', label: '物业看板', icon: LayoutDashboard },
  { path: '/completion', label: '完成记录', icon: ClipboardCheck },
];

export default function Navbar() {
  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-accent-400" />
            <h1 className="text-xl font-bold">电梯搬家预约系统</h1>
          </div>
          
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-accent-500 text-white shadow-md'
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
