import type { Equipment, RentalRecord, PersonCost } from '../types';

export function calculateRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 1 : diffDays + 1;
}

export function calculateTotalRent(equipment: Equipment, startDate: string, endDate: string): number {
  const days = calculateRentalDays(startDate, endDate);
  return equipment.dailyPrice * days;
}

export function calculatePersonShare(totalRent: number, costShare: number): number {
  return Math.round(totalRent * (costShare / 100) * 100) / 100;
}

export function calculatePersonCosts(
  equipments: Equipment[],
  rentalRecords: RentalRecord[]
): PersonCost[] {
  const personMap = new Map<string, PersonCost>();

  rentalRecords.forEach((record) => {
    const equipment = equipments.find((e) => e.id === record.equipmentId);
    if (!equipment) return;

    const totalRent = calculateTotalRent(equipment, record.startDate, record.endDate);
    const personRent = calculatePersonShare(totalRent, record.costShare);
    const depositShare = calculatePersonShare(equipment.deposit, record.costShare);
    const depositDeducted = record.depositDeducted
      ? record.depositDeductionAmount ?? depositShare
      : 0;

    const existing = personMap.get(record.userName);
    if (existing) {
      existing.totalRent += personRent;
      existing.totalDeposit += depositShare;
      existing.depositDeducted += depositDeducted;
      existing.netPayable = existing.totalRent + existing.depositDeducted;
      existing.equipmentNames.push(equipment.name);
    } else {
      personMap.set(record.userName, {
        personName: record.userName,
        totalRent: personRent,
        totalDeposit: depositShare,
        depositDeducted,
        netPayable: personRent + depositDeducted,
        equipmentNames: [equipment.name],
      });
    }
  });

  return Array.from(personMap.values()).sort((a, b) => b.netPayable - a.netPayable);
}

export function getUnreturnedEquipments(
  equipments: Equipment[],
  rentalRecords: RentalRecord[]
): Array<{ equipment: Equipment; record: RentalRecord }> {
  return rentalRecords
    .filter((r) => !r.isReturned)
    .map((record) => {
      const equipment = equipments.find((e) => e.id === record.equipmentId);
      return equipment ? { equipment, record } : null;
    })
    .filter((item): item is { equipment: Equipment; record: RentalRecord } => item !== null);
}

export function getDepositDeductedRecords(
  equipments: Equipment[],
  rentalRecords: RentalRecord[]
): Array<{ equipment: Equipment; record: RentalRecord; amount: number }> {
  return rentalRecords
    .filter((r) => r.depositDeducted)
    .map((record) => {
      const equipment = equipments.find((e) => e.id === record.equipmentId);
      if (!equipment) return null;
      const amount = record.depositDeductionAmount ?? calculatePersonShare(equipment.deposit, record.costShare);
      return { equipment, record, amount };
    })
    .filter((item): item is { equipment: Equipment; record: RentalRecord; amount: number } => item !== null);
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}
