import { cn } from '@/lib/utils';

interface AmountCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  className?: string;
  highlight?: boolean;
}

export function AmountCard({ title, amount, subtitle, className, highlight }: AmountCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md',
        highlight && 'ring-2 ring-teal-500 ring-offset-2',
        className
      )}
    >
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p
        className={cn(
          'mt-2 text-3xl font-bold font-mono tabular-nums',
          highlight ? 'text-teal-600' : 'text-gray-900'
        )}
      >
        ¥{amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}
