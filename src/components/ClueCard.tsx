import { MapPin, Clock, Star, User } from 'lucide-react';
import type { Clue } from '@/types';
import { getTimeAgo, formatDateTime } from '@/utils/time';

interface ClueCardProps {
  clue: Clue;
  index?: number;
}

export function ClueCard({ clue, index = 0 }: ClueCardProps) {
  const renderStars = (confidence: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < confidence ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {index === 0 && (
        <div className="absolute left-0 top-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
          <span className="text-xs font-bold text-green-600">新</span>
        </div>
      )}
      {index > 0 && (
        <div className="absolute left-0 top-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white z-10">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
        </div>
      )}

      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 ml-2">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {formatDateTime(clue.seenTime)}
              </span>
              <span className="text-xs text-gray-400">
                ({getTimeAgo(clue.seenTime)})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-0.5">
                <span className="mr-1">可信度</span>
                {renderStars(clue.confidence)}
              </div>
            </div>
          </div>
          {clue.photo && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={clue.photo}
                alt="线索照片"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <span>{clue.location}</span>
          </div>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            {clue.description}
          </p>
          {clue.contact && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>线索提供者：{clue.contact}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
