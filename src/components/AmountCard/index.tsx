import { formatCurrency } from '../../utils/format';

interface AmountCardProps {
  amount: number;
  label?: string;
  prefix?: string;
  className?: string;
}

export const AmountCard = ({
  amount,
  label = '总金额',
  prefix,
  className = '',
}: AmountCardProps) => {
  return (
    <div className={`card p-6 ${className}`}>
      {label && <p className="text-sm text-gray-500 mb-2">{prefix ? `${prefix} · ${label}` : label}</p>}
      <p className="text-3xl font-bold text-gray-900">{formatCurrency(amount)}</p>
    </div>
  );
};
