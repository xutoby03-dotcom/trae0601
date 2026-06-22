import type { TickInterval, AnomalyMark, AnomalyType } from '@/types/calibration';

const IDEAL_BEAT_RATE = 18000;
const IDEAL_INTERVAL = 3600000 / IDEAL_BEAT_RATE;

export function generateTickIntervals(
  pendulumLength: number,
  escapementPosition: number,
  windingDegree: number,
  testDuration: number,
  hourlyError: number
): TickInterval[] {
  const totalSeconds = testDuration * 3600;
  const totalTicks = Math.floor(totalSeconds / (IDEAL_INTERVAL / 1000));
  const maxTicks = Math.min(totalTicks, 500);
  const step = Math.max(1, Math.floor(totalTicks / maxTicks));
  const ticks: TickInterval[] = [];

  const lengthDeviation = (pendulumLength - 100) / 100;
  const positionDeviation = (escapementPosition - 0) / 45;
  const windingFactor = windingDegree / 100;
  const errorPerTick = hourlyError / 3600;

  const isLowWinding = windingDegree < 30;
  const isMediumLowWinding = windingDegree >= 30 && windingDegree < 60;
  const isExtremePosition = Math.abs(escapementPosition) > 10;
  const isTooShort = pendulumLength < 70;
  const isTooLong = pendulumLength > 130;

  for (let i = 0; i < maxTicks; i++) {
    const direction: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';

    let baseInterval = IDEAL_INTERVAL;
    baseInterval += errorPerTick * (IDEAL_INTERVAL / 1000);

    const asymmetry = positionDeviation * (direction === 'left' ? 1 : -1) * 5;
    baseInterval += asymmetry;

    const amplitudeMod = 1 + lengthDeviation * 0.02;
    const windingMod = 0.5 + windingFactor * 0.5;

    const noise = (Math.random() - 0.5) * 2;
    baseInterval += noise;

    let decay = Math.max(0.3, windingMod) * (1 - (i / maxTicks) * (1 - windingMod) * 0.3);

    if (isTooLong || isMediumLowWinding) {
      const extraDecay = 0.55 + Math.sin(i * 0.08) * 0.1;
      decay *= extraDecay;
    }

    baseInterval *= decay * amplitudeMod;

    if (isLowWinding || isTooShort) {
      const stopProbability = isLowWinding ? 0.04 : 0.02;
      if (i > maxTicks * 0.3 && Math.random() < stopProbability) {
        baseInterval = Math.random() * 0.8;
      }
    }

    if (isExtremePosition) {
      const jamProbability = 0.025;
      if (i > 5 && i < maxTicks - 5 && Math.random() < jamProbability) {
        if (Math.random() < 0.5) {
          baseInterval *= 2.2 + Math.random() * 0.8;
        } else {
          baseInterval *= 0.3 + Math.random() * 0.2;
        }
      }
    }

    ticks.push({
      index: i * step,
      interval: Math.max(0, baseInterval),
      direction,
    });
  }

  return ticks;
}

export function detectAnomalies(
  ticks: TickInterval[],
  sessionId: string,
  recordId: string
): AnomalyMark[] {
  const anomalies: AnomalyMark[] = [];
  let idCounter = 0;

  const leftTicks = ticks.filter((t) => t.direction === 'left');
  const rightTicks = ticks.filter((t) => t.direction === 'right');

  if (leftTicks.length > 0 && rightTicks.length > 0) {
    const avgLeft = leftTicks.reduce((s, t) => s + t.interval, 0) / leftTicks.length;
    const avgRight = rightTicks.reduce((s, t) => s + t.interval, 0) / rightTicks.length;
    const asymmetry = Math.abs(avgLeft - avgRight) / ((avgLeft + avgRight) / 2);

    if (asymmetry > 0.05) {
      const severity: 'low' | 'medium' | 'high' =
        asymmetry > 0.2 ? 'high' : asymmetry > 0.1 ? 'medium' : 'low';
      anomalies.push({
        id: `${recordId}-offbeat-${idCounter++}`,
        sessionId,
        recordId,
        type: 'OFF_BEAT',
        position: 0,
        severity,
        description: `左右摆幅不对称 ${(asymmetry * 100).toFixed(1)}%（左${avgLeft.toFixed(1)}ms 右${avgRight.toFixed(1)}ms）`,
        detectedAt: Date.now(),
      });
    }
  }

  for (let i = 1; i < ticks.length; i++) {
    if (ticks[i].interval < 1) {
      anomalies.push({
        id: `${recordId}-stopped-${idCounter++}`,
        sessionId,
        recordId,
        type: 'STOPPED',
        position: ticks[i].index,
        severity: 'high',
        description: `第${ticks[i].index}拍停摆，间隔${ticks[i].interval.toFixed(2)}ms`,
        detectedAt: Date.now(),
      });
    }
  }

  if (ticks.length > 10) {
    const firstTen = ticks.slice(0, 10);
    const lastTen = ticks.slice(-10);
    const avgFirst = firstTen.reduce((s, t) => s + t.interval, 0) / firstTen.length;
    const avgLast = lastTen.reduce((s, t) => s + t.interval, 0) / lastTen.length;

    if (avgFirst > 1 && avgLast < avgFirst * 0.65) {
      const weakIdx = Math.floor(ticks.length * 0.7);
      anomalies.push({
        id: `${recordId}-weak-${idCounter++}`,
        sessionId,
        recordId,
        type: 'WEAK_RETURN',
        position: ticks[weakIdx].index,
        severity: avgLast < avgFirst * 0.35 ? 'high' : 'medium',
        description: `回摆无力，振幅衰减${(((avgFirst - avgLast) / avgFirst) * 100).toFixed(1)}%（起始${avgFirst.toFixed(1)}ms → 末尾${avgLast.toFixed(1)}ms）`,
        detectedAt: Date.now(),
      });
    }
  }

  for (let i = 1; i < ticks.length; i++) {
    const prev = ticks[i - 1].interval;
    const curr = ticks[i].interval;
    if (prev > 1 && curr > 1) {
      const change = Math.abs(curr - prev) / prev;
      if (change > 0.35) {
        anomalies.push({
          id: `${recordId}-jam-${idCounter++}`,
          sessionId,
          recordId,
          type: 'GEAR_JAM',
          position: ticks[i].index,
          severity: change > 0.7 ? 'high' : 'medium',
          description: `第${ticks[i].index}拍疑似齿轮卡滞，间隔突变${(change * 100).toFixed(1)}%（${prev.toFixed(1)} → ${curr.toFixed(1)}ms）`,
          detectedAt: Date.now(),
        });
      }
    }
  }

  return anomalies;
}
