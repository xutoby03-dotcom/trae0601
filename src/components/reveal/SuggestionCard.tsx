import { Droplet, TrendingUp, Sparkles, Citrus, Cookie, BarChart2, Settings, Star } from 'lucide-react';
import type { Suggestion } from '@/types';
import { Card, CardContent } from '@/components/common/Card';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  droplet: Droplet,
  'trending-up': TrendingUp,
  sparkles: Sparkles,
  citrus: Citrus,
  cookie: Cookie,
  'bar-chart-2': BarChart2,
  settings: Settings,
  star: Star,
};

const priorityStyles: Record<Suggestion['priority'], string> = {
  high: 'border-l-4 border-l-red-500 bg-red-50/50',
  medium: 'border-l-4 border-l-amber-500 bg-amber-50/50',
  low: 'border-l-4 border-l-green-500 bg-green-50/50',
};

const priorityLabels: Record<Suggestion['priority'], string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '建议参考',
};

const priorityBadgeStyles: Record<Suggestion['priority'], string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
}

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const Icon = iconMap[suggestion.icon] || Star;

  return (
    <Card
      className={cn(
        'animate-slide-up',
        priorityStyles[suggestion.priority]
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-coffee-700 flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-coffee-900">{suggestion.title}</h4>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                priorityBadgeStyles[suggestion.priority]
              )}>
                {priorityLabels[suggestion.priority]}
              </span>
            </div>
            <p className="text-sm text-coffee-700 leading-relaxed">
              {suggestion.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
