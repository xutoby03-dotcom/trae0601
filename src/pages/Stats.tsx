import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, TrendingUp, BarChart3, Award, Star, Clock,
} from 'lucide-react';
import { useCompletionStore } from '@/stores/completionStore';
import { useTaskStore } from '@/stores/taskStore';
import { cn } from '@/lib/utils';
import { SCENE_LABELS, SCENE_COLORS } from '@/types';
import type { Scene } from '@/types';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function Stats() {
  const navigate = useNavigate();
  const tasks = useTaskStore((s) => s.tasks);
  const getCompletionsByMonth = useCompletionStore((s) => s.getCompletionsByMonth);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const activityRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const completions = getCompletionsByMonth(year, month);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  const completedCount = completions.length;
  const sceneCounts = completions.reduce(
    (acc, c) => {
      const task = tasks.find((t) => t.id === c.taskId);
      if (!task) return acc;
      if (task.scene === 'indoor') acc.indoor++;
      else if (task.scene === 'outdoor') acc.outdoor++;
      else { acc.indoor++; acc.outdoor++; }
      return acc;
    },
    { indoor: 0, outdoor: 0 }
  );
  const ratio = `${sceneCounts.indoor}/${sceneCounts.outdoor}`;

  const totalMinutes = completions.reduce((sum, c) => {
    const task = tasks.find((t) => t.id === c.taskId);
    return sum + (task?.durationMin ?? 0);
  }, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const avgRating = completedCount > 0
    ? (completions.reduce((s, c) => s + c.starRating, 0) / completedCount).toFixed(1)
    : '0.0';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const completionsByDay = new Map<number, Scene[]>();
  completions.forEach((c) => {
    const d = new Date(c.completedAt).getDate();
    const task = tasks.find((t) => t.id === c.taskId);
    if (!task) return;
    const arr = completionsByDay.get(d) ?? [];
    if (!arr.includes(task.scene)) arr.push(task.scene);
    completionsByDay.set(d, arr);
  });

  const dayDotColor = (scenes: Scene[]) => {
    const hasIndoor = scenes.includes('indoor') || scenes.includes('both');
    const hasOutdoor = scenes.includes('outdoor') || scenes.includes('both');
    if (hasIndoor && hasOutdoor) return 'bg-purple-500';
    if (hasIndoor) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const scrollToDay = (day: number) => {
    activityRefs.current.get(day)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const statsCards = [
    { icon: Award, label: '完成活动', value: `${completedCount}次`, color: 'text-[#FF6B35]' },
    { icon: BarChart3, label: '室内/室外', value: ratio, color: 'text-blue-500' },
    { icon: Clock, label: '总时长', value: `${totalHours}h`, color: 'text-green-500' },
    { icon: TrendingUp, label: '平均评分', value: avgRating, color: 'text-yellow-500' },
  ];

  const sortedCompletions = [...completions].sort((a, b) => b.completedAt - a.completedAt);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 },
    }),
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-8">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">本月活动统计</h1>

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full bg-white shadow-sm active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-[#FF6B35]" />
          </button>
          <span className="text-base font-bold text-gray-700">
            {year}年{month + 1}月
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full bg-white shadow-sm active:scale-95 transition-transform">
            <ChevronRight className="w-5 h-5 text-[#FF6B35]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {statsCards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
            >
              <card.icon className={cn('w-6 h-6 flex-shrink-0', card.color)} />
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-lg font-bold text-gray-800">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const scenes = completionsByDay.get(day) ?? [];
              const isToday = isCurrentMonth && day === todayDate;
              return (
                <button
                  key={day}
                  onClick={() => scenes.length > 0 && scrollToDay(day)}
                  className={cn(
                    'aspect-square rounded-lg flex flex-col items-center justify-center relative',
                    isToday && 'ring-2 ring-[#FF6B35] ring-offset-1',
                    scenes.length > 0 ? 'bg-orange-50' : ''
                  )}
                >
                  <span className={cn('text-xs', isToday ? 'font-bold text-[#FF6B35]' : 'text-gray-600')}>
                    {day}
                  </span>
                  {scenes.length > 0 && (
                    <span className={cn('w-1.5 h-1.5 rounded-full mt-0.5', dayDotColor(scenes))} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <h2 className="text-base font-bold text-gray-800 mb-3">活动记录</h2>
        <div className="space-y-3">
          {sortedCompletions.map((c) => {
            const task = tasks.find((t) => t.id === c.taskId);
            if (!task) return null;
            const date = new Date(c.completedAt);
            const day = date.getDate();
            return (
              <motion.div
                key={c.id}
                ref={(el) => { if (el) activityRefs.current.set(day, el); }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(`/task/${task.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{task.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {date.getMonth() + 1}月{date.getDate()}日
                  </p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', SCENE_COLORS[task.scene])}>
                  {SCENE_LABELS[task.scene]}
                </span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={cn(
                        'w-3.5 h-3.5',
                        si < c.starRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
          {sortedCompletions.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">本月暂无活动记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
