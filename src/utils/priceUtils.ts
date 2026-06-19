import { Batch, PriceType, BatchPriceInfo } from '@/types';
import { getDaysUntilExpiry, isExpired } from './dateUtils';

const DISCOUNT_RATE = 0.7;
const CLEARANCE_RATE = 0.4;

export const getPriceType = (expiryDate: string): PriceType => {
  if (isExpired(expiryDate)) {
    return 'clearance';
  }
  const daysLeft = getDaysUntilExpiry(expiryDate);
  if (daysLeft <= 1) {
    return 'clearance';
  }
  if (daysLeft <= 3) {
    return 'discount';
  }
  return 'normal';
};

export const getBatchPrice = (basePrice: number, expiryDate: string): number => {
  const priceType = getPriceType(expiryDate);
  switch (priceType) {
    case 'discount':
      return Math.round(basePrice * DISCOUNT_RATE * 100) / 100;
    case 'clearance':
      return Math.round(basePrice * CLEARANCE_RATE * 100) / 100;
    default:
      return basePrice;
  }
};

export const getPriceTypeLabel = (priceType: PriceType): string => {
  switch (priceType) {
    case 'normal':
      return '原价';
    case 'discount':
      return '7折';
    case 'clearance':
      return '4折清仓';
    default:
      return '原价';
  }
};

export const getBatchStatusColor = (status: string): string => {
  switch (status) {
    case 'normal':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'near_expiry':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'clearance':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'expired':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    case 'sold_out':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getBatchStatusLabel = (status: string): string => {
  switch (status) {
    case 'normal':
      return '正常';
    case 'near_expiry':
      return '临期折扣';
    case 'clearance':
      return '清仓甩卖';
    case 'expired':
      return '已过期';
    case 'sold_out':
      return '已售罄';
    default:
      return '未知';
  }
};

export const getBatchPriceInfo = (
  batches: Batch[],
  basePrice: number
): BatchPriceInfo[] => {
  const availableBatches = batches
    .filter(b => b.remainingQuantity > 0 && !isExpired(b.expiryDate))
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  return availableBatches.map(batch => ({
    batchId: batch.id,
    price: getBatchPrice(basePrice, batch.expiryDate),
    priceType: getPriceType(batch.expiryDate),
    availableQuantity: batch.remainingQuantity,
  }));
};

export const calculateSaleItems = (
  batches: Batch[],
  basePrice: number,
  quantity: number
): { batchId: string; quantity: number; unitPrice: number; priceType: PriceType }[] => {
  const priceInfoList = getBatchPriceInfo(batches, basePrice);
  const result: { batchId: string; quantity: number; unitPrice: number; priceType: PriceType }[] = [];
  let remainingQty = quantity;

  for (const info of priceInfoList) {
    if (remainingQty <= 0) break;
    const takeQty = Math.min(remainingQty, info.availableQuantity);
    result.push({
      batchId: info.batchId,
      quantity: takeQty,
      unitPrice: info.price,
      priceType: info.priceType,
    });
    remainingQty -= takeQty;
  }

  return result;
};
