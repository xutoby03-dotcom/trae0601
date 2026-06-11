import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star } from 'lucide-react';
import { Card, CardImage, CardContent } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { StarRating } from '@/components/ui/StarRating';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import type { TastingItem } from '@/types';
import { formatDate, calculateAverageRating } from '@/utils/statistics';
import { useTastingStore } from '@/store/useTastingStore';

interface TastingCardProps {
  item: TastingItem;
}

export function TastingCard({ item }: TastingCardProps) {
  const feedbacks = useTastingStore(state => state.feedbacks);
  const itemFeedbacks = useMemo(
    () => feedbacks.filter(f => f.tastingItemId === item.id),
    [feedbacks, item.id]
  );
  const avgRating = calculateAverageRating(itemFeedbacks);

  return (
    <Link to={`/tasting/${item.id}`}>
      <Card hover className="h-full flex flex-col group">
        <div className="relative h-48 overflow-hidden">
          <CardImage src={item.imageUrl} alt={item.name} className="h-full" />
          <div className="absolute top-3 left-3">
            <Tag className={STATUS_COLORS[item.status]} size="sm">
              {STATUS_LABELS[item.status]}
            </Tag>
          </div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-brown-800">
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </span>
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-brown-800 mb-1 group-hover:text-primary-600 transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-brown-500 mb-3">{item.flavor}口味</p>

          <div className="flex items-center gap-4 text-sm text-brown-600 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{itemFeedbacks.length}份反馈</span>
            </div>
          </div>

          {avgRating > 0 && (
            <div className="mb-3">
              <StarRating rating={avgRating} size={16} />
            </div>
          )}

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-brown-500">
              <Clock className="w-4 h-4" />
              <span>{formatDate(item.deadline)}</span>
            </div>
            <Tag variant="primary" size="sm">
              ¥{item.cost}
            </Tag>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
