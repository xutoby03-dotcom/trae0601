import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  variant?: "available" | "in_use" | "faulty" | "upcoming" | "ongoing" | "completed" | "overtime" | "pending" | "repairing" | "resolved";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  in_use: "bg-blue-100 text-blue-700",
  faulty: "bg-red-100 text-red-700",
  upcoming: "bg-yellow-100 text-yellow-700",
  ongoing: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  overtime: "bg-red-100 text-red-700",
  pending: "bg-orange-100 text-orange-700",
  repairing: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

export default function StatusBadge({ variant = "available", children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant] || variantStyles.available,
        className
      )}
    >
      {children}
    </span>
  );
}
