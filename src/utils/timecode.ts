export function formatTimecode(seconds: number, fps: number = 30): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function parseTimecode(timecode: string): number {
  const parts = timecode.split(':').map(Number);
  if (parts.length === 4) {
    const [hrs, mins, secs, frames] = parts;
    return hrs * 3600 + mins * 60 + secs + frames / 30;
  } else if (parts.length === 3) {
    const [hrs, mins, secs] = parts;
    return hrs * 3600 + mins * 60 + secs;
  }
  return 0;
}

export function snapToFrame(time: number, fps: number = 30): number {
  return Math.round(time * fps) / fps;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
