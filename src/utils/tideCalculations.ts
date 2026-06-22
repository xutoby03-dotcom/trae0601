import { SamplingSite, TideWindow, UrgencyLevel } from '@/types';

const TIDE_WINDOW_BEFORE_LOW = 90;
const TIDE_WINDOW_AFTER_LOW = 90;
const SAMPLING_BUFFER = 30;

export function calculateTideWindow(site: SamplingSite): TideWindow {
  const lowTide = new Date(site.lowTideTime);
  const tideStart = new Date(lowTide.getTime() - TIDE_WINDOW_BEFORE_LOW * 60 * 1000);
  const tideEnd = new Date(lowTide.getTime() + TIDE_WINDOW_AFTER_LOW * 60 * 1000);
  
  const latestDeparture = new Date(tideStart.getTime() + SAMPLING_BUFFER * 60 * 1000 - site.travelTimeMinutes * 60 * 1000);
  const mustEvacuate = new Date(tideEnd.getTime() - SAMPLING_BUFFER * 60 * 1000 - site.travelTimeMinutes * 60 * 1000);
  
  const workDuration = Math.max(0, Math.floor((tideEnd.getTime() - tideStart.getTime()) / (60 * 1000) - site.travelTimeMinutes * 2));

  return {
    siteId: site.id,
    lowTide,
    tideStart,
    tideEnd,
    latestDeparture,
    mustEvacuate,
    workDuration,
  };
}

export function getUrgencyLevel(tideWindow: TideWindow): UrgencyLevel {
  const now = new Date();
  const timeUntilStart = tideWindow.tideStart.getTime() - now.getTime();
  const timeUntilEnd = tideWindow.tideEnd.getTime() - now.getTime();

  if (timeUntilEnd <= 0) {
    return 'expired';
  }
  if (timeUntilStart <= 0) {
    return 'critical';
  }
  if (timeUntilStart <= 30 * 60 * 1000) {
    return 'warning';
  }
  return 'safe';
}

export function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  
  if (diffMins < 0) {
    return '已过';
  }
  if (diffMins < 60) {
    return `${diffMins} 分钟`;
  }
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours} 小时 ${mins} 分`;
}
