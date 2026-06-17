import type {
  Umbrella,
  UmbrellaFilters,
  CreateUmbrellaData,
  DashboardStats,
  BuildingStat,
  SimilarUmbrellaGroup,
  ScrapRecord,
} from '@/types';
import { storage } from './storage';
import { isToday, isExpiringSoon, isExpired } from '@/utils/dateUtils';
import { STORAGE_PERIOD_DAYS, EXPIRING_WARNING_DAYS } from '@/utils/constants';

const generateId = (): string => `umb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const umbrellaService = {
  getAll: (filters?: UmbrellaFilters): Umbrella[] => {
    let umbrellas = storage.umbrellas.getAll();

    if (filters) {
      if (filters.color) {
        umbrellas = umbrellas.filter(u => u.color === filters.color);
      }
      if (filters.building) {
        umbrellas = umbrellas.filter(u => u.foundLocation.building === filters.building);
      }
      if (filters.feature) {
        umbrellas = umbrellas.filter(u =>
          u.features.some(f => f.includes(filters.feature!)) ||
          u.description.includes(filters.feature!)
        );
      }
      if (filters.dateFrom) {
        umbrellas = umbrellas.filter(u => new Date(u.foundTime) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        umbrellas = umbrellas.filter(u => new Date(u.foundTime) <= new Date(filters.dateTo!));
      }
      if (filters.status) {
        umbrellas = umbrellas.filter(u => u.status === filters.status);
      }
    }

    return umbrellas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (id: string): Umbrella | null => {
    return storage.umbrellas.getAll().find(u => u.id === id) || null;
  },

  create: (data: CreateUmbrellaData): Umbrella => {
    const now = new Date().toISOString();
    const newUmbrella: Umbrella = {
      id: generateId(),
      ...data,
      status: 'pending',
      storagePeriodDays: STORAGE_PERIOD_DAYS,
      createdAt: now,
      updatedAt: now,
    };

    const umbrellas = storage.umbrellas.getAll();
    umbrellas.unshift(newUmbrella);
    storage.umbrellas.setAll(umbrellas);

    return newUmbrella;
  },

  updateStatus: (id: string, status: Umbrella['status']): Umbrella | null => {
    const umbrellas = storage.umbrellas.getAll();
    const index = umbrellas.findIndex(u => u.id === id);

    if (index === -1) return null;

    umbrellas[index] = {
      ...umbrellas[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    storage.umbrellas.setAll(umbrellas);
    return umbrellas[index];
  },

  getDashboardStats: (): DashboardStats => {
    const umbrellas = storage.umbrellas.getAll();
    const claims = storage.claims.getAll();

    return {
      totalPending: umbrellas.filter(u => u.status === 'pending').length,
      todayNew: umbrellas.filter(u => isToday(u.createdAt)).length,
      sharedCount: umbrellas.filter(u => u.status === 'shared').length,
      scrappedCount: umbrellas.filter(u => u.status === 'scrapped').length,
      pendingClaims: claims.filter(c => c.status === 'pending').length,
    };
  },

  getExpiringUmbrellas: (days: number = EXPIRING_WARNING_DAYS): Umbrella[] => {
    return storage.umbrellas.getAll()
      .filter(u => u.status === 'pending' && isExpiringSoon(u.foundTime, u.storagePeriodDays))
      .sort((a, b) => {
        const expiryA = new Date(a.foundTime).getTime() + a.storagePeriodDays * 24 * 60 * 60 * 1000;
        const expiryB = new Date(b.foundTime).getTime() + b.storagePeriodDays * 24 * 60 * 60 * 1000;
        return expiryA - expiryB;
      })
      .slice(0, 10);
  },

  getExpiredUmbrellas: (): Umbrella[] => {
    return storage.umbrellas.getAll()
      .filter(u => u.status === 'pending' && isExpired(u.foundTime, u.storagePeriodDays));
  },

  getBuildingStats: (): BuildingStat[] => {
    const umbrellas = storage.umbrellas.getAll();
    const stats: Record<string, number> = {};

    umbrellas.forEach(u => {
      stats[u.foundLocation.building] = (stats[u.foundLocation.building] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([building, count]) => ({ building, count }))
      .sort((a, b) => b.count - a.count);
  },

  getSimilarUmbrellas: (): SimilarUmbrellaGroup[] => {
    const pendingUmbrellas = storage.umbrellas.getAll().filter(u => u.status === 'pending');
    const groups: SimilarUmbrellaGroup[] = [];
    const used = new Set<string>();

    pendingUmbrellas.forEach(umbrella => {
      if (used.has(umbrella.id)) return;

      const similar: Umbrella[] = [umbrella];
      used.add(umbrella.id);

      pendingUmbrellas.forEach(other => {
        if (used.has(other.id) || other.id === umbrella.id) return;

        let score = 0;
        if (umbrella.color === other.color) score += 30;
        if (umbrella.brand === other.brand) score += 20;
        if (umbrella.foundLocation.building === other.foundLocation.building) score += 25;
        const commonFeatures = umbrella.features.filter(f => other.features.includes(f));
        score += commonFeatures.length * 10;

        if (score >= 70) {
          similar.push(other);
          used.add(other.id);
        }
      });

      if (similar.length >= 2) {
        groups.push({
          groupId: `group-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          umbrellas: similar,
          similarity: Math.min(95, 60 + similar.length * 10),
        });
      }
    });

    return groups.slice(0, 5);
  },

  getShared: (): Umbrella[] => {
    return storage.umbrellas.getAll().filter(u => u.status === 'shared');
  },

  getScrapped: (): Umbrella[] => {
    return storage.umbrellas.getAll().filter(u => u.status === 'scrapped');
  },

  getScrapRecords: (): ScrapRecord[] => {
    return storage.scrapRecords.getAll()
      .sort((a, b) => new Date(b.scrapTime).getTime() - new Date(a.scrapTime).getTime());
  },

  transferToShared: (id: string): Umbrella | null => {
    return umbrellaService.updateStatus(id, 'shared');
  },

  scrapUmbrella: (id: string, reason: string, operator: string): ScrapRecord | null => {
    const umbrella = umbrellaService.updateStatus(id, 'scrapped');
    if (!umbrella) return null;

    const scrapRecord: ScrapRecord = {
      id: `scrap-${Date.now()}`,
      umbrellaId: id,
      reason,
      operator,
      remark: null,
      scrapTime: new Date().toISOString(),
    };

    const scrapRecords = storage.scrapRecords.getAll();
    scrapRecords.unshift(scrapRecord);
    storage.scrapRecords.setAll(scrapRecords);

    return scrapRecord;
  },

  batchTransferToShared: (ids: string[]): number => {
    let count = 0;
    ids.forEach(id => {
      if (umbrellaService.transferToShared(id)) count++;
    });
    return count;
  },

  delete: (id: string): boolean => {
    const umbrellas = storage.umbrellas.getAll();
    const filtered = umbrellas.filter(u => u.id !== id);
    if (filtered.length === umbrellas.length) return false;
    storage.umbrellas.setAll(filtered);
    return true;
  },
};
