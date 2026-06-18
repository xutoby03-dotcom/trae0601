import type { CoffeeFlavor, ConsumptionLog, InventoryBatch, SupplyItem, SupplyLog, StatisticsData } from '../types';
import { getDaysFromNow, getWeekKey, isExpired, isExpiringSoon } from './date';

export const calculateFlavorTotalStock = (
  flavorId: string,
  batches: InventoryBatch[]
): number => {
  return batches
    .filter(b => b.flavorId === flavorId && b.status !== 'expired' && b.status !== 'damp')
    .reduce((sum, b) => sum + b.quantity, 0);
};

export const getFlavorStockStatus = (
  totalStock: number,
  safetyStock: number,
  batches: InventoryBatch[]
): 'normal' | 'low' | 'expired' | 'damp' | 'out_of_stock' => {
  if (totalStock === 0) {
    const hasDamp = batches.some(b => b.status === 'damp');
    const hasExpired = batches.some(b => b.status === 'expired');
    if (hasDamp) return 'damp';
    if (hasExpired) return 'expired';
    return 'out_of_stock';
  }
  if (totalStock <= safetyStock) return 'low';
  const hasDamp = batches.some(b => b.status === 'damp');
  const hasExpired = batches.some(b => b.status === 'expired');
  if (hasDamp) return 'damp';
  if (hasExpired) return 'expired';
  return 'normal';
};

export const getNearestExpiry = (
  flavorId: string,
  batches: InventoryBatch[]
): string | undefined => {
  const flavorBatches = batches
    .filter(b => b.flavorId === flavorId && b.quantity > 0 && b.status === 'normal')
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  return flavorBatches[0]?.expiryDate;
};

export const calculateWeeklyConsumption = (
  flavorId: string,
  logs: ConsumptionLog[],
  weeks: number = 4
): number => {
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  
  const relevantLogs = logs.filter(
    log => log.flavorId === flavorId && new Date(log.consumedAt) >= fourWeeksAgo
  );
  
  const total = relevantLogs.reduce((sum, log) => sum + log.quantity, 0);
  return Math.round(total / weeks);
};

export const calculateSuggestedOrder = (
  currentStock: number,
  safetyStock: number,
  avgWeeklyConsumption: number
): number => {
  const safetyBased = safetyStock * 2 - currentStock;
  const consumptionBased = avgWeeklyConsumption * 2;
  return Math.max(Math.max(safetyBased, consumptionBased), 0);
};

export const calculateStatistics = (
  flavors: CoffeeFlavor[],
  batches: InventoryBatch[],
  logs: ConsumptionLog[],
  supplies: SupplyItem[],
  supplyLogs: SupplyLog[],
  days: number = 30
): StatisticsData => {
  const flavorMap = new Map(flavors.map(f => [f.id, f]));

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const filteredLogs = logs.filter(l => new Date(l.consumedAt) >= startDate);

  const popularFlavors = flavors.map(flavor => {
    const total = filteredLogs
      .filter(l => l.flavorId === flavor.id)
      .reduce((sum, l) => sum + l.quantity, 0);
    return { flavorId: flavor.id, name: flavor.name, total };
  }).sort((a, b) => b.total - a.total).slice(0, 10);

  const deptMap = new Map<string, { total: number; cost: number }>();
  filteredLogs.forEach(log => {
    const flavor = flavorMap.get(log.flavorId);
    if (!flavor) return;
    const existing = deptMap.get(log.department) || { total: 0, cost: 0 };
    deptMap.set(log.department, {
      total: existing.total + log.quantity,
      cost: existing.cost + log.quantity * flavor.unitPrice,
    });
  });
  const departmentConsumption = Array.from(deptMap.entries())
    .map(([department, data]) => ({ department, ...data }))
    .sort((a, b) => b.total - a.total);

  const weekMap = new Map<string, number>();
  filteredLogs.forEach(log => {
    const week = getWeekKey(log.consumedAt);
    const flavor = flavorMap.get(log.flavorId);
    if (!flavor) return;
    const existing = weekMap.get(week) || 0;
    weekMap.set(week, existing + log.quantity * flavor.unitPrice);
  });
  const weeklyCost = Array.from(weekMap.entries())
    .map(([week, cost]) => ({ week, cost }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  const expiringItems: StatisticsData['expiringItems'] = [];
  batches.forEach(batch => {
    if (batch.status !== 'normal' || batch.quantity === 0) return;
    const flavor = flavorMap.get(batch.flavorId);
    if (!flavor) return;
    const daysLeft = getDaysFromNow(batch.expiryDate);
    if (daysLeft >= 0 && daysLeft <= 30) {
      expiringItems.push({
        id: batch.id,
        name: flavor.name,
        daysLeft,
        quantity: batch.quantity,
        itemType: 'coffee',
      });
    }
  });
  supplies.forEach(supply => {
    if (supply.expiryDate && supply.quantity > 0) {
      const daysLeft = getDaysFromNow(supply.expiryDate);
      if (daysLeft >= 0 && daysLeft <= 30) {
        expiringItems.push({
          id: supply.id,
          name: supply.name,
          daysLeft,
          quantity: supply.quantity,
          itemType: 'supply',
        });
      }
    }
  });
  expiringItems.sort((a, b) => a.daysLeft - b.daysLeft);

  const purchaseSuggestions: StatisticsData['purchaseSuggestions'] = [];
  flavors.forEach(flavor => {
    const currentStock = calculateFlavorTotalStock(flavor.id, batches);
    const avgWeeklyConsumption = calculateWeeklyConsumption(flavor.id, logs);
    const suggestedOrder = calculateSuggestedOrder(currentStock, flavor.safetyStock, avgWeeklyConsumption);
    if (currentStock <= flavor.safetyStock || suggestedOrder > 0) {
      purchaseSuggestions.push({
        id: flavor.id,
        name: flavor.name,
        currentStock,
        avgWeeklyConsumption,
        suggestedOrder,
        itemType: 'coffee',
      });
    }
  });
  supplies.forEach(supply => {
    const supplyConsumption = supplyLogs
      .filter(l => l.supplyId === supply.id && l.type === 'consume')
      .reduce((sum, l) => sum + l.quantity, 0);
    const avgWeekly = Math.round(supplyConsumption / 4);
    const suggestedOrder = calculateSuggestedOrder(supply.quantity, supply.safetyStock, avgWeekly);
    if (supply.quantity <= supply.safetyStock || suggestedOrder > 0) {
      purchaseSuggestions.push({
        id: supply.id,
        name: supply.name,
        currentStock: supply.quantity,
        avgWeeklyConsumption: avgWeekly,
        suggestedOrder,
        itemType: 'supply',
      });
    }
  });
  purchaseSuggestions.sort((a, b) => b.suggestedOrder - a.suggestedOrder);

  const totalConsumption = filteredLogs.reduce((sum, l) => sum + l.quantity, 0);
  const totalCost = filteredLogs.reduce((sum, l) => {
    const flavor = flavorMap.get(l.flavorId);
    return sum + (flavor ? l.quantity * flavor.unitPrice : 0);
  }, 0);
  const activeFlavorCount = popularFlavors.filter(f => f.total > 0).length;
  const activeDepartmentCount = departmentConsumption.filter(d => d.total > 0).length;

  return {
    popularFlavors,
    departmentConsumption,
    weeklyCost,
    expiringItems,
    purchaseSuggestions,
    totalConsumption,
    totalCost,
    activeFlavorCount,
    activeDepartmentCount,
  };
};

export const getExpiredBatches = (batches: InventoryBatch[]): InventoryBatch[] => {
  return batches.filter(b => isExpired(b.expiryDate) && b.quantity > 0 && b.status === 'normal');
};

export const getExpiringBatches = (batches: InventoryBatch[]): InventoryBatch[] => {
  return batches.filter(b => isExpiringSoon(b.expiryDate) && b.quantity > 0 && b.status === 'normal');
};
