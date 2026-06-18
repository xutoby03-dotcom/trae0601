import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "danger";
  trend?: { value: number; label: string };
  subtext?: string;
}

const variantStyles = {
  primary: {
    bg: "from-primary-500 to-primary-600",
    iconBg: "bg-white/15",
    ring: "shadow-[0_0_40px_-15px_rgba(30,111,237,0.6)]",
  },
  success: {
    bg: "from-success-500 to-success-600",
    iconBg: "bg-white/15",
    ring: "shadow-[0_0_40px_-15px_rgba(16,185,129,0.6)]",
  },
  warning: {
    bg: "from-warning-500 to-warning-600",
    iconBg: "bg-white/15",
    ring: "shadow-[0_0_40px_-15px_rgba(245,158,11,0.6)]",
  },
  danger: {
    bg: "from-danger-500 to-danger-600",
    iconBg: "bg-white/15",
    ring: "shadow-[0_0_40px_-15px_rgba(239,68,68,0.6)]",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  variant = "primary",
  trend,
  subtext,
}: StatCardProps) {
  const styles = variantStyles[variant];
  return (
    <div
      className={clsx(
        "relative rounded-2xl bg-gradient-to-br text-white p-5 overflow-hidden",
        styles.bg,
        styles.ring,
        "transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]"
      )}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/5 blur-xl" />

      <div className="relative flex items-start justify-between mb-4">
        <div className="text-sm font-medium text-white/85">{title}</div>
        <div
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm",
            styles.iconBg
          )}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      </div>

      <div className="relative">
        <div className="font-display text-4xl font-bold tracking-tight mb-1">
          {value}
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 text-xs text-white/90">
            {trend.value >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-white/60">· {trend.label}</span>
          </div>
        )}
        {subtext && !trend && (
          <div className="text-xs text-white/70">{subtext}</div>
        )}
      </div>
    </div>
  );
}
