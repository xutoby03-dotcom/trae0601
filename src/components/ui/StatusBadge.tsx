import { STATION_STATUS_LABELS, REPAIR_STATUS_LABELS } from "../../types";
import type { StationStatus, RepairStatus } from "../../types";
import { clsx } from "clsx";
import { CheckCircle2, XCircle, AlertTriangle, Wrench } from "lucide-react";

const stationStatusConfig: Record<
  StationStatus,
  { className: string; icon: typeof CheckCircle2; pulse?: boolean }
> = {
  online: {
    className: "badge-success",
    icon: CheckCircle2,
  },
  offline: {
    className: "badge-slate",
    icon: XCircle,
  },
  fault: {
    className: "badge-danger",
    icon: AlertTriangle,
    pulse: true,
  },
  maintenance: {
    className: "badge-warning",
    icon: Wrench,
  },
};

const repairStatusConfig: Record<RepairStatus, { className: string }> = {
  pending: { className: "badge-danger" },
  processing: { className: "badge-warning" },
  maintenance: { className: "badge-primary" },
  completed: { className: "badge-success" },
  cancelled: { className: "badge-slate" },
};

export function StationStatusBadge({ status }: { status: StationStatus }) {
  const config = stationStatusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={clsx(
        config.className,
        config.pulse && "animate-pulse-soft shadow-glow-red"
      )}
    >
      <Icon className="w-3 h-3" />
      {STATION_STATUS_LABELS[status]}
    </span>
  );
}

export function RepairStatusBadge({ status }: { status: RepairStatus }) {
  const config = repairStatusConfig[status];
  return (
    <span className={config.className}>
      {REPAIR_STATUS_LABELS[status]}
    </span>
  );
}
