import type { DailyTask, Cage } from "@/types";
import { SPECIES_LABEL } from "@/types";
import { TaskStatusTag } from "./StatusTag";
import { useStore } from "@/store";
import { CheckCircle2, Clock, AlertTriangle, ThermometerSun } from "lucide-react";

interface TaskCardProps {
  task: DailyTask;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const cage = useStore((s) => s.getCageById(task.cageId)) as Cage | undefined;
  if (!cage) return null;

  const isAlert = task.status === "overdue";

  const statusConfig = {
    pending: {
      bg: "bg-slate-50 hover:bg-slate-100",
      icon: <Clock className="w-5 h-5 text-slate-400" />,
    },
    in_progress: {
      bg: "bg-blue-50/50 hover:bg-blue-50 border-blue-200",
      icon: <Clock className="w-5 h-5 text-blue-500 animate-pulse" />,
    },
    completed: {
      bg: "bg-success-50/50 hover:bg-success-50",
      icon: <CheckCircle2 className="w-5 h-5 text-success-500" />,
    },
    overdue: {
      bg: "bg-danger-50 hover:bg-danger-50/80 animate-pulse-border",
      icon: <AlertTriangle className="w-5 h-5 text-danger-500" />,
    },
  };
  const cfg = statusConfig[task.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left card p-4 transition-all duration-200 ${cfg.bg} ${
        isAlert ? "ring-2 ring-danger-300" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-slate-900">
              {cage.cageNumber}
            </span>
            <TaskStatusTag status={task.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
            <span>{SPECIES_LABEL[cage.species]}</span>
            <span>·</span>
            <span>{cage.animalCount}只</span>
            <span>·</span>
            <span>{cage.responsiblePerson}</span>
          </div>
          {task.status === "completed" && (
            <div className="flex flex-wrap gap-2 text-xs">
              {task.feedAmount !== null && (
                <span className="bg-white px-2 py-0.5 rounded text-slate-600">
                  饲料 {task.feedAmount.toFixed(1)}g
                </span>
              )}
              {task.temperature !== null && (
                <span className="bg-white px-2 py-0.5 rounded text-slate-600 flex items-center gap-1">
                  <ThermometerSun className="w-3 h-3" />
                  {task.temperature.toFixed(1)}°C
                </span>
              )}
              {task.completedAt && (
                <span className="text-slate-400 ml-auto">
                  {task.completedAt.split(" ")[1]}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
