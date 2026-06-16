import { LayoutDashboard, CreditCard, Plus, RefreshCw } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface HeaderProps {
  onNewVisitor: () => void;
}

export const Header = ({ onNewVisitor }: HeaderProps) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-800">工牌回收看板</h1>
              <p className="text-xs text-neutral-500">Badge Recovery Dashboard</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isDashboard
                  ? 'bg-primary/10 text-primary'
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <LayoutDashboard size={18} />
              回收看板
            </NavLink>
            <NavLink
              to="/badges"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isDashboard
                  ? 'bg-primary/10 text-primary'
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <CreditCard size={18} />
              工牌管理
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isDashboard && (
            <button onClick={onNewVisitor} className="btn-primary">
              <Plus size={18} className="mr-1.5" />
              访客登记
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
