import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: 'green' | 'blue' | 'orange' | 'red';
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'green',
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const colorClasses = {
    green: 'from-primary-400 to-primary-600',
    blue: 'from-sky-400 to-sky-600',
    orange: 'from-sun-400 to-sun-600',
    red: 'from-red-400 to-red-600',
  };

  const bgColorClasses = {
    green: 'bg-primary-50',
    blue: 'bg-sky-50',
    orange: 'bg-sun-50',
    red: 'bg-red-50',
  };

  const iconColorClasses = {
    green: 'text-primary-600',
    blue: 'text-sky-600',
    orange: 'text-sun-600',
    red: 'text-red-600',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  return (
    <div
      className={`card card-hover ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-forest-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold font-serif ${iconColorClasses[color]} animate-count`}>
            {displayValue}
          </p>
          {trend && (
            <p
              className={`text-xs mt-2 flex items-center gap-1 ${
                trend.isPositive ? 'text-primary-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% 较上周
            </p>
          )}
        </div>
        <div
          className={`w-14 h-14 rounded-2xl ${bgColorClasses[color]} flex items-center justify-center bg-gradient-to-br ${colorClasses[color]} bg-opacity-20`}
        >
          <Icon size={28} className={`${iconColorClasses[color]}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
