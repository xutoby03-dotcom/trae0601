import { type ColorStock, type InspectionRecord, type MeetingRoom, COLOR_OPTIONS } from '@/types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function checkStockLevel(count: number, minStock: number): boolean {
  return count < minStock;
}

export function calculateConsecutiveShortage(
  currentRoomId: string,
  currentColor: string,
  allRecords: InspectionRecord[]
): number {
  let consecutive = 0;
  const roomRecords = allRecords
    .filter((r) => r.roomId === currentRoomId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  for (const record of roomRecords) {
    const colorStock = record.colorStocks.find(
      (cs) => cs.color === currentColor
    );
    if (colorStock && colorStock.belowMin) {
      consecutive++;
    } else {
      break;
    }
  }
  return consecutive;
}

export function createColorStocks(
  room: MeetingRoom,
  counts: Record<string, number>
): ColorStock[] {
  return room.defaultColors.map((color) => {
    const colorOption = COLOR_OPTIONS.find((c) => c.color === color);
    const count = counts[color] ?? 0;
    return {
      color,
      colorName: colorOption?.colorName ?? color,
      count,
      belowMin: checkStockLevel(count, room.minStock),
      consecutiveShortage: 0,
    };
  });
}

export function getItemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    marker: '白板笔',
    eraser: '橡皮',
    spray: '清洁喷雾',
    magnet: '磁贴',
  };
  return labels[type] ?? type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待补货',
    ordered: '已下单',
    completed: '已完成',
  };
  return labels[status] ?? status;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => {
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      })
      .join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
