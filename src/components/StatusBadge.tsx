import { statusConfig } from "@/utils/helpers";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig(status);
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}
