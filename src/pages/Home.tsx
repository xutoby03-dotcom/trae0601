import { useEffect, useState, useRef } from 'react';
import { Calendar, Sparkles, Tag, Shield, Clock3, Users } from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import ActivityCard from '../components/ActivityCard.js';
import type { Activity, Registration } from '../../shared/types.js';

type CategoryType = 'week' | 'popular' | 'free' | 'approval';

const categories: { id: CategoryType; label: string; icon: typeof Calendar; description: string }[] = [
  { id: 'week', label: '本周活动', icon: Clock3, description: '近期不要错过' },
  { id: 'popular', label: '快满员', icon: Users, description: '手慢无' },
  { id: 'free', label: '免费活动', icon: Tag, description: '零元体验' },
  { id: 'approval', label: '需要审核', icon: Shield, description: '精选活动' },
];

function isThisWeek(activity: Activity): boolean {
  const now = new Date();
  const start = new Date(activity.startTime);
  const diff = start.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 7;
}

function isAlmostFull(activity: Activity, registrations: Registration[]): boolean {
  const count = registrations.filter((r) => r.status === 'registered').length;
  return count >= activity.maxParticipants * 0.8 && count < activity.maxParticipants;
}

function isFree(activity: Activity): boolean {
  return activity.fee === 0;
}

function needsApproval(activity: Activity): boolean {
  return activity.requiresApproval;
}

export default function Home() {
  const { activities, fetchActivities, registrations, fetchRegistrations } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('week');
  const loadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    activities.forEach((activity) => {
      if (!loadedRef.current.has(activity.id)) {
        loadedRef.current.add(activity.id);
        fetchRegistrations(activity.id);
      }
    });
  }, [activities, fetchRegistrations]);

  const filteredActivities = activities.filter((activity) => {
    const regs = registrations.get(activity.id) || [];
    switch (activeCategory) {
      case 'week':
        return isThisWeek(activity);
      case 'popular':
        return isAlmostFull(activity, regs);
      case 'free':
        return isFree(activity);
      case 'approval':
        return needsApproval(activity);
      default:
        return true;
    }
  });

  const getCategoryCount = (category: CategoryType): number => {
    return activities.filter((activity) => {
      const regs = registrations.get(activity.id) || [];
      switch (category) {
        case 'week':
          return isThisWeek(activity);
        case 'popular':
          return isAlmostFull(activity, regs);
        case 'free':
          return isFree(activity);
        case 'approval':
          return needsApproval(activity);
        default:
          return false;
      }
    }).length;
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-500 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            <span className="text-lg font-medium text-white/90">发现精彩校园生活</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            社团活动报名
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl">
            告别表格来回传，在线报名、候补机制、签到管理一站式搞定
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <div className="text-3xl font-bold">{activities.length}</div>
              <div className="text-white/80 text-sm">精彩活动</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <div className="text-3xl font-bold">
                {Array.from(registrations.values()).flat().filter((r) => r.status === 'registered').length}
              </div>
              <div className="text-white/80 text-sm">同学报名</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`p-4 rounded-2xl transition-all duration-300 text-left ${
                  isActive
                    ? 'bg-white shadow-xl scale-105 ring-2 ring-primary-300'
                    : 'bg-white/70 hover:bg-white hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-gray-700">{count}</span>
                </div>
                <div className={`font-bold ${isActive ? 'text-primary-600' : 'text-gray-700'}`}>
                  {cat.label}
                </div>
                <div className="text-xs text-gray-400">{cat.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity List */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {categories.find((c) => c.id === activeCategory)?.label || '全部活动'}
          </h2>
          <span className="text-gray-400 text-sm">共 {filteredActivities.length} 个活动</span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500">暂无该分类的活动</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ActivityCard
                  activity={activity}
                  registrations={registrations.get(activity.id) || []}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
