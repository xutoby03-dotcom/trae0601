import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TagProps {
  children: ReactNode;
  className?: string;
  variant?:
    | "default"
    | "brand"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "purple"
    | "pink";
  size?: "sm" | "md";
  dot?: boolean;
  style?: CSSProperties;
}

const variantMap: Record<string, string> = {
  default: "bg-neutral-100 text-neutral-600",
  brand: "bg-brand-50 text-brand-600",
  success: "bg-success-50 text-success-600",
  danger: "bg-danger-50 text-danger-500",
  warning: "bg-warning-50 text-warning-600",
  info: "bg-info-50 text-info-500",
  purple: "bg-purple-50 text-purple-600",
  pink: "bg-pink-50 text-pink-600",
};

export default function Tag({
  children,
  className,
  variant = "default",
  size = "sm",
  dot,
  style,
}: TagProps) {
  return (
    <span
      className={cn(
        "badge",
        variantMap[variant],
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
      style={style}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            {
              "bg-neutral-400": variant === "default",
              "bg-brand-500": variant === "brand",
              "bg-success-500": variant === "success",
              "bg-danger-500": variant === "danger",
              "bg-warning-500": variant === "warning",
              "bg-info-500": variant === "info",
              "bg-purple-500": variant === "purple",
              "bg-pink-500": variant === "pink",
            }
          )}
        />
      )}
      {children}
    </span>
  );
}
