import { Link } from 'react-router-dom';
import { Package, AlertTriangle } from 'lucide-react';
import type { Toy } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, TAG_LABELS, TAG_COLORS } from '@/types';
import { cn } from '@/lib/utils';

interface ToyCardProps {
  toy: Toy;
}

export function ToyCard({ toy }: ToyCardProps) {
  return (
    <Link
      to={`/toy/${toy.id}`}
      className="group block bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-gradient-to-br from-primary-50 to-mint-50 flex items-center justify-center">
        {toy.photo ? (
          <img
            src={toy.photo}
            alt={toy.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🧸</div>
        )}
        {toy.isMissingParts && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle size={12} />
            缺件
          </div>
        )}
        <div className={cn(
          'absolute top-2 left-2 text-xs px-2.5 py-1 rounded-full font-medium',
          STATUS_COLORS[toy.status]
        )}>
          {STATUS_LABELS[toy.status]}
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-sm truncate mb-1.5 group-hover:text-primary-600 transition-colors">
          {toy.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Package size={12} />
          <span>{toy.storageBox}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {toy.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                TAG_COLORS[tag]
              )}
            >
              {TAG_LABELS[tag]}
            </span>
          ))}
          {toy.tags.length > 2 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              +{toy.tags.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
