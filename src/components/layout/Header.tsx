import { useState } from 'react';
import { Bell, Search, RotateCcw, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { notifications, markNotificationRead, markAllNotificationsRead, resetData } = useAppStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue': return 'border-l-red-500 bg-red-50';
      case 'lowBattery': return 'border-l-orange-500 bg-orange-50';
      case 'maintenance': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue': return '🔴';
      case 'lowBattery': return '🟠';
      case 'maintenance': return '🟡';
      default: return 'ℹ️';
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
      resetData();
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索遥控器编号、会议室..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-all"
            title="重置数据"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce-in">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-slide-in-right">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">通知中心</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      全部已读
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      暂无通知
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-all animate-fade-in-up ${getNotificationColor(notification.type)} ${notification.read ? 'opacity-60' : ''}`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-2">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: zhCN })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
              管
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">管理员</p>
              <p className="text-xs text-gray-500">行政部</p>
            </div>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
}
