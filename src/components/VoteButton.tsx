import { ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { VoteType } from '../types';

interface VoteButtonProps {
  type: 'want_to_watch' | 'dont_want_to_watch' | 'watched';
  active: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
}

const configs = {
  want_to_watch: {
    Icon: ThumbsUp,
    label: '想看',
    activeBg: 'bg-emerald-500',
    activeText: 'text-white',
    activeShadow: 'shadow-emerald-500/50',
    border: 'border-emerald-500/30',
    hover: 'hover:bg-emerald-500/10 hover:border-emerald-500/50',
    text: 'text-emerald-400',
  },
  dont_want_to_watch: {
    Icon: ThumbsDown,
    label: '不想看',
    activeBg: 'bg-rose-500',
    activeText: 'text-white',
    activeShadow: 'shadow-rose-500/50',
    border: 'border-rose-500/30',
    hover: 'hover:bg-rose-500/10 hover:border-rose-500/50',
    text: 'text-rose-400',
  },
  watched: {
    Icon: Eye,
    label: '看过',
    activeBg: 'bg-sky-500',
    activeText: 'text-white',
    activeShadow: 'shadow-sky-500/50',
    border: 'border-sky-500/30',
    hover: 'hover:bg-sky-500/10 hover:border-sky-500/50',
    text: 'text-sky-400',
  },
};

export default function VoteButton({
  type,
  active,
  count,
  onClick,
  disabled,
}: VoteButtonProps) {
  const cfg = configs[type];
  const { Icon } = cfg;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-semibold transition-all duration-200',
        'active:scale-95 min-h-[44px]',
        active
          ? [cfg.activeBg, cfg.activeText, 'shadow-lg', cfg.activeShadow, 'border-transparent']
          : [
              'bg-white/5 text-white/70',
              cfg.border,
              cfg.hover,
              disabled ? 'opacity-50 cursor-not-allowed' : '',
            ]
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 transition-transform duration-200',
          active ? 'scale-110' : 'group-hover:scale-110'
        )}
      />
      <span>{cfg.label}</span>
      <span
        className={cn(
          'px-1.5 py-0.5 rounded-full text-xs font-bold',
          active ? 'bg-white/20' : 'bg-white/10',
          active ? cfg.activeText : cfg.text
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function getVoteButtonConfig(type: VoteType) {
  return type ? configs[type] : null;
}
