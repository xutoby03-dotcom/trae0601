import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, Bell, Home, Car, Armchair, ClipboardCheck, ListTodo, BarChart3, Settings } from 'lucide-react';
import { useState } from 'react';
import { useReminderStore } from '@/store/useReminderStore';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { getActiveReminders } = useReminderStore();
  const activeReminders = getActiveReminders();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/vehicles', label: '车辆', icon: Car },
    { path: '/seats', label: '座椅', icon: Armchair },
    { path: '/inspection', label: '检查', icon: ClipboardCheck },
    { path: '/tasks', label: '任务', icon: ListTodo },
    { path: '/statistics', label: '统计', icon: BarChart3 },
    { path: '/reminders', label: '提醒', icon: Bell },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-secondary-500 hidden sm:block">
              安全座椅管家
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.path === '/reminders' && activeReminders.length > 0 && (
                  <span className="bg-danger text-white text-xs px-1.5 py-0.5 rounded-full">
                    {activeReminders.length}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/reminders"
              className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors md:hidden"
            >
              <Bell className="w-5 h-5" />
              {activeReminders.length > 0 && (
                <span className="absolute top-1 right-1 bg-danger text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {activeReminders.length}
                </span>
              )}
            </Link>
            <button
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-200 animate-fade-in-up">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
