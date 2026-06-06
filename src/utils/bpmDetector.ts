export async function detectBPM(audioBuffer: AudioBuffer): Promise<number> {
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  
  const windowSize = Math.floor(sampleRate * 0.05);
  const hopSize = Math.floor(windowSize / 2);
  const energies: number[] = [];
  
  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    let energy = 0;
    for (let j = 0; j < windowSize; j++) {
      energy += channelData[i + j] * channelData[i + j];
    }
    energies.push(energy / windowSize);
  }
  
  const peaks: number[] = [];
  const threshold = calculateThreshold(energies);
  
  for (let i = 1; i < energies.length - 1; i++) {
    if (energies[i] > threshold && 
        energies[i] > energies[i - 1] && 
        energies[i] > energies[i + 1]) {
      peaks.push(i * hopSize / sampleRate);
    }
  }
  
  if (peaks.length < 2) return 120;
  
  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  
  const bpmCandidates = intervals
    .map(interval => 60 / interval)
    .filter(bpm => bpm >= 60 && bpm <= 200);
  
  if (bpmCandidates.length === 0) return 120;
  
  return findMostCommonBPM(bpmCandidates);
}

function calculateThreshold(energies: number[]): number {
  const sorted = [...energies].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return median * 1.5;
}

function findMostCommonBPM(bpms: number[]): number {
  const rounded = bpms.map(bpm => Math.round(bpm));
  const counts: Record<number, number> = {};
  
  rounded.forEach(bpm => {
    counts[bpm] = (counts[bpm] || 0) + 1;
  });
  
  let maxCount = 0;
  let mostCommon = 120;
  
  Object.entries(counts).forEach(([bpm, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = parseInt(bpm);
    }
  });
  
  return mostCommon;
}

export function calculateBeatPhase(currentTime: number, bpm: number): number {
  if (bpm <= 0) return 0;
  const beatDuration = 60 / bpm;
  return (currentTime % beatDuration) / beatDuration;
}

export function isBeatAligned(phaseA: number, phaseB: number): boolean {
  const diff = Math.abs(phaseA - phaseB);
  const normalizedDiff = Math.min(diff, 1 - diff);
  return normalizedDiff < 0.1;
}
