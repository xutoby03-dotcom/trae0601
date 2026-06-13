import { STATUS_META, type RepairStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusTagProps {
  status: RepairStatus;
  className?: string;
  pulse?: boolean;
}

export default function StatusTag({ status, className, pulse }: StatusTagProps) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        meta.bgColor,
        meta.color,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          meta.dotColor,
          pulse && "animate-pulse-ring"
        )}
      />
      {meta.label}
    </span>
  );
}
