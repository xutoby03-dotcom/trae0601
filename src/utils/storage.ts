import type { Sample, Feedback } from '../types';
import { defaultSamples } from '../data/samples';
import { defaultFeedbacks } from '../data/feedbacks';

export const STORAGE_KEYS = {
  SAMPLES: 'fitting_samples',
  FEEDBACKS: 'fitting_feedbacks',
} as const;

export function getSamples(): Sample[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SAMPLES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse samples from localStorage:', e);
  }
  return [...defaultSamples];
}

export function saveSamples(samples: Sample[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAMPLES, JSON.stringify(samples));
  } catch (e) {
    console.error('Failed to save samples to localStorage:', e);
  }
}

export function getFeedbacks(): Feedback[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse feedbacks from localStorage:', e);
  }
  return [...defaultFeedbacks];
}

export function saveFeedbacks(feedbacks: Feedback[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
  } catch (e) {
    console.error('Failed to save feedbacks to localStorage:', e);
  }
}
