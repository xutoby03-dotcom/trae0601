import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Package, Plus, BarChart3, Warehouse, Search, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: '首页看板', icon: Package },
  { path: '/create', label: '创建寄样', icon: Plus },
  { path: '/inventory', label: '库存管理', icon: Warehouse },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">样品寄送追踪台</h1>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="hidden sm:block relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索客户、样品、单号..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </form>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
