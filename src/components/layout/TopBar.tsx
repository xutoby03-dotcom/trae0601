import { Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export default function TopBar() {
  const alerts = useStore((s) => s.alerts);
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => alerts.filter((a) => a.status === 'unread').length,
    [alerts]
  );

  return (
    <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">宠物医院术后回访系统</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/alerts')}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
