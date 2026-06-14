import { StatusCard } from '@/components/dashboard/StatusCard';
import { StatsPanel } from '@/components/dashboard/StatsPanel';
import { PriorityCard } from '@/components/dashboard/PriorityCard';
import { useDashboard } from '@/hooks/useDashboard';
import { AlertTriangle, Sun, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusGroups = [
  {
    key: 'overdue',
    label: '已超期',
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    key: 'drying',
    label: '晾干中',
    icon: Sun,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    key: 'pending',
    label: '待清洗',
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    key: 'completed',
    label: '已完成',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
];

export default function Dashboard() {
  const { stats, groupedByStatus } = useDashboard();

  return (
    <div className="animate-fade-in">
      <StatsPanel stats={stats} />

      <PriorityCard stats={stats} />

      <div className="space-y-8">
        {statusGroups.map((group) => {
          const acs = groupedByStatus[group.key] || [];
          if (acs.length === 0) return null;

          const GroupIcon = group.icon;

          return (
            <section key={group.key} className="animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    group.bgColor
                  )}
                >
                  <GroupIcon className={cn('w-5 h-5', group.color)} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  {group.label}
                  <span className={cn('ml-2 text-sm font-normal', group.color)}>
                    ({acs.length}台)
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acs.map((ac, index) => (
                  <StatusCard key={ac.id} ac={ac} index={index} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
