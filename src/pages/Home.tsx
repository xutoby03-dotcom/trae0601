import { Header } from '@/components/layout/Header';
import { TabNav } from '@/components/layout/TabNav';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TimelineView } from '@/components/timeline/TimelineView';
import { ReviewView } from '@/components/review/ReviewView';
import { useTaskStore } from '@/store/taskStore';
import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  taskId: string;
  taskTitle: string;
  message: string;
  time: string;
}

export default function Home() {
  const { currentView, tasks } = useTaskStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderPanel, setShowReminderPanel] = useState(false);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const newReminders: Reminder[] = [];

      tasks.forEach((task) => {
        if (task.isCompleted) return;
        if (task.priority !== 'high') return;

        const startTime = new Date(task.startTime);
        const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
        const notConfirmed = task.status !== 'confirmed' && task.status !== 'completed';

        if (diffMinutes > 0 && diffMinutes <= 30 && notConfirmed) {
          newReminders.push({
            id: `reminder-${task.id}`,
            taskId: task.id,
            taskTitle: task.title,
            message: `${Math.floor(diffMinutes)}分钟后开始，尚未确认到位`,
            time: task.startTime,
          });
        }

        if (diffMinutes < 0 && notConfirmed) {
          newReminders.push({
            id: `overdue-${task.id}`,
            taskId: task.id,
            taskTitle: task.title,
            message: `已超时 ${Math.abs(Math.floor(diffMinutes))} 分钟`,
            time: task.startTime,
          });
        }
      });

      setReminders(newReminders);
    };

    checkReminders();
    const timer = setInterval(checkReminders, 60000);
    return () => clearInterval(timer);
  }, [tasks]);

  const dismissReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <TabNav />

      {reminders.length > 0 && (
        <div className="fixed top-20 right-4 z-30 space-y-2 max-w-sm">
          {reminders.slice(0, 3).map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white rounded-xl shadow-lg border-l-4 border-wine p-4 animate-slide-right"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-wine/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-wine" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900 truncate">
                    {reminder.taskTitle}
                  </p>
                  <p className="text-xs text-wine mt-0.5">{reminder.message}</p>
                </div>
                <button
                  onClick={() => dismissReminder(reminder.id)}
                  className="p-1 text-warm-400 hover:text-warm-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {reminders.length > 3 && (
            <button
              onClick={() => setShowReminderPanel(!showReminderPanel)}
              className="text-xs text-warm-500 hover:text-wine text-right w-full"
            >
              还有 {reminders.length - 3} 条提醒...
            </button>
          )}
        </div>
      )}

      <main className="container max-w-5xl pt-32 pb-8">
        {currentView === 'board' && <TaskBoard />}
        {currentView === 'timeline' && <TimelineView />}
        {currentView === 'review' && <ReviewView />}
      </main>

      <div
        className={cn(
          'fixed bottom-4 right-4 z-20',
          reminders.length === 0 && 'hidden'
        )}
      >
        <button
          onClick={() => setShowReminderPanel(!showReminderPanel)}
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-wine to-wine-light text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-105"
        >
          <Bell className="w-5 h-5" />
          {reminders.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-gold text-white text-xs rounded-full flex items-center justify-center font-medium">
              {reminders.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
