import type {
  Player,
  Route,
  Disc,
  Point,
  CollisionRisk,
  TransferWindow,
  GapInfo,
  RiskSeverity,
  WindowQuality,
} from '../types';
import {
  distance,
  getPlayerPositionAtTime,
  getRouteSegments,
  segmentsIntersect,
  getTimeAtPositionOnSegment,
} from './pathCalculations';

const COLLISION_THRESHOLD = 2;
const TIME_DIFF_THRESHOLD = 0.5;

export function detectCollisions(
  players: Player[],
  routes: Route[],
  duration: number,
): CollisionRisk[] {
  const risks: CollisionRisk[] = [];
  const offensePlayers = players.filter((p) => p.type === 'offense');
  const defensePlayers = players.filter((p) => p.type === 'defense');
  const allPlayers = [...offensePlayers, ...defensePlayers];

  for (let i = 0; i < allPlayers.length; i++) {
    for (let j = i + 1; j < allPlayers.length; j++) {
      const p1 = allPlayers[i];
      const p2 = allPlayers[j];
      const r1 = routes.find((r) => r.playerId === p1.id);
      const r2 = routes.find((r) => r.playerId === p2.id);

      const segs1 = getRouteSegments(
        p1.startPosition,
        r1?.keyframes || [],
      );
      const segs2 = getRouteSegments(
        p2.startPosition,
        r2?.keyframes || [],
      );

      for (const s1 of segs1) {
        for (const s2 of segs2) {
          const intersection = segmentsIntersect(s1.start, s1.end, s2.start, s2.end);
          if (intersection) {
            const t1 = getTimeAtPositionOnSegment(
              s1.start,
              s1.end,
              s1.startTime,
              s1.endTime,
              intersection,
            );
            const t2 = getTimeAtPositionOnSegment(
              s2.start,
              s2.end,
              s2.startTime,
              s2.endTime,
              intersection,
            );
            const timeDiff = Math.abs(t1 - t2);
            if (timeDiff < TIME_DIFF_THRESHOLD) {
              let severity: RiskSeverity = 'low';
              if (timeDiff < 0.2) severity = 'high';
              else if (timeDiff < 0.35) severity = 'medium';

              risks.push({
                id: `col-${p1.id}-${p2.id}-${risks.length}`,
                position: intersection,
                time: Math.min(t1, t2),
                playerIds: [p1.id, p2.id],
                severity,
              });
            }
          }
        }
      }
    }
  }

  return risks;
}

const WINDOW_CHECK_INTERVAL = 0.2;
const OPEN_SPACE_RADIUS = 5;
const MIN_WINDOW_DURATION = 0.3;

export function calculateTransferWindows(
  players: Player[],
  routes: Route[],
  disc: Disc,
  duration: number,
): TransferWindow[] {
  const windows: TransferWindow[] = [];
  const offense = players.filter((p) => p.type === 'offense');
  const defense = players.filter((p) => p.type === 'defense');
  const thrower = offense.find((p) => p.id === disc.holderId);

  if (!thrower) return windows;

  const receivers = offense.filter((p) => p.id !== disc.holderId);

  for (const receiver of receivers) {
    const isOpenAtTime = (t: number): boolean => {
      const recvPos = getPlayerPositionAtTime(receiver, routes, t);
      for (const def of defense) {
        const defPos = getPlayerPositionAtTime(def, routes, t);
        if (distance(recvPos, defPos) < OPEN_SPACE_RADIUS) {
          return false;
        }
      }
      return true;
    };

    let inWindow = false;
    let windowStart = 0;

    for (let t = 0; t <= duration; t += WINDOW_CHECK_INTERVAL) {
      const open = isOpenAtTime(t);
      if (open && !inWindow) {
        inWindow = true;
        windowStart = t;
      } else if (!open && inWindow) {
        inWindow = false;
        const windowDuration = t - windowStart;
        if (windowDuration >= MIN_WINDOW_DURATION) {
          const quality = getWindowQuality(windowDuration);
          windows.push({
            id: `win-${thrower.id}-${receiver.id}-${windows.length}`,
            fromId: thrower.id,
            toId: receiver.id,
            startTime: windowStart,
            endTime: t,
            quality,
          });
        }
      }
    }

    if (inWindow) {
      const windowDuration = duration - windowStart;
      if (windowDuration >= MIN_WINDOW_DURATION) {
        const quality = getWindowQuality(windowDuration);
        windows.push({
          id: `win-${thrower.id}-${receiver.id}-${windows.length}`,
          fromId: thrower.id,
          toId: receiver.id,
          startTime: windowStart,
          endTime: duration,
          quality,
        });
      }
    }
  }

  return windows;
}

function getWindowQuality(duration: number): WindowQuality {
  if (duration >= 2) return 'excellent';
  if (duration >= 1) return 'great';
  return 'good';
}

export function calculateGaps(
  players: Player[],
  routes: Route[],
  duration: number,
): GapInfo[] {
  const gaps: GapInfo[] = [];
  const offense = players.filter((p) => p.type === 'offense');
  const defense = players.filter((p) => p.type === 'defense');

  for (const offPlayer of offense) {
    let inGap = false;
    let gapStart = 0;
    let maxDist = 0;

    for (let t = 0; t <= duration; t += WINDOW_CHECK_INTERVAL) {
      const offPos = getPlayerPositionAtTime(offPlayer, routes, t);
      let minDefDist = Infinity;

      for (const defPlayer of defense) {
        const defPos = getPlayerPositionAtTime(defPlayer, routes, t);
        const dist = distance(offPos, defPos);
        if (dist < minDefDist) minDefDist = dist;
      }

      const isGap = minDefDist >= OPEN_SPACE_RADIUS;

      if (isGap && !inGap) {
        inGap = true;
        gapStart = t;
        maxDist = minDefDist;
      } else if (isGap && inGap) {
        if (minDefDist > maxDist) maxDist = minDefDist;
      } else if (!isGap && inGap) {
        inGap = false;
        const gapDuration = t - gapStart;
        if (gapDuration >= MIN_WINDOW_DURATION) {
          gaps.push({
            id: `gap-${offPlayer.id}-${gaps.length}`,
            playerId: offPlayer.id,
            startTime: gapStart,
            endTime: t,
            maxDistance: maxDist,
          });
        }
      }
    }

    if (inGap) {
      const gapDuration = duration - gapStart;
      if (gapDuration >= MIN_WINDOW_DURATION) {
        gaps.push({
          id: `gap-${offPlayer.id}-${gaps.length}`,
          playerId: offPlayer.id,
          startTime: gapStart,
          endTime: duration,
          maxDistance: maxDist,
        });
      }
    }
  }

  return gaps;
}

export function calculateDeviation(
  playerId: string,
  expectedRoute: Route,
  actualPositions: Point[],
  timeStep: number,
): number[] {
  const deviations: number[] = [];
  const startPos = { x: 0, y: 0 };

  for (let i = 0; i < actualPositions.length; i++) {
    const t = i * timeStep;
    const expected = getPlayerPositionAtTime(
      { id: playerId, type: 'offense', label: '', startPosition: expectedRoute.keyframes[0]?.position || startPos },
      [expectedRoute],
      t,
    );
    const actual = actualPositions[i];
    deviations.push(distance(expected, actual));
  }

  return deviations;
}
