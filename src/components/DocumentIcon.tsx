import { IdCard, Globe, Car, Plane, CreditCard, FileText } from 'lucide-react';
import type { DocumentType } from '@/types';

interface DocumentIconProps {
  type: DocumentType;
  className?: string;
}

export const DocumentIcon = ({ type, className = 'w-6 h-6' }: DocumentIconProps) => {
  const iconMap: Record<DocumentType, React.ReactNode> = {
    id_card: <IdCard className={className} />,
    passport: <Globe className={className} />,
    driver_license: <Car className={className} />,
    hk_macau_permit: <Plane className={className} />,
    bank_card: <CreditCard className={className} />,
    other: <FileText className={className} />,
  };

  const colorMap: Record<DocumentType, string> = {
    id_card: 'bg-blue-100 text-blue-600',
    passport: 'bg-emerald-100 text-emerald-600',
    driver_license: 'bg-amber-100 text-amber-600',
    hk_macau_permit: 'bg-purple-100 text-purple-600',
    bank_card: 'bg-rose-100 text-rose-600',
    other: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className={`p-2 rounded-lg ${colorMap[type]}`}>
      {iconMap[type]}
    </div>
  );
};
