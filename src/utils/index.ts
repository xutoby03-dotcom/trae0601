import type { VehicleStatus } from "@/types";

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  normal: "正常",
  suspicious: "疑似废弃",
  charging_occupied: "占充电位",
  contacted: "已联系",
};

export const STATUS_COLORS: Record<VehicleStatus, string> = {
  normal: "bg-success-50 text-success-600 border-success-200",
  suspicious: "bg-warning-50 text-warning-600 border-warning-200",
  charging_occupied: "bg-danger-50 text-danger-600 border-danger-200",
  contacted: "bg-primary-50 text-primary-600 border-primary-200",
};

export const VEHICLE_TYPES = ["电动车", "自行车", "摩托车", "三轮车"] as const;
export const DISPOSAL_TYPES = ["车主挪走", "清运", "其他"] as const;

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function daysBetween(fromIso: string, toIso = new Date().toISOString()): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return Math.floor((to - from) / (24 * 60 * 60 * 1000));
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function request<T>(url: string, options?: RequestOptions): Promise<T> {
  const init: RequestInit = {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  };
  const res = await fetch(url, init);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || !json.data) {
    throw new Error(json.error || "请求失败");
  }
  return json.data;
}
