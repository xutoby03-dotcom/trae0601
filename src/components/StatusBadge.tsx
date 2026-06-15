import type { Device } from "@/types"
import { clsx } from "clsx"

const statusConfig: Record<Device["status"], { label: string; className: string }> = {
  idle: {
    label: "空闲",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  borrowed: {
    label: "借出",
    className: "bg-brand-50 text-brand-700 border-brand-200",
  },
  overdue: {
    label: "逾期",
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

const accountStatusConfig: Record<Device["accountStatus"], { label: string; className: string }> = {
  active: {
    label: "有效",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  expired: {
    label: "已过期",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  none: {
    label: "无账号",
    className: "bg-slate-50 text-slate-500 border-slate-200",
  },
}

export function StatusBadge({ status }: { status: Device["status"] }) {
  const cfg = statusConfig[status]
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        cfg.className
      )}
    >
      <span
        className={clsx("w-1.5 h-1.5 rounded-full", {
          "bg-emerald-500": status === "idle",
          "bg-brand-500": status === "borrowed",
          "bg-red-500": status === "overdue",
        })}
      />
      {cfg.label}
    </span>
  )
}

export function AccountStatusBadge({ status }: { status: Device["accountStatus"] }) {
  const cfg = accountStatusConfig[status]
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  )
}

export function FirmwareBadge({
  current,
  standard,
}: {
  current: string
  standard: string
}) {
  const isStandard = current === standard
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        isStandard
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-700 border-red-200"
      )}
    >
      {current}
      {!isStandard && <span className="text-red-500">≠ {standard}</span>}
    </span>
  )
}

export function SeverityBadge({
  severity,
}: {
  severity: "high" | "medium" | "low"
}) {
  const cfg = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-brand-50 text-brand-700 border-brand-200",
    low: "bg-slate-50 text-slate-600 border-slate-200",
  }
  const labels = { high: "高", medium: "中", low: "低" }
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        cfg[severity]
      )}
    >
      {labels[severity]}
    </span>
  )
}
