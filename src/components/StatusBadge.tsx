import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  type: "success" | "warning" | "danger" | "neutral" | "info";
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export default function StatusBadge({
  type,
  children,
  className,
  pulse = false,
}: StatusBadgeProps) {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    neutral: "bg-gray-100 text-gray-600 border-gray-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const pulseStyles = {
    success: "animate-pulse",
    warning: "animate-pulse",
    danger: "animate-pulse",
    neutral: "",
    info: "",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border",
        styles[type],
        pulse && pulseStyles[type],
        className
      )}
    >
      {children}
    </span>
  );
}
