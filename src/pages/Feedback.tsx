import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Clock, Users } from 'lucide-react';
import { FeedbackForm } from '@/components/FeedbackForm';
import { Card, CardContent } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useTastingStore } from '@/store/useTastingStore';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import { formatDate, calculateAverageRating } from '@/utils/statistics';

export default function Feedback() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useTastingStore(state => state.items);
  const allFeedbacks = useTastingStore(state => state.feedbacks);

  const item = useMemo(
    () => items.find(i => i.id === id),
    [items, id]
  );
  const feedbacks = useMemo(
    () => allFeedbacks.filter(f => f.tastingItemId === id),
    [allFeedbacks, id]
  );

  if (!item) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="py-12">
            <p className="text-brown-500 mb-4">试吃品不存在或已下架</p>
            <button
              onClick={() => navigate('/')}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              返回首页
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgRating = calculateAverageRating(feedbacks);

  return (
    <div className="min-h-screen bg-warm-50 pb-8">
      <div className="bg-gradient-to-b from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Tag className={STATUS_COLORS[item.status]} size="sm">
                  {STATUS_LABELS[item.status]}
                </Tag>
              </div>
              <h1 className="text-2xl font-bold mb-2 truncate">{item.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>{avgRating > 0 ? avgRating.toFixed(1) : '暂无评分'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{feedbacks.length}人评价</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(item.deadline)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-4">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-brown-800 mb-1">
                分享你的试吃感受
              </h2>
              <p className="text-sm text-brown-500">
                你的意见对我们非常重要
              </p>
            </div>

            <FeedbackForm tastingItemId={item.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
