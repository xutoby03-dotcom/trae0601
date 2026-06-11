interface Props {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function LifeProgressBar({ percentage, showLabel = true, size = 'md' }: Props) {
  const getColor = () => {
    if (percentage >= 85) return 'bg-gradient-to-r from-danger-500 to-red-400';
    if (percentage >= 60) return 'bg-gradient-to-r from-caution-500 to-yellow-400';
    return 'bg-gradient-to-r from-fresh-500 to-emerald-400';
  };

  const getStatusText = () => {
    if (percentage >= 95) return '建议退役';
    if (percentage >= 85) return '即将退役';
    if (percentage >= 60) return '中度磨损';
    if (percentage >= 30) return '状态良好';
    return '崭新出厂';
  };

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="w-full">
      <div className={`progress-track ${heightClass}`}>
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-xs text-gray-400">{getStatusText()}</span>
          <span className="text-xs font-medium text-gray-200">{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
