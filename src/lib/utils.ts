import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtMoney(n: number): string {
  return (n || 0).toFixed(2).replace(/\.?0+$/, '')
}
