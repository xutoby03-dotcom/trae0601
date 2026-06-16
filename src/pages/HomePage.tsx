import { StatsCards } from '@/components/home/StatsCards';
import { UrgentList } from '@/components/home/UrgentList';
import { WarningList } from '@/components/home/WarningList';
import { useFoodStore } from '@/store/useFoodStore';
import { Sun, Sunrise, Moon } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return { icon: Moon, text: '深夜好', tip: '早点休息，明天再处理吧 🌙' };
  if (hour < 12) return { icon: Sunrise, text: '早上好', tip: '看看冰箱里有什么能做早餐吧 🥐' };
  if (hour < 14) return { icon: Sun, text: '中午好', tip: '午餐时间到，先吃紧急的！🍱' };
  if (hour < 18) return { icon: Sun, text: '下午好', tip: '规划一下晚餐吃什么 🍳' };
  return { icon: Moon, text: '晚上好', tip: '别忘记处理冰箱里的食材哦 🌙' };
}

export function HomePage() {
  const greeting = getGreeting();
  const foods = useFoodStore((s) => s.foods);

  return (
    <div className="animate-fade-in-up">
      <header className="mb-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <greeting.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                <h1
                  className="text-2xl font-bold text-slate-800"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {greeting.text}！
                </h1>
              </div>
            </div>
            <p className="text-base text-slate-600 ml-15 pl-15 ml-[60px]">
              {greeting.tip}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 px-6 py-4 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-200/40">
            <div className="text-center">
              <p className="text-xs text-emerald-100 mb-1">冰箱内</p>
              <p className="text-3xl font-bold leading-none" style={{ fontFamily: "'Fraunces', serif" }}>
                {foods.length}
              </p>
              <p className="text-xs text-emerald-100 mt-1">件食材</p>
            </div>
          </div>
        </div>
      </header>

      <StatsCards />
      <UrgentList />
      <WarningList />
    </div>
  );
}
