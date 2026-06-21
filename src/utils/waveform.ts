function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWaveform(duration: number, seed: number): number[] {
  const points = 800;
  const rand = mulberry32(seed);
  const waveform: number[] = new Array(points);

  const numEnvelopes = 3 + Math.floor(rand() * 4);
  const envelopes: Array<{
    center: number;
    width: number;
    amplitude: number;
    phase: number;
    freq: number;
  }> = [];

  for (let e = 0; e < numEnvelopes; e++) {
    envelopes.push({
      center: rand() * points,
      width: 50 + rand() * 250,
      amplitude: 0.3 + rand() * 0.5,
      phase: rand() * Math.PI * 2,
      freq: 0.02 + rand() * 0.08,
    });
  }

  const numSpikes = 2 + Math.floor(rand() * 6);
  const spikes: Array<{ pos: number; amp: number; width: number }> = [];
  for (let s = 0; s < numSpikes; s++) {
    spikes.push({
      pos: rand() * points,
      amp: 0.6 + rand() * 0.4,
      width: 2 + rand() * 8,
    });
  }

  const numDips = 1 + Math.floor(rand() * 3);
  const dips: Array<{ pos: number; depth: number; width: number }> = [];
  for (let d = 0; d < numDips; d++) {
    dips.push({
      pos: rand() * points,
      depth: 0.3 + rand() * 0.5,
      width: 30 + rand() * 100,
    });
  }

  for (let i = 0; i < points; i++) {
    let envelope = 0;
    for (const env of envelopes) {
      const dist = (i - env.center) / env.width;
      const gaussian = Math.exp(-dist * dist * 2);
      const modulation = Math.sin(i * env.freq + env.phase) * 0.3 + 0.7;
      envelope += gaussian * env.amplitude * modulation;
    }

    const noise = (rand() - 0.5) * 0.15;

    let spike = 0;
    for (const sp of spikes) {
      const dist = Math.abs(i - sp.pos);
      if (dist < sp.width) {
        const t = dist / sp.width;
        spike += (1 - t * t) * sp.amp;
      }
    }

    let dipFactor = 1;
    for (const dp of dips) {
      const dist = (i - dp.pos) / dp.width;
      const gaussian = Math.exp(-dist * dist * 3);
      dipFactor *= 1 - gaussian * dp.depth;
    }

    let sample = (envelope + noise + spike) * dipFactor;
    sample = sample * 2 - 1;

    const sign = rand() > 0.5 ? 1 : -1;
    waveform[i] = Math.max(-1, Math.min(1, sample * sign));
  }

  const fadeIn = Math.min(30, points * 0.05);
  const fadeOut = Math.min(30, points * 0.05);
  for (let i = 0; i < fadeIn; i++) {
    const factor = i / fadeIn;
    waveform[i] *= factor;
  }
  for (let i = points - fadeOut; i < points; i++) {
    const factor = (points - i) / fadeOut;
    waveform[i] *= factor;
  }

  return waveform;
}

export function normalizeWaveform(data: number[]): number[] {
  if (data.length === 0) return [];
  let max = 0;
  for (const v of data) {
    const abs = Math.abs(v);
    if (abs > max) max = abs;
  }
  if (max === 0) return data.slice();
  return data.map((v) => v / max);
}

export function downsampleWaveform(
  data: number[],
  targetLength: number
): number[] {
  if (data.length === 0) return [];
  if (data.length <= targetLength) return data.slice();

  const result: number[] = new Array(targetLength);
  const ratio = data.length / targetLength;

  for (let i = 0; i < targetLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    let peak = 0;
    for (let j = start; j < end && j < data.length; j++) {
      const abs = Math.abs(data[j]);
      if (abs > peak) peak = abs;
    }
    result[i] = peak > 0 ? (data[start] >= 0 ? peak : -peak) : 0;
  }

  return result;
}

export function getPeakDbfs(waveform: number[]): number {
  if (waveform.length === 0) return -96;
  let max = 0;
  for (const v of waveform) {
    const abs = Math.abs(v);
    if (abs > max) max = abs;
  }
  if (max === 0) return -96;
  return 20 * Math.log10(max);
}
