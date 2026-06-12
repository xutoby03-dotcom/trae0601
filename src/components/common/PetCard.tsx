import { useNavigate } from 'react-router-dom';
import { Building2, Phone, User } from 'lucide-react';
import { PetWithStatus } from '../../../shared/types';
import { StatusBadge } from './StatusBadge';

interface PetCardProps {
  pet: PetWithStatus;
}

const typeEmoji: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  other: '🐾',
};

export function PetCard({ pet }: PetCardProps) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(`/pets/${pet.id}`)}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {pet.photoUrl ? (
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl opacity-40">
            {typeEmoji[pet.type]}
          </div>
        )}
        <div className="absolute right-3 top-3">
          <StatusBadge status={pet.status} size="sm" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/60 to-transparent p-3 pt-10">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5 text-lg font-semibold">
              <span aria-hidden>{typeEmoji[pet.type]}</span>
              <span>{pet.name}</span>
            </div>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur">
              {pet.breed}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate">{pet.ownerName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          <span>{pet.building}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-mono">{pet.phone}</span>
        </div>
        {!pet.hasProofPhoto && pet.status !== 'unvaccinated' && (
          <div className="mt-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 ring-1 ring-amber-200">
            ⚠️ 缺少免疫证明照片
          </div>
        )}
      </div>
    </button>
  );
}
