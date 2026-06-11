import { Link } from 'react-router-dom';
import { Snowflake, AlertTriangle, Wine, Clock, Check } from 'lucide-react';
import type { PackageItem } from '@/types';
import { STATUS_LABELS } from '@/types';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
}

function isOverdueCheck(pkg: PackageItem): boolean {
  if (pkg.status === 'picked_up') return false;
  const created = new Date(pkg.createdAt).getTime();
  const hoursDiff = (Date.now() - created) / 3600000;
  if (pkg.isColdChain) return hoursDiff > 4;
  return hoursDiff > 48;
}

interface PackageCardProps {
  pkg: PackageItem;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const overdue = isOverdueCheck(pkg);

  return (
    <div
      className={`relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md animate-slide-in ${
        pkg.isColdChain
          ? 'border-ice-300 shadow-ice-100/50'
          : overdue
          ? 'border-coral-300 shadow-coral-100/50'
          : 'border-warm-300/50'
      }`}
    >
      {pkg.isColdChain && (
        <div className="absolute -top-2 -right-2 bg-ice-400 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-pulse-slow">
          <Snowflake className="w-3.5 h-3.5" />
        </div>
      )}

      {overdue && pkg.status !== 'picked_up' && (
        <div className="absolute -top-2 -left-2 bg-coral-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-pulse-slow">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="flex items-start p-4 gap-4">
        <div className="shrink-0 w-1 h-16 rounded-full bg-primary-500" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-primary-800 text-sm truncate">{pkg.recipientName}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
              {pkg.department}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-400" />
              {pkg.courierCompany}
            </span>
            <span>取件码: <span className="font-mono font-semibold text-primary-700">{pkg.pickupCode}</span></span>
            <span>货架: <span className="font-semibold text-primary-700">{pkg.shelfLocation}</span></span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(pkg.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                pkg.status === 'new'
                  ? 'bg-indigo-100 text-indigo-700'
                  : pkg.status === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : pkg.status === 'picked_up'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-coral-100 text-coral-700'
              }`}
            >
              {STATUS_LABELS[pkg.status]}
            </span>
            {pkg.isFragile && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium flex items-center gap-1">
                <Wine className="w-3 h-3" />
                易碎
              </span>
            )}
            {pkg.isColdChain && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-ice-50 text-ice-700 font-medium flex items-center gap-1">
                <Snowflake className="w-3 h-3" />
                冷藏
              </span>
            )}
            {overdue && pkg.status !== 'picked_up' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-coral-50 text-coral-600 font-medium animate-pulse-slow">
                ⚠ 超时未取
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          {pkg.status !== 'picked_up' && (
            <Link
              to={`/pickup/${pkg.id}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-sm"
            >
              签收
            </Link>
          )}
          {pkg.pickedUpAt && (
            <div className="text-right space-y-0.5">
              <div className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                <Check className="w-3.5 h-3.5" />
                已签收
              </div>
              {pkg.signedBy && (
                <p className="text-xs text-warm-500">签收人：{pkg.signedBy}</p>
              )}
              <p className="text-xs text-warm-400">
                {new Date(pkg.pickedUpAt).toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
