import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
        {action && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
