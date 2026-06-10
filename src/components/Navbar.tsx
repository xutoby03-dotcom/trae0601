import { Link, useLocation } from 'react-router-dom';
import { KeyRound, PlusCircle, BarChart3, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/create', label: '发起组队', icon: PlusCircle },
    { path: '/stats', label: '统计数据', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-midnight-950/90 backdrop-blur-md border-b border-gold-600/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-wine-700 to-wine-900 flex items-center justify-center border border-gold-600/40 group-hover:shadow-gold-glow transition-all duration-300">
              <KeyRound className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h1 className="font-display text-lg text-gold-400 tracking-wider">密境集结</h1>
              <p className="text-xs text-midnight-400 font-serif">密室逃脱组队</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-serif text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-wine-800/50 text-gold-300 border border-gold-600/30'
                      : 'text-midnight-300 hover:text-gold-300 hover:bg-midnight-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
