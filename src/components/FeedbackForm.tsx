import { useState } from 'react';
import { Smile, Meh, Frown, Package, Cookie, Droplets, Flame, Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { StarRating } from '@/components/ui/StarRating';
import { RatingSlider } from '@/components/ui/RatingSlider';
import { cn } from '@/lib/utils';
import type { PurchaseIntent } from '@/types';
import { useTastingStore } from '@/store/useTastingStore';
import { useNavigate } from 'react-router-dom';

interface FeedbackFormProps {
  tastingItemId: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ tastingItemId, onSuccess }: FeedbackFormProps) {
  const navigate = useNavigate();
  const addFeedback = useTastingStore(state => state.addFeedback);

  const [overallRating, setOverallRating] = useState(0);
  const [sweetness, setSweetness] = useState(3);
  const [saltiness, setSaltiness] = useState(3);
  const [spiciness, setSpiciness] = useState(1);
  const [portion, setPortion] = useState(3);
  const [packaging, setPackaging] = useState(3);
  const [purchaseIntent, setPurchaseIntent] = useState<PurchaseIntent | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0 || !purchaseIntent) {
      return;
    }

    addFeedback({
      tastingItemId,
      overallRating,
      sweetness,
      saltiness,
      spiciness,
      portion,
      packaging,
      purchaseIntent,
      comment,
    });

    setSubmitted(true);
    onSuccess?.();
  };

  if (submitted) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
          <Smile className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-brown-800 mb-2">感谢您的反馈！</h3>
        <p className="text-brown-500 mb-8">您的意见对我们非常重要，期待下次再见~</p>
        <Button onClick={() => navigate(`/tasting/${tastingItemId}`)}>
          查看详情
        </Button>
      </div>
    );
  }

  const purchaseOptions: Array<{ value: PurchaseIntent; label: string; icon: typeof Smile; color: string }> = [
    { value: 'yes', label: '愿意购买', icon: Smile, color: 'text-green-500 bg-green-50 border-green-200' },
    { value: 'maybe', label: '再考虑下', icon: Meh, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { value: 'no', label: '不会购买', icon: Frown, color: 'text-red-500 bg-red-50 border-red-200' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-brown-800 mb-4">整体评分</h3>
        <StarRating
          rating={overallRating}
          size={36}
          interactive
          onChange={setOverallRating}
          className="justify-center"
        />
        {overallRating > 0 && (
          <p className="mt-2 text-primary-600 font-medium">
            {overallRating} 分
          </p>
        )}
      </div>

      <div className="space-y-6">
        <h4 className="text-sm font-semibold text-brown-700 border-b border-brown-100 pb-2">
          口味与分量
        </h4>

        <RatingSlider
          label="甜度"
          value={sweetness}
          onChange={setSweetness}
          colorFrom="from-pink-200"
          colorTo="to-pink-500"
          description="从淡到甜"
        />

        <RatingSlider
          label="咸度"
          value={saltiness}
          onChange={setSaltiness}
          colorFrom="from-yellow-200"
          colorTo="to-yellow-600"
          description="从淡到咸"
        />

        <RatingSlider
          label="辣度"
          value={spiciness}
          onChange={setSpiciness}
          colorFrom="from-red-200"
          colorTo="to-red-500"
          description="从不辣到特辣"
        />

        <RatingSlider
          label="分量"
          value={portion}
          onChange={setPortion}
          colorFrom="from-blue-200"
          colorTo="to-blue-500"
          description="从少到多"
        />

        <RatingSlider
          label="包装印象"
          value={packaging}
          onChange={setPackaging}
          colorFrom="from-purple-200"
          colorTo="to-purple-500"
          description="从一般到精致"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-brown-700">愿意购买吗？</h4>
        <div className="grid grid-cols-3 gap-3">
          {purchaseOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = purchaseIntent === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPurchaseIntent(option.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
                  isSelected
                    ? `${option.color} scale-105 shadow-md`
                    : 'border-brown-200 bg-white hover:border-brown-300'
                )}
              >
                <Icon className={cn('w-8 h-8', isSelected ? '' : 'text-brown-400')} />
                <span className={cn('text-sm font-medium', isSelected ? '' : 'text-brown-600')}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-brown-700">说说你的感受</h4>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="味道怎么样？有什么改进建议？"
          rows={4}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={overallRating === 0 || !purchaseIntent}
      >
        提交反馈
      </Button>
    </form>
  );
}
