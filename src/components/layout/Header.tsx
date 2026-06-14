import { useMemo } from 'react';
import { Bell, Search, User, Settings, RefreshCw } from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import { formatDate } from '@/utils/date';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const inspections = useInspectionStore((state) => state.inspections);
  const refreshData = useInspectionStore((state) => state.refreshData);

  const { overdueCount, fireExitCount } = useMemo(() => {
    const overdue = inspections.filter((i) => i.status === 'overdue' || i.status === 'recheck').length;
    const fireExit = inspections.filter((i) => i.isFireExit && i.status !== 'cleaned').length;
    return { overdueCount: overdue, fireExitCount: fireExit };
  }, [inspections]);

  const today = formatDate(new Date().toISOString(), 'yyyy年MM月dd日 EEEE');

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索记录..."
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={refreshData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="刷新数据"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="relative">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              {(overdueCount > 0 || fireExitCount > 0) && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
                  {overdueCount + fireExitCount}
                </span>
              )}
            </button>
          </div>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-medium">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">物业管理员</p>
              <p className="text-xs text-gray-400">{today}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
