import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function Empty({
  title = '暂无数据',
  description = '这里还没有内容',
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 px-4',
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full blur-2xl opacity-50" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-gray-100">
          <Inbox className="h-8 w-8 text-gray-400" />
        </div>
      </div>
      <p className="mt-4 text-base font-medium text-gray-600">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      )}
    </div>
  );
}
