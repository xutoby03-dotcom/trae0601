const LOW_PRESSURE_RATIO = 0.2;
const GAS_PRICE_PER_LITER = 8;

export function isLowPressure(pressure: number, ratedPressure: number): boolean {
  return pressure / ratedPressure < LOW_PRESSURE_RATIO;
}

export function calculatePressurePercentage(pressure: number, ratedPressure: number): number {
  return Math.round((pressure / ratedPressure) * 100);
}

export function calculateGasUsed(gasPerUnit: number, quantity: number): number {
  return Number((gasPerUnit * quantity).toFixed(1));
}

export function calculateGasCost(gasUsed: number): number {
  return Number((gasUsed * GAS_PRICE_PER_LITER).toFixed(2));
}

export function calculateProfit(totalAmount: number, gasUsed: number): number {
  const gasCost = calculateGasCost(gasUsed);
  return Number((totalAmount - gasCost).toFixed(2));
}

export function calculateRemainingPressure(
  currentPressure: number,
  ratedPressure: number,
  capacity: number,
  gasUsed: number
): number {
  const pressureDrop = (gasUsed / capacity) * ratedPressure;
  return Number(Math.max(0, currentPressure - pressureDrop).toFixed(1));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
