import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseAgeRange(ageRange: string): { min: number; max: number } {
  if (ageRange === '8岁以上') {
    return { min: 8, max: 99 };
  }
  const match = ageRange.match(/(\d+)-(\d+)岁/);
  if (match) {
    return { min: parseInt(match[1]), max: parseInt(match[2]) };
  }
  return { min: 0, max: 99 };
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatAge(ageInMonths: number): string {
  if (ageInMonths < 12) {
    return `${ageInMonths}个月`;
  }
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  if (months === 0) {
    return `${years}岁`;
  }
  return `${years}岁${months}个月`;
}

export function calculateAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  );
}

export function isToyAgeAppropriate(toyAgeRange: string, childBirthDate: string): boolean {
  const { min } = parseAgeRange(toyAgeRange);
  const childAge = calculateAgeInMonths(childBirthDate);
  const minMonths = min * 12;
  return childAge >= minMonths;
}

export function hasSmallPartsRisk(toyAgeRange: string, childBirthDate: string): boolean {
  const { min } = parseAgeRange(toyAgeRange);
  const childAge = calculateAgeInMonths(childBirthDate);
  const minMonths = min * 12;
  return childAge < minMonths;
}
