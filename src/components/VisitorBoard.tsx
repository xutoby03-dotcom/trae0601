import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, CalendarArrowUp, AlertTriangle, Inbox } from 'lucide-react';
import type { BoardGroup, VisitorWithRelations } from '@/types';
import VisitorCard from './VisitorCard';

interface Props {
  groups: Record<BoardGroup, VisitorWithRelations[]>;
  onCardClick: (visitor: VisitorWithRelations) => void;
  onCardRedeem: (visitor: VisitorWithRelations) => void;
}

const COLUMN_CONFIG: Record<
  BoardGroup,
  {
    title: string;
    icon: typeof CalendarDays;
    accent: string;
    headerBg: string;
    borderColor: string;
    iconBg: string;
  }
> = {
  today: {
    title: '今日到访',
    icon: CalendarDays,
    accent: 'text-primary-700',
    headerBg: 'bg-primary-50',
    borderColor: 'border-primary-100',
    iconBg: 'bg-primary-100 text-primary-600',
  },
  tomorrow: {
    title: '明日预约',
    icon: CalendarArrowUp,
    accent: 'text-neutral-600',
    headerBg: 'bg-neutral-50',
    borderColor: 'border-neutral-200',
    iconBg: 'bg-neutral-100 text-neutral-500',
  },
  overdue: {
    title: '已超时',
    icon: AlertTriangle,
    accent: 'text-accent-600',
    headerBg: 'bg-accent-50',
    borderColor: 'border-accent-200',
    iconBg: 'bg-accent-100 text-accent-600',
  },
};

export default function VisitorBoard({ groups, onCardClick, onCardRedeem }: Props) {
  const keys: BoardGroup[] = ['today', 'tomorrow', 'overdue'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {keys.map((key, colIdx) => {
        const cfg = COLUMN_CONFIG[key];
        const items = groups[key];
        const Icon = cfg.icon;
        const isOverdue = key === 'overdue';

        return (
          <motion.section
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 + colIdx * 0.1, ease: 'easeOut' }}
            className={
              'rounded-card bg-white shadow-card border ' +
              cfg.borderColor +
              ' overflow-hidden flex flex-col max-h-[calc(100vh-440px)] min-h-[400px]'
            }
          >
            <header className={'px-5 py-3.5 border-b ' + cfg.borderColor + ' ' + cfg.headerBg}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={'w-8 h-8 rounded-lg flex items-center justify-center ' + cfg.iconBg}>
                    <Icon size={16} />
                  </div>
                  <h3 className={'text-sm font-bold ' + cfg.accent}>{cfg.title}</h3>
                </div>
                <span
                  className={
                    'inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-bold ' +
                    (isOverdue
                      ? 'bg-accent-500 text-white shadow-sm'
                      : key === 'today'
                      ? 'bg-primary-700 text-white shadow-sm'
                      : 'bg-neutral-200 text-neutral-700')
                  }
                >
                  {items.length}
                </span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-3.5 space-y-3">
              {items.length === 0 ? (
                <EmptyState key={key} />
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((v, i) => (
                    <motion.div
                      key={v.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, scale: 0.97 }}
                      transition={{ duration: 0.35, delay: i * 0.05, ease: 'easeOut' }}
                    >
                      <VisitorCard
                        visitor={v}
                        index={i}
                        overdue={isOverdue}
                        onClick={() => onCardClick(v)}
                        onRedeem={() => onCardRedeem(v)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}

function EmptyState({ key }: { key: string }) {
  const tips: Record<string, string> = {
    today: '今日暂无访客',
    tomorrow: '明天暂无预约',
    overdue: '太棒了，无超时记录！',
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="h-full flex flex-col items-center justify-center py-10 text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-3">
        <Inbox size={24} className="text-neutral-300" />
      </div>
      <p className="text-sm font-medium text-neutral-500">{tips[key]}</p>
      <p className="text-xs text-neutral-400 mt-1">新访客将在这里显示</p>
    </motion.div>
  );
}
