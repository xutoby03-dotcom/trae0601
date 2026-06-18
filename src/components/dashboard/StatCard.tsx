import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient: string;
  iconColor?: string;
  subText?: string;
  delay?: number;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  iconColor = "text-white",
  subText,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="card card-hover p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brown-700/60 mb-1">{label}</p>
          <p className="font-display text-3xl font-bold text-brown-900">
            {value}
          </p>
          {subText && (
            <p className="text-xs text-brown-700/50 mt-1">{subText}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gradient}`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
