import type { VehicleStatus } from "@/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/utils";

export default function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
