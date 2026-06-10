import type { MissingStatus, GroupType } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: MissingStatus;
  urgent?: boolean;
  className?: string;
}

const statusConfig: Record<MissingStatus | 'urgent', { label: string; emoji: string; className: string }> = {
  missing: { label: '走失中', emoji: '😢', className: 'bg-red-100 text-red-700 border-red-200' },
  seen: { label: '有线索', emoji: '👀', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  found: { label: '已找回', emoji: '🎉', className: 'bg-green-100 text-green-700 border-green-200' },
  urgent: { label: '紧急', emoji: '🚨', className: 'bg-red-500 text-white border-red-600' },
};

const groupConfig: Record<GroupType, { label: string; emoji: string }> = {
  recent: { label: '刚走失', emoji: '🕐' },
  seen: { label: '疑似看到', emoji: '👀' },
  found: { label: '已找回', emoji: '🎉' },
  urgent: { label: '重点扩散', emoji: '🚨' },
};

export function StatusBadge({ status, urgent, className }: StatusBadgeProps) {
  if (urgent && status !== 'found') {
    const config = statusConfig.urgent;
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}>
        <span>{config.emoji}</span>
        {config.label}
      </span>
    );
  }

  const config = statusConfig[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
      config.className,
      className
    )}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}

export function GroupBadge({ group, active, onClick }: { 
  group: GroupType; 
  active: boolean; 
  onClick: () => void;
}) {
  const config = groupConfig[group];
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
        active 
          ? "bg-orange-500 text-white shadow-md shadow-orange-200" 
          : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600"
      )}
    >
      <span className="text-base">{config.emoji}</span>
      {config.label}
    </button>
  );
}
