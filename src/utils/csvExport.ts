import { DailyStats, DepartmentStats, BorrowRecord } from "@/types";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(values: (string | number)[]): string {
  return values.map(escapeCsv).join(",") + "\n";
}

export function downloadCsv(content: string, filename: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateDailyStatsCsv(
  dailyStats: DailyStats[],
  cardTypeLabel: string
): string {
  let csv = toCsvRow(["日期", "访客卡借用数", "员工临时卡借用数", "合计"]);
  dailyStats.forEach((d) => {
    csv += toCsvRow([
      d.date,
      d.visitorCount,
      d.employeeCount,
      d.visitorCount + d.employeeCount,
    ]);
  });
  csv += toCsvRow([]);
  csv += toCsvRow(["筛选条件", cardTypeLabel]);
  return csv;
}

export function generateOverdueCsv(
  records: BorrowRecord[],
  dateRangeLabel: string,
  cardTypeLabel: string
): string {
  let csv = toCsvRow([
    "卡号",
    "卡类型",
    "借用人",
    "部门",
    "联系方式",
    "借出时间",
    "预计归还时间",
    "超时时长",
  ]);
  records.forEach((r) => {
    csv += toCsvRow([
      r.cardNumber,
      r.cardType === "visitor" ? "访客卡" : "员工临时卡",
      r.borrowerName,
      r.department,
      r.contact,
      r.borrowTime,
      r.expectedReturnTime,
      getOverdueDuration(r.expectedReturnTime),
    ]);
  });
  csv += toCsvRow([]);
  csv += toCsvRow(["筛选条件 - 日期", dateRangeLabel]);
  csv += toCsvRow(["筛选条件 - 卡类型", cardTypeLabel]);
  return csv;
}

export function generateDepartmentRankingCsv(
  ranking: DepartmentStats[],
  dateRangeLabel: string,
  cardTypeLabel: string
): string {
  let csv = toCsvRow(["排名", "部门/单位", "借用次数"]);
  ranking.forEach((d, index) => {
    csv += toCsvRow([index + 1, d.department, d.count]);
  });
  csv += toCsvRow([]);
  csv += toCsvRow(["筛选条件 - 日期", dateRangeLabel]);
  csv += toCsvRow(["筛选条件 - 卡类型", cardTypeLabel]);
  return csv;
}

export function generateFullExportCsv(
  dailyStats: DailyStats[],
  overdueRecords: BorrowRecord[],
  ranking: DepartmentStats[],
  filters: {
    cardType: string;
    dateRange: string;
  }
): string {
  let csv = "";
  csv += toCsvRow(["=== 每日借用量统计 ==="]);
  csv += toCsvRow([]);
  csv += generateDailyStatsCsv(dailyStats, filters.cardType);
  csv += toCsvRow([]);
  csv += toCsvRow([]);
  csv += toCsvRow(["=== 超时未还列表 ==="]);
  csv += toCsvRow([]);
  csv += generateOverdueCsv(overdueRecords, filters.dateRange, filters.cardType);
  csv += toCsvRow([]);
  csv += toCsvRow([]);
  csv += toCsvRow(["=== 部门/单位借用排行 ==="]);
  csv += toCsvRow([]);
  csv += generateDepartmentRankingCsv(ranking, filters.dateRange, filters.cardType);
  return csv;
}

function getOverdueDuration(expectedTime: string): string {
  const diff = Date.now() - new Date(expectedTime).getTime();
  if (diff <= 0) return "未超时";
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}天${hours}小时${minutes}分钟`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}
