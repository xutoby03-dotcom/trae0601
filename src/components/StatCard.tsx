import { Utensils, Trash2, Pill } from 'lucide-react';
import type { Report } from '../types';
import { cn } from '../utils/helpers';

interface StatCardProps {
  report: Report;
}

const statConfig = [
  { key: 'remainingFood', label: '剩余猫粮', icon: Utensils, color: 'orange', unit: '%' },
  { key: 'remainingLitter', label: '剩余猫砂', icon: Trash2, color: 'teal', unit: '%' },
  { key: 'remainingMedicine', label: '剩余药量', icon: Pill, color: 'pink', unit: '%' },
] as const;

const colorClasses: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    gradient: 'from-orange-400 to-orange-500',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    border: 'border-teal-200',
    gradient: 'from-teal-400 to-teal-500',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    gradient: 'from-pink-400 to-pink-500',
  },
};

export default function StatCard({ report }: StatCardProps) {
  const getConicGradient = (percentage: number, colorKey: string) => {
    const colors = colorClasses[colorKey];
    const stops = `, ${colors.gradient.replace('from-', '').replace('to-', '')}`;
    return `conic-gradient(from 0deg, var(--tw-gradient-stops) ${percentage}%, #f3f4f6 ${percentage}%)`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statConfig.map((stat, index) => {
        const Icon = stat.icon;
        const value = report[stat.key];
        const colors = colorClasses[stat.color];
        
        return (
          <div
            key={stat.key}
            className={cn(
              'p-6 rounded-2xl bg-white shadow-lg border-2',
              colors.border,
              'animate-slideUp'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(from 0deg, #FF8A3D 0deg ${value * 3.6}deg, #f3f4f6 ${value * 3.6}deg 360deg)`,
                  }}
                >
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <span className={cn('text-xl font-bold', colors.text)}>
                      {value}{stat.unit}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-2',
                  colors.bg
                )}>
                  <Icon size={20} className={colors.text} />
                </div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r transition-all duration-1000',
                    colors.gradient
                  )}
                  style={{ width: `${value}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {value > 50 ? '库存充足' : value > 20 ? '库存偏低' : '急需补充'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
