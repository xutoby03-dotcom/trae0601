import type { Bathroom, RiskLevel, StatusLevel, MoldStatus, Inspection } from '../types';
import { getDaysSince } from './dateUtils';

export const calculateRiskLevel = (bathroom: Bathroom): RiskLevel => {
  const usageDays = getDaysSince(bathroom.purchaseDate);
  const lifespanRatio = usageDays / bathroom.recommendedLifespanDays;

  let dangerPoints = 0;
  let warningPoints = 0;

  if (bathroom.moldStatus === 'severe') {
    dangerPoints += 2;
  } else if (bathroom.moldStatus === 'mild') {
    warningPoints += 1;
  }

  if (bathroom.suctionStatus === 'poor') {
    dangerPoints += 2;
  } else if (bathroom.suctionStatus === 'normal') {
    warningPoints += 1;
  }

  if (bathroom.cornerStatus === 'poor') {
    dangerPoints += 1;
  } else if (bathroom.cornerStatus === 'normal') {
    warningPoints += 1;
  }

  if (lifespanRatio > 1) {
    dangerPoints += 1;
  } else if (lifespanRatio > 0.8) {
    warningPoints += 1;
  }

  if (dangerPoints >= 2) {
    return 'danger';
  }
  if (dangerPoints >= 1 || warningPoints >= 2) {
    return 'warning';
  }
  return 'safe';
};

export const needsReplacement = (bathroom: Bathroom, inspection: Inspection): boolean => {
  if (bathroom.moldStatus === 'severe') return true;
  if (bathroom.suctionStatus === 'poor') return true;
  if (!inspection.adsorptionOk) return true;

  const usageDays = getDaysSince(bathroom.purchaseDate);
  if (usageDays > bathroom.recommendedLifespanDays) return true;

  return false;
};

export const getStatusFromInspection = (ok: boolean): StatusLevel => {
  return ok ? 'good' : 'poor';
};

export const getMoldStatusFromNotes = (notes: string): MoldStatus => {
  const lowerNotes = notes.toLowerCase();
  if (lowerNotes.includes('霉') || lowerNotes.includes('mold') || lowerNotes.includes('mould')) {
    if (lowerNotes.includes('严重') || lowerNotes.includes('severe') || lowerNotes.includes('很多')) {
      return 'severe';
    }
    return 'mild';
  }
  return 'none';
};

export const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'safe':
      return 'bg-emerald-500';
    case 'warning':
      return 'bg-amber-500';
    case 'danger':
      return 'bg-red-500';
  }
};

export const getRiskBgColor = (level: RiskLevel): string => {
  switch (level) {
    case 'safe':
      return 'bg-emerald-50 border-emerald-200';
    case 'warning':
      return 'bg-amber-50 border-amber-200';
    case 'danger':
      return 'bg-red-50 border-red-200';
  }
};

export const getRiskTextColor = (level: RiskLevel): string => {
  switch (level) {
    case 'safe':
      return 'text-emerald-700';
    case 'warning':
      return 'text-amber-700';
    case 'danger':
      return 'text-red-700';
  }
};

export const getRiskLabel = (level: RiskLevel): string => {
  switch (level) {
    case 'safe':
      return '安全';
    case 'warning':
      return '注意';
    case 'danger':
      return '高风险';
  }
};

export const getStatusLabel = (status: StatusLevel): string => {
  switch (status) {
    case 'good':
      return '良好';
    case 'normal':
      return '一般';
    case 'poor':
      return '较差';
  }
};

export const getMoldLabel = (status: MoldStatus): string => {
  switch (status) {
    case 'none':
      return '无霉斑';
    case 'mild':
      return '轻微霉斑';
    case 'severe':
      return '严重霉斑';
  }
};
