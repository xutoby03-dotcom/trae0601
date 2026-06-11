import { useState } from 'react';
import { Search, Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { TastingCard } from '@/components/TastingCard';
import { StatusTabs } from '@/components/StatusTabs';
import { Input } from '@/components/ui/Input';
import { useTastingStore } from '@/store/useTastingStore';
import type { TastingStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TastingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const items = useTastingStore(state => state.items);

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.flavor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const statsCards = [
    { label: '收集中', count: items.filter(i => i.status === 'collecting').length, icon: Sparkles, color: 'from-blue-400 to-blue-600' },
    { label: '好评高', count: items.filter(i => i.status === 'popular').length, icon: TrendingUp, color: 'from-green-400 to-green-600' },
    { label: '争议大', count: items.filter(i => i.status === 'controversial').length, icon: AlertCircle, color: 'from-amber-400 to-amber-600' },
    { label: '准备上架', count: items.filter(i => i.status === 'ready').length, icon: CheckCircle, color: 'from-primary-400 to-primary-600' },
  ];

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-10 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-brown-800 mb-3">
            试吃反馈板
          </h1>
          <p className="text-brown-500 text-lg">
            收集真实反馈，打造爆款口味
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  'rounded-2xl p-5 text-white shadow-lg animate-slide-up',
                  'bg-gradient-to-br',
                  stat.color
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="w-8 h-8 mb-2 opacity-90" />
                <p className="text-3xl font-bold">{stat.count}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
            );
          })}
        </section>

        <section className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brown-800">全部试吃品</h2>
            <div className="w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
                <Input
                  placeholder="搜索试吃品..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </section>

        <section>
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-brown-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">没有找到相关试吃品</p>
              <p className="text-sm">换个关键词试试吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TastingCard item={item} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
