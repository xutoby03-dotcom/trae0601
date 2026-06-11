import { Cat, Scale, Calendar, UtensilsCrossed, MapPin, FileText } from 'lucide-react';
import { PetProfile } from '@/types';
import { calculateReferenceWater } from '@/utils/waterCalculator';

interface PetCardProps {
  pet: PetProfile;
  onEdit?: () => void;
  delay?: number;
}

export default function PetCard({ pet, onEdit, delay = 0 }: PetCardProps) {
  const referenceWater = calculateReferenceWater(pet.weight, pet.waterBaseCoefficient);
  
  const infoItems = [
    { icon: Scale, label: '体重', value: `${pet.weight} kg` },
    { icon: Calendar, label: '年龄', value: `${pet.age} 岁` },
    { icon: UtensilsCrossed, label: '主食', value: pet.foodType },
    { icon: MapPin, label: '水盆位置', value: pet.bowlLocation },
  ];
  
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <Cat size={32} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
          <p className="text-sm text-gray-500">每日参考饮水：{referenceWater} ml</p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
          >
            编辑
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <Icon size={16} className="text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-700">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {pet.healthNotes && (
        <div className="mt-4 p-3 rounded-lg bg-warning-50 border border-warning-100">
          <div className="flex items-start gap-2">
            <FileText size={16} className="text-warning-500 mt-0.5" />
            <div>
              <p className="text-xs text-warning-600 font-medium">健康备注</p>
              <p className="text-sm text-gray-700 mt-0.5">{pet.healthNotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
