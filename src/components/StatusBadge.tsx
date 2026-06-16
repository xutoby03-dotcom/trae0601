import { CANOPY_STATUS_META, REPAIR_ISSUE_META } from '@/types';
import type { CanopyStatus, RepairIssueType } from '@/types';

export function CanopyStatusBadge({ status }: { status: CanopyStatus }) {
  const meta = CANOPY_STATUS_META[status];
  return <span className={`badge ${meta.color}`}>{meta.label}</span>;
}

export function RepairIssueBadge({ type }: { type: RepairIssueType }) {
  const meta = REPAIR_ISSUE_META[type];
  return <span className={`badge border ${meta.color}`}>{meta.label}</span>;
}

export function OverdueBadge({ overdue }: { overdue: boolean }) {
  if (!overdue) return null;
  return <span className="badge bg-red-100 text-red-700">已超时</span>;
}

export function WetBadge({ wet }: { wet: boolean }) {
  if (!wet) return null;
  return <span className="badge bg-sky-100 text-sky-700">湿收</span>;
}
