import { BorrowRecord } from "@/types";
import { isOverdue, isSoonOverdue } from "@/utils/dateUtils";

interface StatusBadgeProps {
  record: BorrowRecord;
}

export default function StatusBadge({ record }: StatusBadgeProps) {
  if (record.status === "returned") {
    return (
      <span className="status-badge bg-teal-50 text-teal-700 border border-teal-200">
        已归还
      </span>
    );
  }

  if (record.status === "lost") {
    return (
      <span className="status-badge bg-red-50 text-red-700 border border-red-200">
        已挂失
      </span>
    );
  }

  if (isOverdue(record.expectedReturnTime)) {
    return (
      <span className="status-badge bg-red-50 text-red-700 border border-red-200 animate-pulse">
        已超时
      </span>
    );
  }

  if (isSoonOverdue(record.expectedReturnTime)) {
    return (
      <span className="status-badge bg-orange-50 text-orange-700 border border-orange-200">
        即将超时
      </span>
    );
  }

  return (
    <span className="status-badge bg-brand-50 text-brand-700 border border-brand-200">
      使用中
    </span>
  );
}
