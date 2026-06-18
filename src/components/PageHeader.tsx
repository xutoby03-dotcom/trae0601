import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function PageHeader({ title, subtitle, icon, actions, onRefresh, isRefreshing }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-caramel-500 to-caramel-600 flex items-center justify-center text-white shadow-lg">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-serif font-bold text-caramel-900">{title}</h1>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="刷新数据"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
