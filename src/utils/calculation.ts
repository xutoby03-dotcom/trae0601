import type { Trip, SettlementSummary, SettlementItem, ExpenseType } from '@/types';

export function calculateSettlement(trip: Trip): SettlementSummary {
  const { passengers, expenses, settings } = trip;
  
  let totalCost = 0;
  let splitTotal = 0;
  
  const expenseByType: { type: ExpenseType; total: number }[] = [
    { type: 'fuel', total: 0 },
    { type: 'toll', total: 0 },
    { type: 'parking', total: 0 },
    { type: 'carwash', total: 0 },
    { type: 'supplies', total: 0 },
  ];

  expenses.forEach(expense => {
    totalCost += expense.amount;
    
    const typeItem = expenseByType.find(e => e.type === expense.type);
    if (typeItem) {
      typeItem.total += expense.amount;
    }
    
    if (expense.isSplit) {
      splitTotal += expense.amount;
    }
  });

  let driverSubsidy = 0;
  if (settings.hasDriverSubsidy) {
    if (settings.driverSubsidyType === 'fixed') {
      driverSubsidy = settings.driverSubsidyAmount;
    } else {
      const fuelTotal = expenseByType.find(e => e.type === 'fuel')?.total || 0;
      driverSubsidy = fuelTotal * (settings.driverSubsidyAmount / 100);
    }
    totalCost += driverSubsidy;
    splitTotal += driverSubsidy;
  }

  const driverPassenger = passengers.find(p => p.name === trip.driverName);
  const driverId = driverPassenger?.id || '';

  let totalShares = 0;
  passengers.forEach(passenger => {
    let ratio = 1;
    
    if (passenger.isChild && settings.childFree) {
      ratio = 0;
    }
    
    if (passenger.isHalfWay) {
      ratio *= settings.halfWayRatio;
    }
    
    totalShares += ratio;
    passenger.shareRatio = ratio;
  });

  const perShareCost = totalShares > 0 ? splitTotal / totalShares : 0;

  const items: SettlementItem[] = passengers.map(passenger => {
    const shouldPay = perShareCost * passenger.shareRatio;
    
    const alreadyPaid = expenses
      .filter(e => e.payerId === passenger.id)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const balance = shouldPay - alreadyPaid;
    
    return {
      passengerId: passenger.id,
      passengerName: passenger.name,
      shouldPay: Math.round(shouldPay * 100) / 100,
      alreadyPaid: Math.round(alreadyPaid * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    };
  });

  const sortedForMaxPayer = [...items].sort((a, b) => b.alreadyPaid - a.alreadyPaid);
  const maxPayer = sortedForMaxPayer[0] 
    ? { name: sortedForMaxPayer[0].passengerName, amount: sortedForMaxPayer[0].alreadyPaid }
    : { name: '-', amount: 0 };

  const averageCost = passengers.length > 0 ? totalCost / passengers.length : 0;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    averageCost: Math.round(averageCost * 100) / 100,
    maxPayer,
    items,
    expenseByType: expenseByType.filter(e => e.total > 0),
  };
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
