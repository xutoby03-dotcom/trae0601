import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpenCheck, PlusCircle, BarChart3, UserCircle2, Search, BookMarked } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { isDateOverdue } from '@/utils/dateUtils';

const navLinks = [
  { to: '/', label: '书柜', icon: BookOpenCheck },
  { to: '/register', label: '登记新书', icon: PlusCircle },
  { to: '/statistics', label: '流转统计', icon: BarChart3 },
  { to: '/profile', label: '我的', icon: UserCircle2 },
];

export const Header = () => {
  const location = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const books = useAppStore((s) => s.books);

  const overdueCount = borrowRecords.filter((r) => {
    if (r.action !== 'borrow' || !r.expectedReturnDate || r.userId !== currentUser?.id) return false;
    const hasReturned = borrowRecords.some(
      (rr) =>
        rr.action === 'return' &&
        rr.bookId === r.bookId &&
        rr.userId === r.userId &&
        new Date(rr.createdAt).getTime() > new Date(r.createdAt).getTime()
    );
    return !hasReturned && isDateOverdue(r.expectedReturnDate);
  }).length;

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 bg-wood-700/95 backdrop-blur-sm border-b-4 border-wood-800 shadow-lg">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-orange to-[#D8603A] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <BookMarked className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-olive border-2 border-wood-700"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-lg font-bold text-paper-50 tracking-wide">漂流书柜</span>
              <span className="text-[10px] text-wood-200 -mt-0.5">让好书流动起来</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              const showBadge = to === '/profile' && overdueCount > 0;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${active
                      ? 'bg-white/15 text-paper-50 shadow-inner'
                      : 'text-wood-100 hover:bg-white/8 hover:text-paper-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-brick text-white text-[10px] font-bold flex items-center justify-center animate-breathe shadow-md">
                      {overdueCount > 9 ? '9+' : overdueCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-wood-300" />
              <input
                type="text"
                placeholder="搜书名/作者..."
                className="pl-9 pr-4 py-2 w-44 lg:w-56 rounded-lg bg-wood-800/50 text-paper-50 placeholder:text-wood-300 text-sm border border-wood-600 focus:outline-none focus:ring-2 focus:ring-accent-orange/50 focus:border-accent-orange transition-all"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-wood-800/60 border border-wood-600">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-olive to-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {currentUser?.nickname?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-paper-100 font-medium hidden lg:block">
                {currentUser?.nickname || '访客'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex md:hidden items-center justify-around h-12 border-t border-wood-800 -mx-4 px-4 gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            const showBadge = to === '/profile' && overdueCount > 0;
            return (
              <NavLink
                key={to}
                to={to}
                className={`relative flex-1 py-1.5 rounded-md flex flex-col items-center gap-0.5 transition-all
                  ${active ? 'text-paper-50 bg-white/10' : 'text-wood-200 hover:text-paper-50'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{label}</span>
                {showBadge && (
                  <span className="absolute top-0 right-2 min-w-[16px] h-4 px-1 rounded-full bg-accent-brick text-white text-[9px] font-bold flex items-center justify-center">
                    {overdueCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
