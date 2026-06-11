import { useState } from 'react';
import {
  BarChart3, TrendingUp, Star, Users, ShoppingCart,
  Award, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { useTastingStore } from '@/store/useTastingStore';
import { calculateOverallStats, calculateAverageRating } from '@/utils/statistics';
import { cn } from '@/lib/utils';

export default function Stats() {
  const items = useTastingStore(state => state.items);
  const feedbacks = useTastingStore(state => state.feedbacks);
  const resetData = useTastingStore(state => state.resetData);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const stats = calculateOverallStats(items, feedbacks);

  const statCards = [
    {
      label: '总试吃品',
      value: stats.totalItems,
      icon: BarChart3,
      color: 'from-blue-400 to-blue-600',
      suffix: '款',
    },
    {
      label: '总反馈数',
      value: stats.totalFeedbacks,
      icon: Users,
      color: 'from-mint-400 to-mint-600',
      suffix: '条',
    },
    {
      label: '平均评分',
      value: stats.avgRating.toFixed(1),
      icon: Star,
      color: 'from-amber-400 to-amber-600',
      suffix: '分',
    },
    {
      label: '购买意愿',
      value: stats.purchaseYesRate,
      icon: ShoppingCart,
      color: 'from-primary-400 to-primary-600',
      suffix: '%',
    },
  ];

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brown-800 mb-1">数据统计</h1>
            <p className="text-brown-500">全面了解试吃反馈表现</p>
          </div>
          <Button variant="outline" size="sm" onClick={resetData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            重置数据
          </Button>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-5">
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 text-white shadow-lg',
                    stat.color
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-brown-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-brown-800">
                    {stat.value}
                    <span className="text-base font-normal text-brown-400 ml-1">{stat.suffix}</span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="space-y-6">
              <h2 className="text-lg font-semibold text-brown-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-500" />
                购买意愿分布
              </h2>

              <div className="flex items-center justify-center py-6">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F5F0ED"
                      strokeWidth="20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="20"
                      strokeDasharray={`${stats.purchaseYesRate * 2.51} 251`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray={`${stats.purchaseMaybeRate * 2.51} 251`}
                      strokeDashoffset={`${-stats.purchaseYesRate * 2.51}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-brown-800">{stats.purchaseYesRate}%</span>
                    <span className="text-sm text-brown-500">愿意购买</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">{stats.purchaseYesRate}%</p>
                  <p className="text-xs text-brown-500">愿意</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1" />
                  <p className="text-lg font-bold text-amber-500">{stats.purchaseMaybeRate}%</p>
                  <p className="text-xs text-brown-500">犹豫</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-500">{stats.purchaseNoRate}%</p>
                  <p className="text-xs text-brown-500">不愿</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6">
              <h2 className="text-lg font-semibold text-brown-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-500" />
                口味保留建议
              </h2>

              {stats.topFlavors.length === 0 ? (
                <div className="text-center py-8 text-brown-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>数据不足，暂无推荐</p>
                  <p className="text-sm">每款试吃品需要至少 5 条反馈</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topFlavors.slice(0, 3).map((flavor, index) => (
                    <div
                      key={flavor.item.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl transition-all',
                        index === 0
                          ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200'
                          : 'bg-brown-50'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg',
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        'bg-gradient-to-br from-amber-600 to-amber-800'
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-brown-800 truncate">
                            {flavor.item.name}
                          </h3>
                          {index === 0 && (
                            <Tag size="sm" variant="warning">
                              <Award className="w-3 h-3 mr-0.5" />
                              推荐
                            </Tag>
                          )}
                        </div>
                        <p className="text-sm text-brown-500">{flavor.item.flavor}口味</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-brown-800">{flavor.avgRating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-green-600">{flavor.purchaseYesRate}% 愿意买</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {stats.topFlavors.length > 0 && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>建议：</strong>
                    「{stats.topFlavors[0].item.name}」综合评分最高，购买意愿最强，
                    建议优先考虑正式上架。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold text-brown-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              全部口味排行
            </h2>

            <div className="space-y-2">
              {items
                .map(item => {
                  const itemFeedbacks = feedbacks.filter(f => f.tastingItemId === item.id);
                  const avg = calculateAverageRating(itemFeedbacks);
                  return { item, avgRating: avg, feedbackCount: itemFeedbacks.length };
                })
                .sort((a, b) => b.avgRating - a.avgRating)
                .map(({ item, avgRating, feedbackCount }, index) => (
                  <div
                    key={item.id}
                    className="border border-brown-100 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-brown-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-brown-100 flex items-center justify-center text-brown-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="font-medium text-brown-800">{item.name}</h3>
                        <p className="text-sm text-brown-500">{item.flavor}口味 · {feedbackCount}条反馈</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-brown-800">
                              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                            </span>
                          </div>
                        </div>
                        {expandedItem === item.id ? (
                          <ChevronUp className="w-5 h-5 text-brown-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-brown-400" />
                        )}
                      </div>
                    </button>

                    {expandedItem === item.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-brown-100">
                        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-brown-50 rounded-lg">
                            <p className="text-xs text-brown-500 mb-1">成本</p>
                            <p className="font-semibold text-brown-800">¥{item.cost}</p>
                          </div>
                          <div className="text-center p-3 bg-brown-50 rounded-lg">
                            <p className="text-xs text-brown-500 mb-1">份数</p>
                            <p className="font-semibold text-brown-800">{item.totalPortions}份</p>
                          </div>
                          <div className="text-center p-3 bg-brown-50 rounded-lg">
                            <p className="text-xs text-brown-500 mb-1">目标客群</p>
                            <p className="font-semibold text-brown-800 text-sm">{item.targetAudience}</p>
                          </div>
                          <div className="text-center p-3 bg-brown-50 rounded-lg">
                            <p className="text-xs text-brown-500 mb-1">状态</p>
                            <Tag size="sm" className={cn(
                              feedbackCount >= 10 && avgRating >= 4.2
                                ? 'bg-green-100 text-green-700'
                                : 'bg-brown-100 text-brown-600'
                            )}>
                              {item.status === 'ready' ? '准备上架' :
                                avgRating >= 4.2 && feedbackCount >= 10 ? '好评高' :
                                feedbackCount >= 10 ? '收集中' : '收集中'}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
