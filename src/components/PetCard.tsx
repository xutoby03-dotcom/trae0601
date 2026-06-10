import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone } from 'lucide-react';
import type { PetMissing } from '@/types';
import { StatusBadge } from './StatusBadge';
import { getTimeAgo } from '@/utils/time';
import { cn } from '@/lib/utils';

interface PetCardProps {
  pet: PetMissing;
  className?: string;
}

const sizeLabels = { small: '小型', medium: '中型', large: '大型' };
const speciesLabels = { cat: '猫', dog: '狗' };

export function PetCard({ pet, className }: PetCardProps) {
  return (
    <Link
      to={`/detail/${pet.id}`}
      className={cn(
        "group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-200",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pet.photos[0]}
          alt={pet.petName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={pet.status} urgent={pet.urgent} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white font-bold text-xl drop-shadow-lg">{pet.petName}</h3>
              <p className="text-white/90 text-sm drop-shadow">
                {speciesLabels[pet.species]} · {pet.breed} · {sizeLabels[pet.size]}
              </p>
            </div>
            <div className="text-white/80 text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
              {pet.color}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="truncate">{pet.lastLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span>走失 {getTimeAgo(pet.lostTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span>{pet.contact}</span>
        </div>

        {pet.status === 'found' && pet.foundTime && (
          <div className="mt-2 pt-3 border-t border-gray-100">
            <p className="text-green-600 text-sm font-medium">
              🎉 {getTimeAgo(pet.foundTime)}已找回
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
