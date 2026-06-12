import { Bell, AlertCircle, AlertTriangle, Clock, Fish } from 'lucide-react';
import { useFishTankStore } from '@/store/useFishTankStore';
import { generateReminders } from '@/utils/stats';
import { cn } from '@/lib/utils';
import type { ReminderType } from '@/types';

const iconMap = {
  water_change_overdue: <Clock size={18} />,
  temp_abnormal: <AlertTriangle size={18} />,
  consecutive_issues: <AlertCircle size={18} />,
  sick_fish: <Fish size={18} />,
};

const sectionIdMap: Record<ReminderType, string> = {
  water_change_overdue: 'section-water-change',
  temp_abnormal: 'section-water-change',
  consecutive_issues: 'section-observation',
  sick_fish: 'section-observation',
};

export default function ReminderPanel() {
  const { tank, waterChanges, observations, fishes } = useFishTankStore();
  const reminders = generateReminders(tank, waterChanges, observations, fishes);

  const handleScroll = (type: ReminderType) => {
    const id = sectionIdMap[type];
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Bell className="text-emerald-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">提醒</h3>
              <p className="text-sm text-gray-500">暂无提醒事项</p>
            </div>
          </div>
          <div className="text-center py-8 text-emerald-600">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-sm">一切正常，继续保持！</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center relative">
            <Bell className="text-rose-600" size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
              {reminders.length}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">提醒事项</h3>
            <p className="text-sm text-gray-500">{reminders.length} 条待关注</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            onClick={() => handleScroll(reminder.type)}
            className={cn(
              'rounded-xl p-4 border transition-all cursor-pointer hover:shadow-md active:scale-[0.98]',
              reminder.level === 'danger'
                ? 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200 hover:border-rose-300'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                reminder.level === 'danger'
                  ? 'bg-rose-200 text-rose-700'
                  : 'bg-amber-200 text-amber-700'
              )}>
                {iconMap[reminder.type]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'font-semibold text-sm mb-1',
                  reminder.level === 'danger' ? 'text-rose-900' : 'text-amber-900'
                )}>
                  {reminder.title}
                </h4>
                <p className={cn(
                  'text-xs',
                  reminder.level === 'danger' ? 'text-rose-700' : 'text-amber-700'
                )}>
                  {reminder.description}
                </p>
                {reminder.days !== undefined && (
                  <div className="mt-2">
                    <span className={cn(
                      'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                      reminder.level === 'danger'
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-amber-200 text-amber-800'
                    )}>
                      超期 {reminder.days} 天
                    </span>
                  </div>
                )}
              </div>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded flex-shrink-0',
                reminder.level === 'danger'
                  ? 'bg-rose-200/60 text-rose-600'
                  : 'bg-amber-200/60 text-amber-600'
              )}>
                点击查看
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
