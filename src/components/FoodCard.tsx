import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Clock, ChevronRight } from 'lucide-react';
import { FoodItem, CATEGORY_LABELS } from '../types';
import { AllergenBadge } from './AllergenBadge';
import { CountdownTimer } from './CountdownTimer';
import { getRemainingTime } from '../utils/time';

interface FoodCardProps {
  food: FoodItem;
  index?: number;
}

export function FoodCard({ food, index = 0 }: FoodCardProps) {
  const navigate = useNavigate();
  const { isExpired } = getRemainingTime(food.endTime, food.edibleHours);

  const isUnavailable = isExpired || food.status === 'fully_claimed' || food.status === 'disposed';

  const categoryColors = {
    fruit: 'from-green-400 to-emerald-500',
    snack: 'from-orange-400 to-amber-500',
    beverage: 'from-blue-400 to-cyan-500',
  };

  return (
    <div
      className={`
        group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl
        transition-all duration-300 cursor-pointer
        hover:-translate-y-1
        animate-fade-in-up
        ${isUnavailable ? 'opacity-60 grayscale' : ''}
      `}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => navigate(`/food/${food.id}`)}
    >
      <div className="relative h-48 overflow-hidden bg-warm-100">
        <img
          src={food.photoUrl}
          alt={food.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${categoryColors[food.category]} shadow-lg`}>
          {CATEGORY_LABELS[food.category]}
        </div>

        {food.isOpened ? (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-medium">
            已开封
          </div>
        ) : (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
            未开封
          </div>
        )}

        {food.status === 'fully_claimed' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">已领完</span>
          </div>
        )}

        {isExpired && food.status !== 'fully_claimed' && (
          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">已过期</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-coffee-800 line-clamp-1">{food.name}</h3>
        </div>

        <p className="text-sm text-coffee-500 line-clamp-2 mb-3 h-10">{food.description}</p>

        {food.allergens.length > 0 && (
          <div className="mb-3">
            <AllergenBadge allergens={food.allergens} size="sm" />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-coffee-500 mb-3">
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>剩{food.remaining}份</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-24">{food.meetingRoom}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-warm-100">
          <CountdownTimer endTime={food.endTime} edibleHours={food.edibleHours} />
          <div className="flex items-center gap-1 text-primary-500 font-medium text-sm group-hover:text-primary-600">
            去认领
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
