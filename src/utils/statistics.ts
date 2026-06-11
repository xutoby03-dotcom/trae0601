import type { Equipment, Person } from '@/types';

export function getTotalWeight(equipment: Equipment[]): number {
  return equipment.reduce((sum, e) => sum + e.weightGrams, 0);
}

export function getTotalVolume(equipment: Equipment[]): number {
  return equipment.reduce((sum, e) => sum + e.volumeLiters, 0);
}

export function getWeightByPerson(
  equipment: Equipment[],
  people: Person[]
): Array<{ person: Person; weight: number; count: number }> {
  return people
    .map((person) => {
      const personEquipment = equipment.filter(
        (e) => e.responsiblePersonId === person.id
      );
      return {
        person,
        weight: getTotalWeight(personEquipment),
        count: personEquipment.length,
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

export function getMostForgotten(
  equipment: Equipment[],
  limit: number = 5
): Array<{ equipment: Equipment; count: number }> {
  return equipment
    .filter((e) => e.forgetCount > 0)
    .sort((a, b) => b.forgetCount - a.forgetCount)
    .slice(0, limit)
    .map((e) => ({ equipment: e, count: e.forgetCount }));
}

export function getEquipmentByBag(
  equipment: Equipment[]
): Record<string, Equipment[]> {
  const result: Record<string, Equipment[]> = {};
  equipment.forEach((e) => {
    if (e.bagName) {
      if (!result[e.bagName]) {
        result[e.bagName] = [];
      }
      result[e.bagName].push(e);
    }
  });
  return result;
}

export function getCompletionRate(equipment: Equipment[]): {
  packed: number;
  total: number;
  rate: number;
} {
  const total = equipment.length;
  const packed = equipment.filter(
    (e) => e.status === 'packed' || e.status === 'in_car'
  ).length;
  return {
    packed,
    total,
    rate: total === 0 ? 0 : Math.round((packed / total) * 100),
  };
}
