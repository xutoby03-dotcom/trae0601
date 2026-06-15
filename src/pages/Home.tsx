import { BirthdayPlanHeader } from '@/components/BirthdayPlanHeader';
import { TaskBoard } from '@/components/TaskBoard';
import { Timeline } from '@/components/Timeline';
import { usePlanStore } from '@/store/usePlanStore';
import { Heart, Sparkles } from 'lucide-react';

export default function Home() {
  const tasks = usePlanStore((s) => s.plan.tasks);
  const timeline = usePlanStore((s) => s.plan.timeline);
  const allTasksDone = tasks.length > 0 && tasks.every((t) => t.completed);
  const allTimelineDone = timeline.length > 0 && timeline.every((n) => n.completed);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Top badge */}
        <div className="text-center mb-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm border border-white/80 text-slate2-600 text-sm">
            <Sparkles className="w-4 h-4 text-cream-500" />
            <span>小群惊喜分工 · 大家一起偷偷搞事情 🤫</span>
            <Heart className="w-4 h-4 text-coral-500 fill-coral-500" />
          </div>
        </div>

        <BirthdayPlanHeader />

        <TaskBoard />

        <Timeline />

        {/* Completion celebration */}
        {(allTasksDone || allTimelineDone) && (
          <div className="text-center p-6 bg-gradient-to-r from-mint-100 via-cream-100 to-coral-100 rounded-3xl border border-white shadow-card animate-scale-in mb-8">
            <div className="text-4xl mb-2">🎉🎂🥳</div>
            <h3 className="font-display text-2xl text-slate2-800 mb-1">
              {allTasksDone && allTimelineDone
                ? '完美！所有任务和时间线都搞定啦！'
                : allTasksDone
                ? '任务全部完成，太棒了！'
                : '时间线全部走完，惊喜圆满！'}
            </h3>
            <p className="text-slate2-600">
              准备好给 <span className="font-bold text-coral-600">{usePlanStore.getState().plan.mainCharacter || '主角'}</span> 一个难忘的生日了吗？
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-slate2-400 text-xs py-4 border-t border-slate2-200/50">
          <p>💝 用心做的惊喜，总是最动人的 · 数据自动保存在你的浏览器里</p>
        </footer>
      </div>
    </div>
  );
}
