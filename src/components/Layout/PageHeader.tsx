import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 opacity-0 animate-fade-in-down">
      <div>
        <h1 className="mb-1">{title}</h1>
        {subtitle && (
          <p className="text-gray-500 text-sm">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
