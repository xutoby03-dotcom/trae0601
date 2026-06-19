import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
}

export default function StatCard({ title, value, icon, trend, gradientFrom, gradientTo, iconBg }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-5 text-white shadow-sm",
        "bg-gradient-to-br",
        gradientFrom,
        gradientTo
      )}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-2 w-20 h-20 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80">{title}</p>
          <p className="text-3xl font-bold mt-2 tracking-tight">{value}</p>
          {trend && <p className="text-xs text-white/70 mt-1">{trend}</p>}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
