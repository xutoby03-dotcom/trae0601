import {
  POSTER_STATUS_LABELS,
  APPLICATION_STATUS_LABELS,
  POSTING_STATUS_LABELS,
  EXCEPTION_STATUS_LABELS,
  EXCEPTION_TYPE_LABELS,
} from '../types';
import type {
  PosterStatus,
  ApplicationStatus,
  PostingStatus,
  ExceptionStatus,
  ExceptionType,
} from '../types';

type StatusType =
  | PosterStatus
  | ApplicationStatus
  | PostingStatus
  | ExceptionStatus
  | ExceptionType;

interface StatusBadgeProps {
  status: StatusType;
  type?: 'poster' | 'application' | 'posting' | 'exception' | 'exceptionType';
}

const statusColors: Record<string, string> = {
  // Poster status
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  posting: 'bg-blue-100 text-blue-700',
  posted: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-orange-100 text-orange-700',
  removed: 'bg-gray-100 text-gray-700',
  // Application status
  // pending, approved, rejected - same as above
  // Posting status
  // pending, posted, expired, removed - same as above
  // Exception status
  processing: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  // Exception types
  damaged: 'bg-red-100 text-red-700',
  covered: 'bg-orange-100 text-orange-700',
  unauthorized: 'bg-purple-100 text-purple-700',
  wrong_position: 'bg-amber-100 text-amber-700',
  expired_not_removed: 'bg-red-100 text-red-700',
};

const getLabel = (status: StatusType, type: StatusBadgeProps['type']): string => {
  switch (type) {
    case 'poster':
      return POSTER_STATUS_LABELS[status as PosterStatus];
    case 'application':
      return APPLICATION_STATUS_LABELS[status as ApplicationStatus];
    case 'posting':
      return POSTING_STATUS_LABELS[status as PostingStatus];
    case 'exception':
      return EXCEPTION_STATUS_LABELS[status as ExceptionStatus];
    case 'exceptionType':
      return EXCEPTION_TYPE_LABELS[status as ExceptionType];
    default:
      return String(status);
  }
};

export default function StatusBadge({ status, type = 'poster' }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-700';
  const label = getLabel(status, type);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}
