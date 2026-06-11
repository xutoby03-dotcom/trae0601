import { Smile, Meh, Frown, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { Tag } from '@/components/ui/Tag';
import type { Feedback, PurchaseIntent } from '@/types';
import { cn } from '@/lib/utils';

interface FeedbackListProps {
  feedbacks: Feedback[];
  emptyMessage?: string;
}

export function FeedbackList({ feedbacks, emptyMessage = '暂无反馈' }: FeedbackListProps) {
  const getPurchaseIntentDisplay = (intent: PurchaseIntent) => {
    switch (intent) {
      case 'yes':
        return { label: '愿意购买', icon: Smile, color: 'text-green-500 bg-green-50' };
      case 'maybe':
        return { label: '再考虑下', icon: Meh, color: 'text-amber-500 bg-amber-50' };
      case 'no':
        return { label: '不会购买', icon: Frown, color: 'text-red-500 bg-red-50' };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    return '刚刚';
  };

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12 text-brown-400">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback, index) => {
        const purchaseDisplay = getPurchaseIntentDisplay(feedback.purchaseIntent);
        const PurchaseIcon = purchaseDisplay.icon;

        return (
          <Card key={feedback.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                    {String.fromCharCode(65 + (index % 26))}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-brown-800">匿名用户</p>
                      <span className="text-xs text-brown-400">{formatTime(feedback.createdAt)}</span>
                    </div>
                    <StarRating rating={feedback.overallRating} size={14} />
                  </div>
                </div>
                <Tag size="sm" className={cn('flex items-center gap-1', purchaseDisplay.color)}>
                  <PurchaseIcon className="w-3 h-3" />
                  {purchaseDisplay.label}
                </Tag>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-brown-400">甜度</p>
                  <div className="flex justify-center">
                    <div className="w-full h-1.5 bg-brown-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-400 rounded-full"
                        style={{ width: `${(feedback.sweetness / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-brown-600">{feedback.sweetness}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-brown-400">咸度</p>
                  <div className="flex justify-center">
                    <div className="w-full h-1.5 bg-brown-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${(feedback.saltiness / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-brown-600">{feedback.saltiness}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-brown-400">辣度</p>
                  <div className="flex justify-center">
                    <div className="w-full h-1.5 bg-brown-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${(feedback.spiciness / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-brown-600">{feedback.spiciness}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-brown-400">分量</p>
                  <div className="flex justify-center">
                    <div className="w-full h-1.5 bg-brown-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${(feedback.portion / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-brown-600">{feedback.portion}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-brown-400">包装</p>
                  <div className="flex justify-center">
                    <div className="w-full h-1.5 bg-brown-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${(feedback.packaging / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-brown-600">{feedback.packaging}</p>
                </div>
              </div>

              {feedback.comment && (
                <p className="text-brown-600 text-sm leading-relaxed bg-brown-50 rounded-xl p-3">
                  "{feedback.comment}"
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
