import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { AlertCard } from '@/components/common/AlertCard';

export const Header = () => {
  const { currentUser, alerts, logout, getUnreadAlertsCount, markAllAlertsRead } = useAppStore();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = getUnreadAlertsCount();
  const unreadAlerts = alerts.filter(a => !a.isRead).slice(0, 5);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="10" rx="2" />
            <path d="M15 7V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2" />
            <path d="M15 17v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">共享充电线管理</h1>
          <p className="text-xs text-gray-500">智能借还 · 全流程追溯</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">消息提醒</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAlertsRead()}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto p-3 space-y-2">
                {unreadAlerts.length > 0 ? (
                  unreadAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    暂无新消息
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.name || '未登录'}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser?.isAdmin ? '管理员' : currentUser?.department || '请选择身份'}
              </p>
            </div>
          </button>

          {showUserMenu && currentUser && (
            <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.employeeNo}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
