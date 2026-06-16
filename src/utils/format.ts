export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysSince(dateString: string): number {
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getBudgetStatusText(status: string): string {
  const map: Record<string, string> = {
    pending_teacher: '待老师审批',
    active: '已生效',
    rejected: '已驳回',
  };
  return map[status] || status;
}

export function getReimbursementStatusText(status: string): string {
  const map: Record<string, string> = {
    draft: '待提交',
    pending_teacher: '待老师审批',
    pending_finance: '待财务',
    paid: '已打款',
    rejected: '已驳回',
  };
  return map[status] || status;
}
