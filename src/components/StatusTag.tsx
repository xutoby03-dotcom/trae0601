import type { CageStatus, TaskStatus, AlertSeverity } from "@/types";
import { CAGE_STATUS_LABEL, TASK_STATUS_LABEL } from "@/types";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface CageStatusTagProps {
  status: CageStatus;
}

export function CageStatusTag({ status }: CageStatusTagProps) {
  const configs: Record<CageStatus, { className: string; dotClass: string }> = {
    normal: {
      className: "bg-success-50 text-success-600 border-success-200",
      dotClass: "bg-success-500",
    },
    warning: {
      className: "bg-warning-50 text-warning-600 border-warning-200",
      dotClass: "bg-warning-500",
    },
    isolated: {
      className: "bg-danger-50 text-danger-600 border-danger-200",
      dotClass: "bg-danger-500",
    },
    empty: {
      className: "bg-slate-50 text-slate-500 border-slate-200",
      dotClass: "bg-slate-400",
    },
  };
  const cfg = configs[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {CAGE_STATUS_LABEL[status]}
    </span>
  );
}

interface TaskStatusTagProps {
  status: TaskStatus;
}

export function TaskStatusTag({ status }: TaskStatusTagProps) {
  const configs: Record<TaskStatus, string> = {
    pending: "bg-slate-100 text-slate-600",
    in_progress: "bg-blue-50 text-blue-600 border border-blue-200",
    completed: "bg-success-50 text-success-600 border border-success-200",
    overdue:
      "bg-danger-50 text-danger-600 border border-danger-300 animate-pulse-border",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${configs[status]}`}
    >
      {TASK_STATUS_LABEL[status]}
    </span>
  );
}

interface SeverityTagProps {
  severity: AlertSeverity;
}

export function SeverityTag({ severity }: SeverityTagProps) {
  const configs: Record<
    AlertSeverity,
    { className: string; label: string; icon: React.ReactNode }
  > = {
    high: {
      className: "bg-danger-50 text-danger-600",
      label: "严重",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    medium: {
      className: "bg-warning-50 text-warning-600",
      label: "中等",
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    low: {
      className: "bg-blue-50 text-blue-600",
      label: "轻微",
      icon: <Info className="w-3 h-3" />,
    },
  };
  const cfg = configs[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
