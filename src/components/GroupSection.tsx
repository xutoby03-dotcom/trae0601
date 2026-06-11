import { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface GroupSectionProps {
  title: string;
  icon: ReactNode;
  count: number;
  accentColor: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export default function GroupSection({
  title,
  icon,
  count,
  accentColor,
  children,
  defaultCollapsed = false,
}: GroupSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className="space-y-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'group w-full flex items-center justify-between p-4 rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer',
          'bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/15'
        )}
        style={{
          borderLeft: `4px solid ${accentColor}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {icon}
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-xs text-white/40 mt-0.5">
              共 {count} 部电影
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {count}
          </span>
          {collapsed ? (
            <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
          ) : (
            <ChevronUp className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
          )}
        </div>
      </button>

      {!collapsed && (
        <div
          className="grid gap-4 md:grid-cols-2"
          style={{
            animation: 'fadeSlideIn 0.4s ease-out',
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
