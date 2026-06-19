export const todayStr = (): string => {
  const d = new Date();
  return formatDate(d);
};

export const formatDate = (d: Date | string): string => {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const formatDateTime = (d: Date | string): string => {
  const date = typeof d === "string" ? new Date(d) : d;
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(date)} ${h}:${min}`;
};

export const lastNDays = (n: number): string[] => {
  const result: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    result.push(formatDate(d));
  }
  return result;
};

export const uid = (): string => {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
};

export const paymentStatusLabel = (s: string): string => {
  return { unpaid: "待付款", paid: "已付款", refunded: "已退款" }[s] ?? s;
};

export const paymentStatusColor = (s: string): string => {
  return (
    {
      unpaid: "bg-warning-50 text-warning-600",
      paid: "bg-success-50 text-success-600",
      refunded: "bg-neutral-100 text-neutral-500",
    }[s] ?? "bg-neutral-100 text-neutral-500"
  );
};

export const packingStatusLabel = (s: string): string => {
  return { pending: "待分装", packed: "已分装", exception: "异常" }[s] ?? s;
};

export const packingStatusColor = (s: string): string => {
  return (
    {
      pending: "bg-neutral-100 text-neutral-500",
      packed: "bg-success-50 text-success-600",
      exception: "bg-danger-50 text-danger-500",
    }[s] ?? "bg-neutral-100 text-neutral-500"
  );
};

export const pickupStatusLabel = (s: string): string => {
  return { pending: "待取餐", picked: "已取餐" }[s] ?? s;
};

export const pickupStatusColor = (s: string): string => {
  return (
    {
      pending: "bg-warning-50 text-warning-600",
      picked: "bg-success-50 text-success-600",
    }[s] ?? "bg-neutral-100 text-neutral-500"
  );
};

export const exceptionTypeLabel = (t: string): string => {
  return (
    {
      missing: "漏餐",
      spilled: "洒漏",
      wrongSpice: "错辣度",
      other: "其他",
    }[t] ?? t
  );
};

export const exceptionStatusLabel = (s: string): string => {
  return { pending: "待处理", processing: "处理中", resolved: "已解决" }[s] ?? s;
};

export const exceptionStatusColor = (s: string): string => {
  return (
    {
      pending: "bg-danger-50 text-danger-500",
      processing: "bg-warning-50 text-warning-600",
      resolved: "bg-success-50 text-success-600",
    }[s] ?? "bg-neutral-100 text-neutral-500"
  );
};

export const refundStatusLabel = (s: string): string => {
  return { none: "无需退款", pending: "退款待处理", done: "已退款" }[s] ?? s;
};

export const refundStatusColor = (s: string): string => {
  return (
    {
      none: "bg-neutral-100 text-neutral-500",
      pending: "bg-warning-50 text-warning-600",
      done: "bg-success-50 text-success-600",
    }[s] ?? "bg-neutral-100 text-neutral-500"
  );
};
