import { ReviewStats } from './ReviewStats';
import { ReviewList } from './ReviewList';

export function ReviewView() {
  return (
    <div>
      <div className="bg-white rounded-2xl shadow-card p-4 mb-6 border border-rose-gold/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <div>
            <h2 className="font-semibold text-warm-900">婚礼复盘</h2>
            <p className="text-xs text-warm-500">记录遗漏、超时和经验总结</p>
          </div>
        </div>
      </div>

      <ReviewStats />
      <ReviewList />
    </div>
  );
}
