export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(expectedReturnDate: string): boolean {
  return new Date(expectedReturnDate) < new Date(new Date().toDateString());
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function gradeColor(grade: string): string {
  const colors: Record<string, string> = {
    一年级: "bg-rose-100 text-rose-700 border-rose-200",
    二年级: "bg-orange-100 text-orange-700 border-orange-200",
    三年级: "bg-amber-100 text-amber-700 border-amber-200",
    四年级: "bg-emerald-100 text-emerald-700 border-emerald-200",
    五年级: "bg-sky-100 text-sky-700 border-sky-200",
    六年级: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return colors[grade] || "bg-gray-100 text-gray-700 border-gray-200";
}

export function statusConfig(status: string) {
  const configs: Record<string, { label: string; className: string }> = {
    available: { label: "可借阅", className: "bg-forest-500 text-white" },
    borrowed: { label: "已借出", className: "bg-primary-500 text-white" },
    damaged: { label: "破损", className: "bg-red-500 text-white" },
    offline: { label: "下架", className: "bg-gray-500 text-white" },
    overdue: { label: "已逾期", className: "bg-red-500 text-white" },
    returned: { label: "已归还", className: "bg-forest-500 text-white" },
    pending: { label: "待审核", className: "bg-amber-500 text-white" },
    approved: { label: "已通过", className: "bg-forest-500 text-white" },
    rejected: { label: "已拒绝", className: "bg-red-500 text-white" },
  };
  return configs[status] || { label: status, className: "bg-gray-500 text-white" };
}

export function rejectReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    damaged: "书籍破损",
    duplicate: "重复太多",
    inappropriate: "内容不适合低年级",
  };
  return labels[reason] || reason;
}
