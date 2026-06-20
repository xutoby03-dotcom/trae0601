import { Calendar, Droplets, MapPin, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PerfumeRecord } from '@/types';
import { SceneTags } from './SceneTags';
import { StarRating } from './ScoreDisplay';

interface PerfumeCardProps {
  perfume: PerfumeRecord;
  index?: number;
}

export function PerfumeCard({ perfume, index = 0 }: PerfumeCardProps) {
  const avgScore = (perfume.skinScore + perfume.clothScore) / 2;
  
  return (
    <Link
      to={`/perfume/${perfume.id}`}
      className="group block"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative h-full overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-stone-200">
        <div className="absolute top-0 right-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-amber-100/50 to-rose-100/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
        
        <div className="relative">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">{perfume.brand}</p>
              <h3 className="mt-1 font-serif text-xl font-bold text-stone-800">
                {perfume.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StarRating score={Math.round(avgScore)} size="sm" />
              <span className="text-xs text-stone-500">{avgScore.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="mb-4 inline-block rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
            {perfume.scentFamily}
          </p>
          
          <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-stone-400" />
              <span className="truncate">{perfume.sprayLocation}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-stone-400" />
              <span>{perfume.weather}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-stone-400" />
              <span>湿度 {perfume.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-stone-400" />
              <span>{perfume.createdAt}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-stone-100 pt-4">
            <SceneTags scenes={perfume.scenes} size="sm" />
            <span className="text-xs font-medium text-stone-400 transition-colors group-hover:text-amber-600">
              查看详情 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
