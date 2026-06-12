import { FC, useState } from 'react';
import { CoffeeBean, ROAST_LEVEL_LABELS, PROCESS_METHOD_LABELS } from '../../types';
import { getStockStatus, getStockPercentage, formatDate } from '../../utils/helpers';
import Tag from '../ui/Tag';
import { Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';

interface CoffeeBeanCardProps {
  bean: CoffeeBean;
  onEdit: (bean: CoffeeBean) => void;
  onDelete: (id: string) => void;
  onBrew: (bean: CoffeeBean) => void;
}

const CoffeeBeanCard: FC<CoffeeBeanCardProps> = ({ bean, onEdit, onDelete, onBrew }) => {
  const [imageError, setImageError] = useState(false);
  const stockStatus = getStockStatus(bean);
  const stockPercent = getStockPercentage(bean);

  const statusConfig = {
    normal: {
      label: '充足',
      bgColor: 'bg-[#E8F0E0]',
      textColor: 'text-[#5A8A3B]',
      barColor: 'bg-[#7BA05B]',
    },
    low: {
      label: '快喝完了',
      bgColor: 'bg-[#FFF0E0]',
      textColor: 'text-[#C28B3B]',
      barColor: 'bg-[#D4A574]',
    },
    empty: {
      label: '已喝完',
      bgColor: 'bg-[#FFE6E0]',
      textColor: 'text-[#C2563B]',
      barColor: 'bg-[#C2563B]',
    },
  };

  const status = statusConfig[stockStatus];

  return (
    <div
      className={`group bg-white rounded-2xl shadow-sm border border-[#E8DFD3] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        stockStatus === 'empty' ? 'opacity-60' : ''
      }`}
    >
      <div className="relative h-44 overflow-hidden bg-[#E8DFD3]">
        {!imageError ? (
          <img
            src={bean.photoUrl}
            alt={bean.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-[#D4A574]" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
          >
            {stockStatus === 'low' && <AlertTriangle className="w-3 h-3" />}
            {status.label}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2A1F16]/80 to-transparent p-4">
          <h3
            className="text-lg font-bold text-white leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {bean.name}
          </h3>
          <p className="text-sm text-[#E8DFD3]">{bean.origin}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-0.5 bg-[#F5EFE6] text-[#6B5748] text-xs rounded-full">
            {ROAST_LEVEL_LABELS[bean.roastLevel]}
          </span>
          <span className="px-2 py-0.5 bg-[#F5EFE6] text-[#6B5748] text-xs rounded-full">
            {PROCESS_METHOD_LABELS[bean.processMethod]}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {bean.flavorTags.slice(0, 4).map((tag) => (
            <Tag key={tag} tag={tag} size="sm" />
          ))}
          {bean.flavorTags.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-[#9B8B7D]">
              +{bean.flavorTags.length - 4}
            </span>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#9B8B7D] mb-1.5">
            <span>剩余 {bean.remainingWeight}g</span>
            <span>{stockPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-[#E8DFD3] rounded-full overflow-hidden">
            <div
              className={`h-full ${status.barColor} rounded-full transition-all duration-500`}
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-[#6B5748] mb-4">
          <div>
            <p className="text-[#9B8B7D]">购买日期</p>
            <p className="font-medium text-[#4A3728]">{formatDate(bean.purchaseDate)}</p>
          </div>
          <div>
            <p className="text-[#9B8B7D]">价格</p>
            <p className="font-medium text-[#4A3728]">¥{bean.price}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onBrew(bean)}
            disabled={stockStatus === 'empty'}
            className="flex-1 py-2 rounded-full bg-[#4A3728] text-white text-sm font-medium hover:bg-[#3D2E20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            记录冲煮
          </button>
          <button
            onClick={() => onEdit(bean)}
            className="p-2 rounded-full bg-[#F5EFE6] text-[#6B5748] hover:bg-[#E8DFD3] hover:text-[#4A3728] transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(bean.id)}
            className="p-2 rounded-full bg-[#F5EFE6] text-[#9B8B7D] hover:bg-[#FFE6E0] hover:text-[#C2563B] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeBeanCard;
