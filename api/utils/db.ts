import type { Size, Product } from "../../shared/types.js";

export function parseProductRow(row: any): Product {
  return {
    ...row,
    sizeChart: JSON.parse(row.sizeChart),
    stock: JSON.parse(row.stock),
  };
}

export function serializeProductForDb(product: Partial<Product>) {
  const result: any = { ...product };
  if (product.sizeChart) result.sizeChart = JSON.stringify(product.sizeChart);
  if (product.stock) result.stock = JSON.stringify(product.stock);
  return result;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
