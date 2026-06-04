export interface SRTSubtitle {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

export function parseSRT(content: string): SRTSubtitle[] {
  const subtitles: SRTSubtitle[] = [];
  const blocks = content.trim().split(/\n\n+/);
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;
    
    const index = parseInt(lines[0], 10);
    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    
    if (!timeMatch) continue;
    
    const startTime = 
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;
    
    const endTime = 
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;
    
    const text = lines.slice(2).join('\n');
    
    subtitles.push({ index, startTime, endTime, text });
  }
  
  return subtitles;
}

export function formatSRTTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function toSRT(subtitles: SRTSubtitle[]): string {
  return subtitles
    .map((sub) => {
      return `${sub.index}\n${formatSRTTime(sub.startTime)} --> ${formatSRTTime(sub.endTime)}\n${sub.text}\n`;
    })
    .join('\n');
}
