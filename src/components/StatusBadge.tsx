import {
  TagStatus,
  RequestStatus,
  TAG_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
} from '@/types';
import { CheckCircle, AlertTriangle, Clock, Wrench, XCircle } from 'lucide-react';

interface TagStatusBadgeProps {
  status: TagStatus;
}

export function TagStatusBadge({ status }: TagStatusBadgeProps) {
  const configs: Record<TagStatus, { bg: string; text: string; icon: typeof CheckCircle }> = {
    intact: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    removed: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
    damaged: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {TAG_STATUS_LABELS[status]}
    </span>
  );
}

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const configs: Record<RequestStatus, { bg: string; text: string; icon: typeof Clock }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    matched: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
    exchanged: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    manual: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Wrench },
    cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', icon: XCircle },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
