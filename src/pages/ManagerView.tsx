import { useMemo, useState } from 'react';
import { BarChart3, Calendar, TrendingDown, Package, Clock, GripVertical, AlertTriangle, Sparkles } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { getFlavorStatus, getBestFlavorEndDate, getDaysUntilExpiry, canSetAsTodayPick } from '../utils/flavorUtils';
import { formatDateChinese, addDays, getToday, daysBetween } from '../utils/dateUtils';
import type { CoffeeBean } from '../types';

export function ManagerView() {
  const { beans, wasteRecords, updateRecommendationOrder } = useCoffeeStore();
  const [activeTab, setActiveTab] = useState<'consumption' | 'expiry' | 'waste' | 'recommend'>('consumption');

  const totalBeans = beans.length;
  const activeBeans = beans.filter((b) => b.remainingWeight > 0).length;
  const totalWaste = wasteRecords.reduce((sum, r) => sum + r.weight, 0);
  const nearExpiryCount = beans.filter((b) => {
    const status = getFlavorStatus(b);
    return status === 'nearExpiry' || status === 'expired';
  }).length;

  const consumptionData = useMemo(() => {
    return beans
      .filter((b) => b.totalWeight > 0)
      .map((bean) => {
        const daysSinceRoast = daysBetween(bean.roastDate, getToday());
        const consumed = bean.totalWeight - bean.remainingWeight;
        const dailyConsumption = daysSinceRoast > 0 ? consumed / daysSinceRoast : 0;
        const daysLeft = dailyConsumption > 0 ? bean.remainingWeight / dailyConsumption : Infinity;

        return {
          bean,
          consumed,
          dailyConsumption,
          daysLeft,
          consumptionRate: (consumed / bean.totalWeight) * 100,
        };
      })
      .sort((a, b) => b.dailyConsumption - a.dailyConsumption);
  }, [beans]);

  const slowConsumption = consumptionData
    .filter((d) => d.bean.remainingWeight > 0 && d.dailyConsumption > 0)
    .sort((a, b) => a.dailyConsumption - b.dailyConsumption)
    .slice(0, 3);

  const expiryCalendar = useMemo(() => {
    const today = getToday();
    const dates: string[] = [];
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(today, i));
    }

    return dates.map((date) => {
      const beansExpiring = beans.filter((bean) => {
        const endDate = getBestFlavorEndDate(bean);
        return endDate === date && bean.remainingWeight > 0;
      });
      return { date, beans: beansExpiring };
    });
  }, [beans]);

  const wasteByType = useMemo(() => {
    return wasteRecords.reduce((acc, r) => {
      acc[r.wasteType] = (acc[r.wasteType] || 0) + r.weight;
      return acc;
    }, {} as Record<string, number>);
  }, [wasteRecords]);

  const orderedRecommendationBeans = useMemo(() => {
    return beans
      .filter((b) => b.remainingWeight > 0 && canSetAsTodayPick(b))
      .sort((a, b) => {
        const oa = a.recommendationOrder > 0 ? a.recommendationOrder : Number.MAX_SAFE_INTEGER;
        const ob = b.recommendationOrder > 0 ? b.recommendationOrder : Number.MAX_SAFE_INTEGER;
        if (oa !== ob) return oa - ob;
        return b.remainingWeight - a.remainingWeight;
      });
  }, [beans]);

  const handleDragStart = () => {};
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;

    const newOrder = [...orderedRecommendationBeans];
    const [dragged] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, dragged);

    const beanIds = newOrder.map((b) => b.id);
    updateRecommendationOrder(beanIds);
  };
  const handleDragStartItem = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
  };

  const maxConsumption = Math.max(...consumptionData.map((d) => d.consumed), 1);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">店长看板</h1>
              <p className="text-sm text-stone-500">数据分析 · 库存管理</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            title="在库豆种"
            value={activeBeans}
            unit={`/ ${totalBeans} 支`}
            icon={<Package className="w-6 h-6" />}
            color="default"
          />
          <StatCard
            title="本周消耗"
            value={Math.round(consumptionData.reduce((s, d) => s + d.consumed, 0) * 0.3)}
            unit="g"
            icon={<TrendingDown className="w-6 h-6" />}
            color="green"
            trend={{ value: 12, label: '较上周' }}
          />
          <StatCard
            title="累计浪费"
            value={totalWaste}
            unit="g"
            icon={<AlertTriangle className="w-6 h-6" />}
            color="amber"
          />
          <StatCard
            title="临期预警"
            value={nearExpiryCount}
            unit="支"
            icon={<Clock className="w-6 h-6" />}
            color="red"
          />
        </div>

        <div className="bg-white rounded-xl border border-stone-200 mb-8">
          <div className="flex border-b border-stone-100">
            {[
              { key: 'consumption', label: '消耗分析', icon: BarChart3 },
              { key: 'expiry', label: '临期预警', icon: Calendar },
              { key: 'waste', label: '浪费统计', icon: TrendingDown },
              { key: 'recommend', label: '本周推荐', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-stone-800 text-stone-800'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'consumption' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-stone-800 mb-4">消耗速度排行</h3>
                  <div className="space-y-3">
                    {consumptionData.slice(0, 6).map((item, index) => (
                      <div key={item.bean.id} className="flex items-center gap-4">
                        <span className="w-6 text-center text-sm font-bold text-stone-400">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-stone-700">
                              {item.bean.name}
                            </span>
                            <span className="text-sm text-stone-500">
                              {Math.round(item.dailyConsumption)}g/天
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${(item.consumed / maxConsumption) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100">
                  <h3 className="text-base font-semibold text-stone-800 mb-4">
                    <span className="text-amber-500">⚠</span> 消耗较慢（需关注）
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {slowConsumption.map((item) => (
                      <div
                        key={item.bean.id}
                        className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
                      >
                        <p className="font-medium text-stone-800 mb-1">{item.bean.name}</p>
                        <p className="text-xs text-stone-500 mb-2">
                          日消耗 {Math.round(item.dailyConsumption)}g
                        </p>
                        <p className="text-sm text-amber-700 font-medium">
                          预计 {item.daysLeft === Infinity ? '∞' : Math.round(item.daysLeft)} 天售罄
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'expiry' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-stone-800 mb-4">未来 14 天临期日历</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {expiryCalendar.map(({ date, beans: expiringBeans }) => {
                      const isToday = date === getToday();
                      const hasExpiry = expiringBeans.length > 0;
                      const daysUntil = getDaysUntilExpiry({ roastDate: date, bestFlavorDays: 0 } as CoffeeBean);

                      return (
                        <div
                          key={date}
                          className={`p-3 rounded-xl border transition-all ${
                            isToday
                              ? 'bg-stone-800 text-white border-stone-800'
                              : hasExpiry
                              ? 'bg-amber-50 border-amber-300'
                              : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <p className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-white' : 'text-stone-600'
                          }`}>
                            {formatDateChinese(date)}
                          </p>
                          {hasExpiry ? (
                            <p className={`text-lg font-bold ${
                              isToday ? 'text-amber-300' : 'text-amber-600'
                            }`}>
                              {expiringBeans.length} 支
                            </p>
                          ) : (
                            <p className={`text-xs ${isToday ? 'text-stone-400' : 'text-stone-400'}`}>
                              无
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100">
                  <h3 className="text-base font-semibold text-stone-800 mb-4">临期/超期豆子详情</h3>
                  <div className="space-y-2">
                    {beans
                      .filter((b) => {
                        const s = getFlavorStatus(b);
                        return (s === 'nearExpiry' || s === 'expired') && b.remainingWeight > 0;
                      })
                      .map((bean) => {
                        const status = getFlavorStatus(bean);
                        const days = getDaysUntilExpiry(bean);
                        return (
                          <div
                            key={bean.id}
                            className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <StatusBadge status={status} size="sm" />
                              <div>
                                <p className="font-medium text-stone-800">{bean.name}</p>
                                <p className="text-xs text-stone-500">
                                  剩余 {bean.remainingWeight}g
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                status === 'expired' ? 'text-red-600' : 'text-amber-600'
                              }`}>
                                {status === 'expired' ? `超期 ${Math.abs(days)} 天` : `${days} 天后到期`}
                              </p>
                              <p className="text-xs text-stone-400">
                                {status === 'expired' ? '建议下架' : '建议加快消耗'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'waste' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-stone-800 mb-4">浪费类型分布</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['试机', '撒漏', '校磨'] as const).map((type) => {
                      const weight = wasteByType[type] || 0;
                      const percent = totalWaste > 0 ? (weight / totalWaste) * 100 : 0;
                      const colors = {
                        '试机': 'bg-blue-500',
                        '撒漏': 'bg-amber-500',
                        '校磨': 'bg-purple-500',
                      };
                      return (
                        <div
                          key={type}
                          className="p-5 bg-stone-50 rounded-xl"
                        >
                          <p className="text-sm text-stone-500 mb-2">{type}</p>
                          <p className="text-2xl font-bold text-stone-800 mb-2">
                            {weight}<span className="text-sm font-normal text-stone-400 ml-1">g</span>
                          </p>
                          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors[type]}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-stone-400 mt-1">{percent.toFixed(1)}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100">
                  <h3 className="text-base font-semibold text-stone-800 mb-4">最近损耗记录</h3>
                  <div className="space-y-2">
                    {wasteRecords.slice(0, 5).map((record) => {
                      const bean = beans.find((b) => b.id === record.beanId);
                      const typeColors: Record<string, string> = {
                        '试机': 'bg-blue-100 text-blue-700',
                        '撒漏': 'bg-amber-100 text-amber-700',
                        '校磨': 'bg-purple-100 text-purple-700',
                      };
                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[record.wasteType]}`}
                            >
                              {record.wasteType}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-stone-700">
                                {bean?.name || '未知'}
                              </p>
                              <p className="text-xs text-stone-400">
                                {formatDateChinese(record.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-stone-800">
                            -{record.weight}g
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recommend' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-stone-800">本周推荐排序</h3>
                  <p className="text-sm text-stone-500">拖拽调整顺序，点击保存</p>
                </div>

                <div className="space-y-2">
                  {orderedRecommendationBeans.map((bean, index) => {
                    const status = getFlavorStatus(bean);
                    return (
                      <div
                        key={bean.id}
                        draggable
                        onDragStart={(e) => handleDragStartItem(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragStartCapture={handleDragStart}
                        className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl cursor-move hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <GripVertical className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                        <div className="flex-1">
                          <p className="font-medium text-stone-800">{bean.name}</p>
                          <p className="text-xs text-stone-500">{bean.origin}</p>
                        </div>
                        <StatusBadge status={status} size="sm" />
                        <div className="text-right">
                          <p className="text-sm font-medium text-stone-700">
                            {bean.remainingWeight}g
                          </p>
                          <p className="text-xs text-stone-400">剩余</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {orderedRecommendationBeans.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-400">暂无推荐豆子</p>
                    <p className="text-sm text-stone-400 mt-1">在吧台页面设置豆子的推荐顺序</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
