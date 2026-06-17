import { AlertTriangle, Gift, Droplets } from 'lucide-react';
import type { Reminder } from '@/types';

interface ReminderCardProps {
  reminder: Reminder;
  onAction?: () => void;
}

export default function ReminderCard({ reminder, onAction }: ReminderCardProps) {
  const getIcon = () => {
    if (reminder.type === 'moisture_pack') return Droplets;
    return Gift;
  };

  const getLevelStyles = () => {
    switch (reminder.level) {
      case 'danger':
        return {
          bar: 'bg-coral-500',
          iconBg: 'bg-coral-50',
          iconColor: 'text-coral-600',
        };
      case 'warning':
        return {
          bar: 'bg-amber-500',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
        };
      default:
        return {
          bar: 'bg-sky-500',
          iconBg: 'bg-sky-50',
          iconColor: 'text-sky-600',
        };
    }
  };

  const styles = getLevelStyles();
  const Icon = getIcon();

  return (
    <div 
      className={`card p-4 flex gap-3 card-hover ${
        reminder.isRead ? 'opacity-60' : ''
      } opacity-0 animate-fade-in-up`}
    >
      <div className={`w-1 -ml-4 -my-4 rounded-l-xl ${styles.bar}`} />
      <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={styles.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-warm-800 mb-1">{reminder.title}</h4>
        <p className="text-sm text-warm-500">{reminder.description}</p>
      </div>
      {!reminder.isRead && (
        <div className="w-2 h-2 rounded-full bg-coral-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
