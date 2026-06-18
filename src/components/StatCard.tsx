import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/helpers";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  textColor: string;
  subtitle?: string;
  warning?: boolean;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  textColor,
  subtitle,
  warning,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl p-6 card-shadow card-hover overflow-hidden relative",
        onClick && "cursor-pointer"
      )}
      style={{ animationDelay: "0.1s" }}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -mr-10 -mt-10",
          gradient
        )}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center",
              gradient,
              warning && "animate-pulse-soft"
            )}
          >
            <Icon className={cn("w-7 h-7", textColor)} />
          </div>
          {warning && (
            <span className="px-3 py-1 bg-warning-100 text-warning-600 text-xs font-semibold rounded-full animate-pulse-soft">
              需要注意
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className={cn("text-4xl font-bold", textColor)}>{value}</p>
        {subtitle && <p className="text-gray-400 text-sm mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}
