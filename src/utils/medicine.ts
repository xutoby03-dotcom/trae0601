import type { Medicine, MedicineCategory, MedicineStatus, Trip, FamilyMember, TripItem } from '@/types';

export function isExpired(medicine: Medicine): boolean {
  return new Date(medicine.expiryDate) < new Date(new Date().toDateString());
}

export function isExpiringSoon(medicine: Medicine, days: number = 30): boolean {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  const expiry = new Date(medicine.expiryDate);
  const today = new Date(new Date().toDateString());
  return expiry >= today && expiry <= threshold;
}

export function getMedicineStatus(medicine: Medicine): MedicineStatus {
  if (isExpired(medicine)) return 'expired';
  if (isExpiringSoon(medicine)) return 'expiring';
  return 'normal';
}

export function getStatusColor(status: MedicineStatus): {
  dot: string;
  badge: string;
  text: string;
  label: string;
} {
  switch (status) {
    case 'expired':
      return {
        dot: 'bg-red-500',
        badge: 'badge bg-red-50 text-red-600 border border-red-100',
        text: 'text-red-600',
        label: '已过期',
      };
    case 'expiring':
      return {
        dot: 'bg-amber-500',
        badge: 'badge bg-amber-50 text-amber-700 border border-amber-100',
        text: 'text-amber-600',
        label: '临期提醒',
      };
    default:
      return {
        dot: 'bg-emerald-500',
        badge: 'badge bg-emerald-50 text-emerald-700 border border-emerald-100',
        text: 'text-emerald-600',
        label: '正常',
      };
  }
}

export interface SuggestedItem {
  medicineId: string;
  suggestedQuantity: number;
  reason: string;
}

export function generateSuggestedTripItems(
  trip: Trip,
  companions: FamilyMember[],
  allMedicines: Medicine[]
): SuggestedItem[] {
  const suggestions: SuggestedItem[] = [];
  const addedIds = new Set<string>();

  const basicCategories: MedicineCategory[] = ['cold', 'gastro', 'trauma', 'allergy'];
  const perDayMultiplier = Math.max(1, Math.ceil(trip.days / 3));

  basicCategories.forEach((cat) => {
    const meds = allMedicines.filter(
      (m) => m.category === cat && m.applicableTo === 'all' && !isExpired(m) && m.stockQuantity > 0
    );
    if (meds.length > 0) {
      const selected = meds.reduce((a, b) => (a.stockQuantity > b.stockQuantity ? a : b));
      if (!addedIds.has(selected.id)) {
        addedIds.add(selected.id);
        suggestions.push({
          medicineId: selected.id,
          suggestedQuantity: perDayMultiplier,
          reason: '旅行常备药',
        });
      }
    }
  });

  if (trip.days > 1) {
    const motionMeds = allMedicines.filter(
      (m) => m.category === 'motion' && !isExpired(m) && m.stockQuantity > 0
    );
    if (motionMeds.length > 0) {
      const selected = motionMeds[0];
      if (!addedIds.has(selected.id)) {
        addedIds.add(selected.id);
        suggestions.push({
          medicineId: selected.id,
          suggestedQuantity: Math.max(2, companions.length),
          reason: '长途旅行晕车药',
        });
      }
    }
  }

  companions.forEach((member) => {
    member.dedicatedMedicineIds.forEach((medId) => {
      const med = allMedicines.find((m) => m.id === medId);
      if (med && !isExpired(med) && med.stockQuantity > 0 && !addedIds.has(med.id)) {
        addedIds.add(med.id);
        suggestions.push({
          medicineId: medId,
          suggestedQuantity: Math.max(trip.days, 1),
          reason: `${member.name}专用药`,
        });
      }
    });

    const chronicMeds = allMedicines.filter(
      (m) =>
        m.category === 'chronic' &&
        (m.applicableTo === member.id || m.applicableTo === 'all') &&
        !isExpired(m) &&
        m.stockQuantity > 0
    );
    chronicMeds.forEach((med) => {
      if (!addedIds.has(med.id)) {
        addedIds.add(med.id);
        suggestions.push({
          medicineId: med.id,
          suggestedQuantity: trip.days + 2,
          reason: `${member.name}慢性病药(含备用)`,
        });
      }
    });

    if (member.allergies.trim()) {
      suggestions.forEach((s) => {
        const med = allMedicines.find((m) => m.id === s.medicineId);
        if (med?.category === 'allergy') {
          s.suggestedQuantity = Math.ceil(s.suggestedQuantity * 1.5);
        }
      });
    }
  });

  if (companions.some((m) => m.age > 60)) {
    suggestions.forEach((s) => {
      s.suggestedQuantity = Math.ceil(s.suggestedQuantity * 1.2);
    });
  }

  return suggestions;
}

export function calculateRestock(medicine: Medicine, tripItems: TripItem[]): number {
  const relevantItems = tripItems.filter((ti) => ti.medicineId === medicine.id);
  const totalPacked = relevantItems.reduce((sum, ti) => sum + ti.packedQuantity, 0);
  const minStock = 5;
  const current = medicine.stockQuantity;
  const projectedShortfall = Math.max(0, minStock - (current - totalPacked));
  const consumed = relevantItems.reduce((sum, ti) => sum + ti.consumedQuantity, 0);
  return Math.max(consumed, projectedShortfall);
}

export function getLowStockMedicines(medicines: Medicine[], threshold: number = 3): Medicine[] {
  return medicines.filter((m) => m.stockQuantity <= threshold && !isExpired(m));
}
