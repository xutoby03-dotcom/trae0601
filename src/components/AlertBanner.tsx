import { Link } from 'react-router-dom';
import { AlertTriangle, Clock } from 'lucide-react';
import type { Alert } from '@/types';

interface AlertBannerProps {
  alerts: Alert[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {alerts.map((alert) => {
        const isLowStock = alert.type === 'low-stock';

        return (
          <Link
            key={`${alert.beanId}-${alert.type}`}
            to={`/beans/${alert.beanId}`}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors duration-150 ${
              isLowStock
                ? 'bg-[#FEF3C7] border-amber-300 hover:bg-amber-100'
                : 'bg-[#FEE2E2] border-red-300 hover:bg-red-100'
            }`}
          >
            {isLowStock ? (
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            ) : (
              <Clock size={16} className="text-red-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${isLowStock ? 'text-amber-800' : 'text-red-800'}`}>
              {alert.beanName}
            </span>
            <span className={`text-sm ${isLowStock ? 'text-amber-700' : 'text-red-700'}`}>
              {alert.message}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
