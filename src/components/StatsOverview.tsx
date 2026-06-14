import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Clock, AlertTriangle, Package } from 'lucide-react';
import type { StatsData } from '@/types';
import { formatDuration } from '@/utils/dateUtils';

interface Props {
  stats: StatsData;
}

const CONFIGS = [
  {
    key: 'todayUsedCount',
    label: '今日发券量',
    icon: Ticket,
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
    accent: 'text-primary-700',
    bar: 'bg-primary-500',
  },
  {
    key: 'pendingCount',
    label: '待核销车辆',
    icon: Clock,
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-600',
    accent: 'text-accent-600',
    bar: 'bg-accent-500',
  },
  {
    key: 'avgDuration',
    label: '平均停车时长',
    icon: AlertTriangle,
    iconBg: 'bg-mint-50',
    iconColor: 'text-mint-600',
    accent: 'text-mint-600',
    bar: 'bg-mint-500',
    formatter: (v: number) => formatDuration(v || 0),
  },
  {
    key: 'remainingInventory',
    label: '券库剩余',
    icon: Package,
    iconBg: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
    accent: 'text-neutral-700',
    bar: 'bg-neutral-400',
    warning: (v: number) => v < 20,
  },
];

export default function StatsOverview({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CONFIGS.map((cfg, i) => {
        const value = (stats as unknown as Record<string, number>)[cfg.key] as number;
        const warning = cfg.warning?.(value);
        return (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-card bg-white shadow-card border border-neutral-100 p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
                  {cfg.label}
                  {warning && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse-dot"
                      title="库存紧张"
                    />
                  )}
                </p>
                <AnimatedNumber
                  value={value}
                  formatter={cfg.formatter}
                  className={
                    'mt-2 text-2xl lg:text-3xl font-bold font-mono tracking-tight ' +
                    (warning ? 'text-accent-600' : cfg.accent)
                  }
                />
                <div className="mt-3 h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth(cfg.key, value)}%` }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                    className={'h-full rounded-full ' + cfg.bar}
                  />
                </div>
              </div>
              <div
                className={
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-4 ' +
                  cfg.iconBg +
                  ' ' +
                  cfg.iconColor
                }
              >
                <cfg.icon size={20} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function barWidth(key: string, value: number): number {
  switch (key) {
    case 'todayUsedCount':
      return Math.min(100, (value / 30) * 100);
    case 'pendingCount':
      return Math.min(100, (value / 15) * 100);
    case 'avgDuration':
      return Math.min(100, (value / 12) * 100);
    case 'remainingInventory':
      return Math.min(100, (value / 100) * 100);
    default:
      return 50;
  }
}

function AnimatedNumber({
  value,
  formatter,
  className,
}: {
  value: number;
  formatter?: (v: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 700;
    const start = performance.now();
    const from = 0;
    const to = value;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const text = formatter ? formatter(display) : Math.round(display).toLocaleString();
  return <div className={className}>{text}</div>;
}
