import type { RiskLevel } from '../types';
import { getRiskColor, getRiskLabel } from '../utils/riskCalculator';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge = ({ level, size = 'md' }: RiskBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full text-white ${getRiskColor(level)} ${sizeClasses[size]} transition-all duration-300`}
    >
      <span className="mr-1">{level === 'safe' ? '✓' : level === 'warning' ? '⚠' : '🚨'}</span>
      {getRiskLabel(level)}
    </span>
  );
};
