import type { Medicine } from '@/types';
import { Pill } from 'lucide-react';

interface Props {
  medicine: Medicine;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<string, string> = {
  白色: 'from-gray-100 to-gray-200 border-gray-300',
  浅粉色: 'from-pink-100 to-pink-200 border-pink-300',
  淡黄色: 'from-yellow-100 to-yellow-200 border-yellow-300',
  透明黄色: 'from-amber-100 to-amber-200 border-amber-300',
  蓝色: 'from-blue-100 to-blue-200 border-blue-300',
  绿色: 'from-green-100 to-green-200 border-green-300',
  红色: 'from-red-100 to-red-200 border-red-300',
  紫色: 'from-purple-100 to-purple-200 border-purple-300',
  橙色: 'from-orange-100 to-orange-200 border-orange-300',
};

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
};

export default function MedicineAvatar({ medicine, size = 'md' }: Props) {
  const gradient = colorMap[medicine.color] || 'from-gray-100 to-gray-200 border-gray-300';

  if (medicine.photoUrl) {
    return (
      <div className={`${sizeMap[size]} rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0`}>
        <img
          src={medicine.photoUrl}
          alt={medicine.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${gradient} border-2 border-white shadow-md flex items-center justify-center flex-shrink-0`}
    >
      <Pill
        className={`${
          size === 'lg' ? 'h-10 w-10' : size === 'md' ? 'h-7 w-7' : 'h-5 w-5'
        } text-white drop-shadow-sm`}
        strokeWidth={2}
      />
    </div>
  );
}
