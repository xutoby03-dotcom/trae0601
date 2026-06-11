import { Link } from 'react-router-dom';
import { Edit2, Calendar } from 'lucide-react';
import type { Pet } from '@/types';
import { speciesLabel } from '@/utils';

interface PetCardProps {
  pet: Pet;
  onEdit?: (id: string) => void;
}

export default function PetCard({ pet }: PetCardProps) {
  return (
    <Link
      to={`/pets/${pet.id}`}
      className="card group block hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          {pet.avatarUrl ? (
            <img
              src={pet.avatarUrl}
              alt={pet.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-brand-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-4xl">
              {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                {pet.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="tag bg-brand-50 text-brand-700">
                  {speciesLabel[pet.species]}
                </span>
                {pet.breed && (
                  <span className="text-sm text-slate-500">{pet.breed}</span>
                )}
              </div>
            </div>
            <Link
              to={`/pets/${pet.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all duration-200"
            >
              <Edit2 size={16} />
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {pet.age} 岁
            </span>
            {pet.allergies && (
              <span className="truncate max-w-[120px]" title={pet.allergies}>
                ⚠️ {pet.allergies}
              </span>
            )}
          </div>

          {pet.foodBrand && (
            <div className="mt-2 text-sm">
              <span className="text-slate-400">常用粮：</span>
              <span className="text-slate-600 font-medium">{pet.foodBrand}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
