import type { Package as PackageType } from 'shared/types.js';
import {
  AlertTriangle, Snowflake, DollarSign, Clock, MapPin, Phone, User, Box,
} from 'lucide-react';
import { formatDateTime, getTimeRemaining, COMPANY_COLORS } from '../lib/utils';

interface Props {
  pkg: PackageType & { isOverdue?: boolean };
  onAction?: (pkg: PackageType) => void;
  actionLabel?: string;
}

export default function PackageCard({ pkg, onAction, actionLabel }: Props) {
  const timeStatus = getTimeRemaining(pkg.createdAt);
  const isPriority = pkg.isFragile || pkg.isColdChain || pkg.isCod;
  const isOverdue = pkg.isOverdue || timeStatus.expired;

  return (
    <div
      className={`card p-5 transition-all duration-300 hover:shadow-card-hover group ${
        isOverdue ? 'ring-2 ring-accent-rose/30 border-accent-rose/30' : ''
      } ${
        isPriority ? 'ring-2 ring-accent-amber/30 border-accent-amber/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="tag font-semibold text-white"
            style={{ backgroundColor: COMPANY_COLORS[pkg.company] || '#64748b' }}
          >
            {pkg.company}
          </span>
          {pkg.isFragile && (
            <span className="tag bg-amber-100 text-amber-700">
              <AlertTriangle className="w-3 h-3" /> 易碎
            </span>
          )}
          {pkg.isColdChain && (
            <span className="tag bg-sky-100 text-sky-700">
              <Snowflake className="w-3 h-3" /> 冷链
            </span>
          )}
          {pkg.isCod && (
            <span className="tag bg-rose-100 text-rose-700">
              <DollarSign className="w-3 h-3" /> 到付
            </span>
          )}
          {isOverdue && (
            <span className="tag bg-accent-rose/10 text-accent-rose animate-pulse">
              <Clock className="w-3 h-3" /> {timeStatus.text}
            </span>
          )}
          {!isOverdue && (
            <span className="tag bg-slate-100 text-slate-600">
              <Clock className="w-3 h-3" /> {timeStatus.text}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <User className="w-4 h-4 text-slate-400" />
          <span className="font-medium">{pkg.recipientName}</span>
          <span className="text-slate-400">·</span>
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="font-mono">****{pkg.phoneLast4}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Box className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{pkg.trackingNumber}</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded font-medium">
            {pkg.size}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>柜格 <span className="font-semibold text-primary-500">{pkg.lockerCode}</span></span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400 text-xs">{formatDateTime(pkg.createdAt)}</span>
        </div>
      </div>

      {onAction && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => onAction(pkg)}
            className="w-full btn-primary !py-2 text-sm"
          >
            {actionLabel || '取件'}
          </button>
        </div>
      )}
    </div>
  );
}
