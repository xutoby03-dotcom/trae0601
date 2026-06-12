import { Material, Delivery } from '@/types';
import {
  calculateReceivedQuantity,
  getMaterialStatus,
  getStatusText,
  getStatusColor,
  formatDate,
} from '@/utils/helpers';
import Badge from '../common/Badge';
import { Package, Calendar, MapPin } from 'lucide-react';

interface MaterialCardProps {
  material: Material;
  deliveries: Delivery[];
  onClick: () => void;
}

const MaterialCard = ({ material, deliveries, onClick }: MaterialCardProps) => {
  const receivedQuantity = calculateReceivedQuantity(material.id, deliveries);
  const status = getMaterialStatus(material, deliveries);
  const progress = Math.min(
    (receivedQuantity / material.orderQuantity) * 100,
    100
  );

  const statusColor = {
    pending: 'bg-gray-200',
    partial: 'bg-amber-400',
    complete: 'bg-emerald-500',
    delayed: 'bg-red-500',
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5"
    >
      <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {material.photo ? (
          <img
            src={material.photo}
            alt={material.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge
            className={getStatusColor(status)}
            size="sm"
          >
            {getStatusText(status)}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
            {material.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-1">
            {material.brand} · {material.specification}
          </p>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-500">到货进度</span>
            <span className="font-medium text-gray-700">
              {receivedQuantity}/{material.orderQuantity}
              {material.unit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusColor[status]}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(material.expectedDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{material.room}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
