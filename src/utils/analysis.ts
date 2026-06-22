import type { TrainingSession, ConfusionPair, CourseElement } from '@/types';

export const analyzeConfusionPairs = (
  sessions: TrainingSession[],
  courseElements: CourseElement[]
): ConfusionPair[] => {
  const confusionMap = new Map<string, ConfusionPair>();
  const jumpElements = courseElements.filter((e) => e.type === 'jump');

  sessions.forEach((session) => {
    const { userSequence, errors } = session;
    const correctSequence = jumpElements
      .sort((a, b) => a.order - b.order)
      .map((e) => e.order);

    for (let i = 0; i < userSequence.length - 1; i++) {
      const current = userSequence[i];
      const next = userSequence[i + 1];
      const correctNext = correctSequence[correctSequence.indexOf(current) + 1];

      if (correctNext && next !== correctNext) {
        const key = [Math.min(current, next), Math.max(current, next)].join('-');
        const existing = confusionMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          confusionMap.set(key, {
            elementA: Math.min(current, next),
            elementB: Math.max(current, next),
            count: 1,
            type: 'order',
          });
        }
      }
    }

    errors.forEach((error) => {
      if (error.type === 'reverse') {
        const order = error.elementOrder;
        const prevOrder = order - 1;
        if (prevOrder > 0) {
          const key = [Math.min(order, prevOrder), Math.max(order, prevOrder)].join('-');
          const existing = confusionMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            confusionMap.set(key, {
              elementA: Math.min(order, prevOrder),
              elementB: Math.max(order, prevOrder),
              count: 1,
              type: 'direction',
            });
          }
        }
      }
    });
  });

  return Array.from(confusionMap.values()).sort((a, b) => b.count - a.count);
};

export const getErrorTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    miss: '漏跳',
    reverse: '反向',
    detour: '绕行',
    pause: '停顿',
  };
  return labels[type] || type;
};

export const getErrorTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    miss: 'text-red-600',
    reverse: 'text-orange-600',
    detour: 'text-yellow-600',
    pause: 'text-blue-600',
  };
  return colors[type] || 'text-gray-600';
};
