import { Bell, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const today = new Date();

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
          <Calendar className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium">
            {format(today, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
          </span>
        </div>

        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group">
          <Bell className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800">家庭用户</p>
            <p className="text-xs text-gray-500">管理员</p>
          </div>
        </div>
      </div>
    </header>
  );
}
