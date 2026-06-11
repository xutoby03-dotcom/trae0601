import { Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function Empty({ icon, title, description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 via-cream-100 to-accent-100 flex items-center justify-center mb-5 shadow-soft">
        {icon || <Sparkles className="w-12 h-12 text-primary-400" />}
      </div>
      <h3 className="text-xl font-bold text-ink-900 mb-2">{title}</h3>
      {description && (
        <p className="text-ink-500 max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
