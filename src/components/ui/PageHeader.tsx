import { clsx } from 'clsx';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={clsx('flex items-end justify-between mb-6', actions ? '' : '')}>
      <div>
        <h1 className="text-2xl font-serif font-semibold text-navy-900 mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
