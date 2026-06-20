import type { PointSession, RoutePoint } from '@/types';

export function compressDurations(
  pointSessions: PointSession[],
  routePoints: RoutePoint[],
  currentIndex: number,
  extraSeconds: number
): PointSession[] {
  if (extraSeconds <= 0 || pointSessions.length === 0) {
    return [...pointSessions];
  }

  const isKeyPointMap = new Map(
    routePoints.map((rp) => [rp.id, rp.isKeyPoint])
  );

  const result = pointSessions.map((ps) => ({ ...ps }));
  let remainingToCompress = extraSeconds;

  const pendingSessions = result
    .map((ps, idx) => ({ session: ps, index: idx }))
    .filter(({ session, index }) => index > currentIndex && !session.isCompleted);

  const nonKeyPoints = pendingSessions.filter(
    ({ session }) => !isKeyPointMap.get(session.pointId)
  );

  for (const { session } of nonKeyPoints) {
    if (remainingToCompress <= 0) break;

    const minDuration = Math.max(30, Math.floor(session.plannedDuration * 0.3));
    const compressible = Math.max(0, session.adjustedDuration - minDuration);

    if (compressible > 0) {
      const toCompress = Math.min(compressible, remainingToCompress);
      session.adjustedDuration -= toCompress;
      remainingToCompress -= toCompress;
    }
  }

  if (remainingToCompress > 0) {
    const keyPoints = pendingSessions.filter(
      ({ session }) => isKeyPointMap.get(session.pointId)
    );

    const totalCompressible = keyPoints.reduce((sum, { session }) => {
      const minDuration = Math.floor(session.plannedDuration * 0.5);
      return sum + Math.max(0, session.adjustedDuration - minDuration);
    }, 0);

    if (totalCompressible > 0) {
      const ratio = Math.min(1, remainingToCompress / totalCompressible);

      for (const { session } of keyPoints) {
        const minDuration = Math.floor(session.plannedDuration * 0.5);
        const compressible = Math.max(0, session.adjustedDuration - minDuration);
        const toCompress = Math.floor(compressible * ratio);

        session.adjustedDuration -= toCompress;
        remainingToCompress -= toCompress;
      }
    }
  }

  return result;
}
