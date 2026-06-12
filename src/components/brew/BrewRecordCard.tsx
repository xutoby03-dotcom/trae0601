import { FC } from 'react';
import { BrewRecord, CoffeeBean } from '../../types';
import { formatDateTime, formatBrewTime, calculateRatio } from '../../utils/helpers';
import Tag from '../ui/Tag';
import { Star, Trash2, Droplets, Thermometer, Timer } from 'lucide-react';

interface BrewRecordCardProps {
  record: BrewRecord;
  bean?: CoffeeBean;
  onDelete: (id: string) => void;
}

const BrewRecordCard: FC<BrewRecordCardProps> = ({ record, bean, onDelete }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-[#D4A574] fill-[#D4A574]'
                : 'text-[#D4A574]/30'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#E8DFD3]" />
      <div className="absolute left-[-6px] top-2 w-3 h-3 rounded-full bg-[#D4A574] border-2 border-[#F5EFE6]" />

      <div className="bg-white rounded-2xl shadow-sm border border-[#E8DFD3] p-5 transition-all duration-300 hover:shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4
              className="text-base font-bold text-[#4A3728] mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {bean?.name || '未知豆子'}
            </h4>
            <p className="text-xs text-[#9B8B7D]">{formatDateTime(record.brewTime)}</p>
          </div>
          <button
            onClick={() => onDelete(record.id)}
            className="p-1.5 rounded-full text-[#B8A99A] hover:bg-[#FFE6E0] hover:text-[#C2563B] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-[#F5EFE6] rounded-xl p-2.5 text-center">
            <Droplets className="w-4 h-4 mx-auto mb-1 text-[#7BA05B]" />
            <p className="text-xs text-[#9B8B7D]">粉水比</p>
            <p className="text-sm font-semibold text-[#4A3728]">
              {calculateRatio(record.coffeeDose, record.waterAmount)}
            </p>
          </div>
          <div className="bg-[#F5EFE6] rounded-xl p-2.5 text-center">
            <Thermometer className="w-4 h-4 mx-auto mb-1 text-[#C2563B]" />
            <p className="text-xs text-[#9B8B7D]">水温</p>
            <p className="text-sm font-semibold text-[#4A3728]">{record.waterTemp}°C</p>
          </div>
          <div className="bg-[#F5EFE6] rounded-xl p-2.5 text-center">
            <Timer className="w-4 h-4 mx-auto mb-1 text-[#D4A574]" />
            <p className="text-xs text-[#9B8B7D]">萃取</p>
            <p className="text-sm font-semibold text-[#4A3728]">
              {formatBrewTime(record.brewTimeSec)}
            </p>
          </div>
          <div className="bg-[#F5EFE6] rounded-xl p-2.5 text-center">
            <div className="h-4 mx-auto mb-1 flex items-center justify-center">
              {renderStars(record.rating)}
            </div>
            <p className="text-xs text-[#9B8B7D]">评分</p>
            <p className="text-sm font-semibold text-[#4A3728]">{record.rating}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6B5748] mb-3">
          <span className="px-2 py-1 bg-[#F5EFE6] rounded-full">{record.equipment}</span>
          <span>{record.coffeeDose}g 粉 / {record.waterAmount}g 水</span>
        </div>

        {record.flavorTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {record.flavorTags.map((tag) => (
              <Tag key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}

        {record.notes && (
          <p className="text-sm text-[#6B5748] bg-[#F5EFE6] rounded-xl p-3">
            {record.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default BrewRecordCard;
