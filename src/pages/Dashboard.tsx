import { useMemo } from 'react';
import { Flame, Droplets, AlertTriangle, TrendingUp } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import CookingPotsCard from '@/components/dashboard/CookingPotsCard';
import SoupStockCard from '@/components/dashboard/SoupStockCard';
import FeedbackAlertCard from '@/components/dashboard/FeedbackAlertCard';
import StabilityChart from '@/components/dashboard/StabilityChart';
import { useBatchStore } from '@/store/useBatchStore';

export default function Dashboard() {
  const batches = useBatchStore((s) => s.batches);
  const feedbacks = useBatchStore((s) => s.feedbacks);

  const { cookingCount, totalStock, abnormalFeedbacks } = useMemo(() => {
    const cooking = batches.filter((b) => b.status === 'cooking' || b.status === 'preparing').length;
    const total = batches
      .filter((b) => b.saleWindow && b.saleWindow.remainingL > 0)
      .reduce((sum, b) => sum + (b.saleWindow?.remainingL || 0), 0);
    const abnormal = feedbacks.filter((f) => f.feedbackType !== 'other').length;
    return { cookingCount: cooking, totalStock: total, abnormalFeedbacks: abnormal };
  }, [batches, feedbacks]);

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-broth-500 mb-1">{today}</p>
          <h1 className="font-display text-3xl font-bold text-broth-800">品质看板</h1>
          <p className="text-broth-500 mt-1">实时监控汤底熬制状态与品质稳定度</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="正在熬制"
          value={cookingCount}
          unit="口锅"
          icon={<Flame className="w-5 h-5" />}
          accent="fire"
        />
        <StatCard
          label="可用汤底总量"
          value={totalStock}
          unit="升"
          icon={<Droplets className="w-5 h-5" />}
          accent="soup"
          trend={{ value: 12, label: '较昨日' }}
        />
        <StatCard
          label="今日异常反馈"
          value={abnormalFeedbacks}
          unit="条"
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="broth"
          trend={{ value: -8, label: '较昨日' }}
        />
        <StatCard
          label="平均稳定度"
          value="92"
          unit="%"
          icon={<TrendingUp className="w-5 h-5" />}
          accent="green"
          trend={{ value: 3, label: '本周' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <CookingPotsCard />
          <StabilityChart />
        </div>
        <div className="space-y-5">
          <SoupStockCard />
          <FeedbackAlertCard />
        </div>
      </div>
    </div>
  );
}
