import { useLocation, Link } from 'react-router-dom';
import { Palette, ClipboardList, AlertTriangle, Printer } from 'lucide-react';

const navItems = [
  { path: '/', label: '驯化计划', Icon: Palette },
  { path: '/record', label: '观察记录', Icon: ClipboardList },
  { path: '/alert', label: '异常预警', Icon: AlertTriangle },
  { path: '/handover', label: '交接卡', Icon: Printer },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#060e1a] via-[#0a1628] to-[#0d1f3c]">
      <aside className="group print:hidden flex flex-col items-center h-screen bg-[#0a1628] border-r border-[#132744] w-20 hover:w-56 transition-all duration-300 ease-in-out overflow-hidden shrink-0">
        <div className="flex flex-col items-center pt-6 pb-4 w-full">
          <span className="text-3xl leading-none">🪼</span>
          <span
            className="mt-2 text-sm font-semibold tracking-widest text-[#00e5c7] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            灯谱驯化
          </span>
        </div>

        <nav className="flex flex-col gap-2 w-full px-2 mt-4">
          {navItems.map(({ path, label, Icon }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-[#00e5c7]/10 text-[#00e5c7] shadow-[0_0_12px_rgba(0,229,199,0.15)]'
                      : 'text-[#5a7a9b] hover:bg-[#132744] hover:text-[#8ab4d8]'
                  }
                `}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,229,199,0.5)]' : ''}`}
                />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
