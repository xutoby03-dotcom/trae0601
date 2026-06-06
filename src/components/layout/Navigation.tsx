import { NavLink } from 'react-router-dom';
import { Timer, Music, Headphones, Piano, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/metronome', label: '节拍器', icon: Timer },
  { to: '/rhythm', label: '节奏训练', icon: Music },
  { to: '/ear-training', label: '听音训练', icon: Headphones },
  { to: '/chord-training', label: '和弦识别', icon: Piano },
  { to: '/statistics', label: '学习统计', icon: BarChart3 },
];

export const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300',
                  isActive
                    ? 'text-violet-400 bg-violet-500/10 scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
