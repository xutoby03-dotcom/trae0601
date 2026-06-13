import type { ComponentType, ReactNode } from "react";
import {
  PackageOpen,
  Music,
  FileX2,
  ClipboardList,
  BarChart3,
  SearchX,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyIconPreset =
  | "package"
  | "music"
  | "file"
  | "clipboard"
  | "chart"
  | "search"
  | "inbox";

const iconPresets: Record<EmptyIconPreset, ComponentType<{ className?: string }>> = {
  package: PackageOpen,
  music: Music,
  file: FileX2,
  clipboard: ClipboardList,
  chart: BarChart3,
  search: SearchX,
  inbox: Inbox,
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: EmptyIconPreset | ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, { wrapper: string; icon: string; title: string; desc: string }> = {
  sm: {
    wrapper: "py-8",
    icon: "w-10 h-10",
    title: "text-sm",
    desc: "text-xs",
  },
  md: {
    wrapper: "py-12",
    icon: "w-14 h-14",
    title: "text-base",
    desc: "text-sm",
  },
  lg: {
    wrapper: "py-20",
    icon: "w-20 h-20",
    title: "text-lg",
    desc: "text-sm",
  },
};

export default function EmptyState({
  title = "暂无数据",
  description,
  icon = "package",
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const Icon =
    typeof icon === "string" ? iconPresets[icon] ?? PackageOpen : icon;
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-4",
        sizes.wrapper,
        className
      )}
    >
      <div
        className={cn(
          "rounded-3xl bg-walnut-50 flex items-center justify-center mb-4",
          size === "lg" ? "p-6" : size === "md" ? "p-4" : "p-3"
        )}
      >
        <Icon
          className={cn(
            "text-walnut-300",
            sizes.icon
          )}
          strokeWidth={1.5}
        />
      </div>
      <h3
        className={cn(
          "font-semibold text-walnut-700 font-serif",
          sizes.title
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-1.5 text-walnut-400 max-w-xs leading-relaxed",
            sizes.desc
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
