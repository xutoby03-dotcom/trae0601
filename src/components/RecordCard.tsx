import { Droplets, Zap, CircleDot } from 'lucide-react';
import { WaterRecord } from '@/types';
import StatusBadge from './StatusBadge';
import { calculateWaterConsumed, calculateStatus, calculateReferenceWater } from '@/utils/waterCalculator';
import { formatDateChinese, formatWeekday } from '@/utils/date';
import { PetProfile } from '@/types';

interface RecordCardProps {
  record: WaterRecord;
  pet: PetProfile;
  onClick?: () => void;
  delay?: number;
}

export default function RecordCard({ record, pet, onClick, delay = 0 }: RecordCardProps) {
  const waterConsumed = calculateWaterConsumed(record.waterAdded, record.waterRemaining);
  const referenceWater = calculateReferenceWater(pet.weight, pet.waterBaseCoefficient);
  const status = calculateStatus(waterConsumed, referenceWater);
  const percentage = Math.round((waterConsumed / referenceWater) * 100);
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl p-4 shadow-sm border border-gray-100
        hover:shadow-md hover:border-primary-200 transition-all duration-200
        cursor-pointer opacity-0 animate-fade-in-up
      `}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-800">{formatDateChinese(record.date)}</p>
          <p className="text-xs text-gray-500">{formatWeekday(record.date)}</p>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-secondary-500" />
          <div>
            <p className="text-lg font-bold text-gray-800">{waterConsumed}</p>
            <p className="text-xs text-gray-500">ml 饮水</p>
          </div>
        </div>
        
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === 'normal' ? 'bg-success-500' :
              status === 'low' ? 'bg-warning-500' : 'bg-danger-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <p className="text-sm font-medium text-gray-600">{percentage}%</p>
      </div>
      
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <CircleDot size={14} className="text-primary-500" />
          <span className="text-xs text-gray-600">{record.urineClumps} 个尿团</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={14} className={record.fountainOn ? 'text-success-500' : 'text-gray-400'} />
          <span className={`text-xs ${record.fountainOn ? 'text-success-600' : 'text-gray-500'}`}>
            {record.fountainOn ? '饮水机开' : '饮水机关'}
          </span>
        </div>
      </div>
    </div>
  );
}
