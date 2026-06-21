export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatFileSize(mb: number): string {
  if (!isFinite(mb) || mb < 0) return "0 MB";
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }
  if (mb < 1) {
    const kb = mb * 1024;
    return `${kb.toFixed(0)} KB`;
  }
  return `${mb.toFixed(2)} MB`;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日 ${weekday} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } catch {
    return isoString;
  }
}

export function formatCoords(lat: number, lng: number): string {
  if (!isFinite(lat) || !isFinite(lng)) return "--";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function formatDbfs(value: number): string {
  if (!isFinite(value)) return "-- dBFS";
  return `${value.toFixed(1)} dBFS`;
}
