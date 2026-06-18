import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "danger" | "info" | "default";

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-success-50 text-success-600 border-success-200",
  warning: "bg-warning-50 text-warning-600 border-warning-200",
  danger: "bg-danger-50 text-danger-600 border-danger-200",
  info: "bg-primary-50 text-primary-600 border-primary-200",
  default: "bg-gray-50 text-gray-600 border-gray-200",
};

const dotStyles: Record<StatusType, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-primary-500",
  default: "bg-gray-500",
};

export function StatusBadge({ status, children, className, dot = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border",
        statusStyles[status],
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotStyles[status])} />}
      {children}
    </span>
  );
}
