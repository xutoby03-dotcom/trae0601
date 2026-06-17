import { Bell, Plus, Search, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';

interface NavbarProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  showAdd?: boolean;
  addAction?: () => void;
  searchAction?: () => void;
}

export default function Navbar({ title, showBack, showSearch, showAdd, addAction, searchAction }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useStore((state) => state.getUnreadReminderCount());

  const showBell = location.pathname !== '/reminders';

  return (
    <header className="sticky top-0 z-40 bg-warm-50/90 backdrop-blur-md border-b border-warm-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-warm-600 hover:bg-warm-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          ) : null}
          <h1 className="text-lg font-semibold text-warm-800">{title}</h1>
        </div>
        
        <div className="flex items-center gap-1">
          {showSearch && (
            <button
              onClick={searchAction}
              className="w-10 h-10 flex items-center justify-center rounded-full text-warm-500 hover:bg-warm-100 transition-colors"
            >
              <Search size={20} />
            </button>
          )}
          {showAdd && (
            <button
              onClick={addAction}
              className="w-10 h-10 flex items-center justify-center rounded-full text-sage-600 hover:bg-sage-50 transition-colors"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          )}
          {showBell && (
            <button
              onClick={() => navigate('/reminders')}
              className="w-10 h-10 -mr-2 relative flex items-center justify-center rounded-full text-warm-500 hover:bg-warm-100 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-coral-500 text-white text-[10px] font-medium rounded-full min-w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
