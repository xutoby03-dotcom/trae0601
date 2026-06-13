import { useMemo } from "react";
import {
  Clock,
  CheckCircle,
  Hammer,
  PackageX,
  Trash2,
  AlertCircle,
  UserRound,
} from "lucide-react";
import type { RepairOrder, RepairLog } from "@/types";
import { STATUS_META } from "@/types";
import { useUserStore } from "@/store/userStore";
import { formatDate, relativeTime } from "@/utils/date";
import { cn } from "@/lib/utils";

interface StatusTimelineProps {
  repairOrder: RepairOrder;
  logs: RepairLog[];
}

const statusIcons = {
  pending: AlertCircle,
  processing: Hammer,
  waiting_parts: PackageX,
  completed: CheckCircle,
  scrapped: Trash2,
} as const;

export default function StatusTimeline({ repairOrder, logs }: StatusTimelineProps) {
  const users = useUserStore((s) => s.users);
  const getUserById = useUserStore((s) => s.getUserById);

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [logs]
  );

  const currentStatus = repairOrder.status;

  return (
    <div className="relative pl-1">
      {sortedLogs.map((log, index) => {
        const isLast = index === sortedLogs.length - 1;
        const meta = STATUS_META[log.toStatus];
        const Icon = statusIcons[log.toStatus] ?? Clock;
        const handler = getUserById(log.handlerId);
        const isCurrent = isLast && log.toStatus === currentStatus && !repairOrder.closedAt;

        return (
          <div key={log.id} className="relative pb-7 last:pb-0">
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[15px] top-[30px] w-px h-[calc(100%-22px)]",
                  "bg-walnut-100"
                )}
              />
            )}

            <div className="flex gap-4">
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center ring-4",
                    meta.bgColor,
                    isCurrent && "animate-pulse-ring"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center",
                      meta.bgColor
                    )}
                  >
                    <Icon
                      className={cn("w-3.5 h-3.5", meta.color)}
                      strokeWidth={2.2}
                    />
                  </div>
                </div>
                {isCurrent && (
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full",
                      meta.dotColor,
                      "animate-ping opacity-75"
                    )}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={cn("font-semibold text-sm", meta.color)}>
                    {meta.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-walnut-500">
                    {handler?.avatar ? (
                      <img
                        src={handler.avatar}
                        alt={handler.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <UserRound className="w-3.5 h-3.5" />
                    )}
                    <span>{handler?.name ?? "未知用户"}</span>
                  </span>
                </div>

                {log.note && (
                  <p className="text-sm text-walnut-700 leading-relaxed mb-2">
                    {log.note}
                  </p>
                )}

                <div className="flex items-center gap-1 text-[11px] text-walnut-400">
                  <Clock className="w-3 h-3" />
                  <time dateTime={log.createdAt}>
                    {formatDate(log.createdAt)} · {relativeTime(log.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {sortedLogs.length === 0 && (
        <div className="py-8 text-center text-walnut-400 text-sm">
          暂无状态记录
        </div>
      )}
    </div>
  );
}
