import { LayoutList, Clock, BarChart3 } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/types';

const tabs: { id: ViewType; label: string; icon: typeof LayoutList }[] = [
  { id: 'board', label: '任务看板', icon: LayoutList },
  { id: 'timeline', label: '时间轴', icon: Clock },
  { id: 'review', label: '复盘区', icon: BarChart3 },
];

export function TabNav() {
  const { currentView, setCurrentView } = useTaskStore();

  return (
    <nav className="sticky top-16 z-30 bg-ivory/90 backdrop-blur-sm border-b border-rose-gold/10">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-center py-2 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-rose-gold to-rose-goldDark text-white shadow-md'
                    : 'text-warm-600 hover:bg-warm-100'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
