import { Bell, Search, ChevronDown, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useState, useMemo } from 'react';

export function Topbar() {
  const currentUser = useAppStore((s) => s.currentUser);
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pendingCount = useMemo(() => borrowRecords.filter((r) => r.status === '待审批').length, [borrowRecords]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="全局搜索档案箱编号、合同号、客户名..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700">
              <User size={16} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-navy-800 leading-tight">{currentUser.realName}</p>
              <p className="text-xs text-gray-500">{currentUser.department}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-sm font-medium text-navy-800">{currentUser.realName}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">个人设置</button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">退出登录</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
