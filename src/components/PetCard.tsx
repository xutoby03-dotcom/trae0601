import { Heart, Calendar, Utensils, Ban, Phone } from 'lucide-react';
import type { Pet } from '../types';

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  const infoItems = [
    { icon: Heart, label: '性格', value: pet.personality.join(' · ') },
    { icon: Calendar, label: '年龄', value: `${pet.age} 岁` },
    { icon: Utensils, label: '食量', value: `${pet.foodAmount}g / 餐` },
    { icon: Ban, label: '忌口', value: pet.dietaryRestrictions.join(' · ') },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-orange-100/50 overflow-hidden">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={pet.photos[0]}
          alt={pet.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            {pet.name}
          </h2>
          <p className="text-white/90 text-lg">{pet.breed}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-[#FFFAF5] rounded-xl animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-[#FF8A3D]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-[#2D2A26] font-medium text-sm leading-relaxed">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center flex-shrink-0">
              <Phone size={20} className="text-[#4ECDC4]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">常用医院</p>
              <p className="text-[#2D2A26] font-bold">{pet.hospital.name}</p>
              <p className="text-sm text-gray-600 mt-1">📞 {pet.hospital.phone}</p>
              <p className="text-sm text-gray-500 mt-1">📍 {pet.hospital.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
