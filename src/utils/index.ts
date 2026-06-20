export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function formatTimeShort(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function extractWaveformData(
  audioUrl: string,
  samples: number = 1000
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = audioUrl;

    audio.addEventListener('canplaythrough', async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channelData.length / samples);
        const waveformData: number[] = [];

        for (let i = 0; i < samples; i++) {
          const start = i * blockSize;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[start + j] || 0);
          }
          waveformData.push(sum / blockSize);
        }

        const max = Math.max(...waveformData);
        const normalized = waveformData.map(v => v / (max || 1));
        audioContext.close();
        resolve(normalized);
      } catch (error) {
        reject(error);
      }
    });

    audio.addEventListener('error', () => {
      reject(new Error('Failed to load audio'));
    });
  });
}

export function generateMockWaveform(samples: number = 1000, seed: number = 42): number[] {
  const waveform: number[] = [];
  let s = seed;
  const random = () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };

  for (let i = 0; i < samples; i++) {
    const base = 0.3 + random() * 0.5;
    const beat = Math.sin(i * 0.1) * 0.15;
    const noise = (random() - 0.5) * 0.1;
    let value = base + beat + noise;
    if (i > samples * 0.1 && i < samples * 0.9) {
      value += 0.1;
    }
    waveform.push(Math.max(0.05, Math.min(1, value)));
  }
  return waveform;
}
