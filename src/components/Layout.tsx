import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ChefHat, Package, BarChart3, Flame } from 'lucide-react';
import { usePotStore } from '../store/usePotStore';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', label: '锅况总览', icon: Home },
  { to: '/cooking-record', label: '续煮记录', icon: ChefHat },
  { to: '/production', label: '出品记录', icon: Package },
  { to: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Layout() {
  const navigate = useNavigate();
  const { pots, selectedPotId, setSelectedPotId, getAlertPots } = usePotStore();
  const alertPots = getAlertPots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <header className="bg-gradient-to-r from-braised-red-800 to-braised-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-gold-400 rounded-xl flex items-center justify-center shadow-md">
                <Flame className="w-7 h-7 text-braised-red-800" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide">卤锅续煮台账</h1>
                <p className="text-amber-100 text-sm">后厨交班 · 品质追溯</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {alertPots.length > 0 && (
                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full animate-pulse-slow">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
                  <span className="text-sm font-medium">{alertPots.length} 锅告警</span>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm text-amber-100">当前操作员</p>
                <p className="font-medium">张师傅</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2',
                    isActive
                      ? 'text-braised-red-700 border-braised-red-600 bg-braised-red-50'
                      : 'text-stone-600 border-transparent hover:text-braised-red-600 hover:bg-stone-50'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-48 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
                <h3 className="font-medium text-stone-700 text-sm">卤锅列表</h3>
              </div>
              <div className="p-2 space-y-1">
                {pots.map((pot) => (
                  <button
                    key={pot.id}
                    onClick={() => {
                      setSelectedPotId(pot.id);
                      navigate(`/pot/${pot.id}`);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm',
                      selectedPotId === pot.id
                        ? 'bg-braised-red-100 text-braised-red-800 font-medium'
                        : 'hover:bg-stone-100 text-stone-700'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{pot.name}</span>
                      {pot.status === 'danger' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                      {pot.status === 'warning' && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      )}
                    </div>
                    <div className="mt-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pot.soupLevel < 30
                            ? 'bg-red-500'
                            : pot.soupLevel < 50
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        )}
                        style={{ width: `${pot.soupLevel}%` }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
