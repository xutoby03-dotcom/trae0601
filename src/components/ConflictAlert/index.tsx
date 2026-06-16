import { AlertTriangle, AlertCircle, Heart, Ghost, UserX, Zap, History } from 'lucide-react';
import type { Conflict } from '@/types';
import { cn } from '@/lib/utils';

interface ConflictAlertProps {
  conflicts: Conflict[];
  className?: string;
}

const typeConfig = {
  romance: { icon: Heart, label: '情感线' },
  horror: { icon: Ghost, label: '恐怖元素' },
  edge: { icon: UserX, label: '边缘位' },
  trigger: { icon: AlertTriangle, label: '雷点匹配' },
  crossdress: { icon: Zap, label: '反串' },
  gender: { icon: Zap, label: '性别不符' },
  historical: { icon: History, label: '历史题材' }
};

export default function ConflictAlert({ conflicts, className }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  const dangerCount = conflicts.filter(c => c.severity === 'danger').length;

  return (
    <div className={cn('rounded-xl border overflow-hidden', className)}>
      <div className={cn(
        'px-4 py-3 flex items-center gap-2 font-medium',
        dangerCount > 0
          ? 'bg-red-500/10 border-b border-red-500/30 text-red-300'
          : 'bg-amber-500/10 border-b border-amber-500/30 text-amber-300'
      )}>
        {dangerCount > 0 ? (
          <AlertCircle size={18} className="animate-pulse" />
        ) : (
          <AlertTriangle size={18} />
        )}
        <span>检测到 {conflicts.length} 个潜在冲突</span>
      </div>
      <div className="p-3 space-y-2 bg-slate-900/50">
        {conflicts.map((conflict, index) => {
          const config = typeConfig[conflict.type];
          const Icon = config.icon;
          return (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg text-sm',
                conflict.severity === 'danger'
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-amber-500/10 border border-amber-500/20'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                conflict.severity === 'danger' ? 'bg-red-500/30 text-red-300' : 'bg-amber-500/30 text-amber-300'
              )}>
                <Icon size={14} />
              </div>
              <div>
                <p className={cn(
                  'font-medium mb-0.5',
                  conflict.severity === 'danger' ? 'text-red-300' : 'text-amber-300'
                )}>
                  {config.label}
                </p>
                <p className="text-slate-400 text-xs">{conflict.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
