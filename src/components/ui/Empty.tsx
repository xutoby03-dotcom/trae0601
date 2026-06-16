import { cn } from '@/utils/cn';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function Empty({
  title = '暂无数据',
  description = '这里空空如也，快来添加一些内容吧',
  icon,
  action,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      <div className="rounded-full bg-gray-100 p-4">
        {icon || <Inbox className="h-12 w-12 text-gray-400" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
