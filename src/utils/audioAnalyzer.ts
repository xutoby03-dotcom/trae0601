export const detectBPM = (audioBuffer: AudioBuffer): number => {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.floor(sampleRate * 0.05);
  const hopSize = Math.floor(windowSize / 2);
  const energy: number[] = [];

  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += Math.abs(channelData[i + j]);
    }
    energy.push(sum / windowSize);
  }

  const peaks: number[] = [];
  const threshold = calculateThreshold(energy);
  
  for (let i = 1; i < energy.length - 1; i++) {
    if (energy[i] > threshold && energy[i] > energy[i - 1] && energy[i] > energy[i + 1]) {
      peaks.push(i * hopSize / sampleRate);
    }
  }

  if (peaks.length < 2) return 0;

  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const bpm = Math.round(60 / avgInterval);

  if (bpm >= 60 && bpm <= 200) {
    return bpm;
  }
  
  if (bpm < 60) return bpm * 2;
  if (bpm > 200) return Math.round(bpm / 2);
  
  return bpm;
};

const calculateThreshold = (data: number[]): number => {
  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return median * 1.5;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
