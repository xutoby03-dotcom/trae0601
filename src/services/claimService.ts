import type { ClaimApplication, CreateClaimData } from '@/types';
import { storage } from './storage';
import { umbrellaService } from './umbrellaService';

const generateId = (): string => `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const claimService = {
  getAll: (umbrellaId?: string): ClaimApplication[] => {
    let claims = storage.claims.getAll();
    if (umbrellaId) {
      claims = claims.filter(c => c.umbrellaId === umbrellaId);
    }
    return claims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (id: string): ClaimApplication | null => {
    return storage.claims.getAll().find(c => c.id === id) || null;
  },

  getPending: (): ClaimApplication[] => {
    return storage.claims.getAll().filter(c => c.status === 'pending');
  },

  create: (data: CreateClaimData): ClaimApplication => {
    const newClaim: ClaimApplication = {
      id: generateId(),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const claims = storage.claims.getAll();
    claims.unshift(newClaim);
    storage.claims.setAll(claims);

    return newClaim;
  },

  approve: (applicationId: string): boolean => {
    const claims = storage.claims.getAll();
    const index = claims.findIndex(c => c.id === applicationId);

    if (index === -1) return false;

    claims[index] = {
      ...claims[index],
      status: 'approved',
    };

    storage.claims.setAll(claims);

    umbrellaService.updateStatus(claims[index].umbrellaId, 'claimed');

    storage.claims.getAll()
      .filter(c => c.umbrellaId === claims[index].umbrellaId && c.id !== applicationId)
      .forEach(c => claimService.reject(c.id, '已被其他申请者认领'));

    return true;
  },

  reject: (applicationId: string, reason?: string): boolean => {
    const claims = storage.claims.getAll();
    const index = claims.findIndex(c => c.id === applicationId);

    if (index === -1) return false;

    claims[index] = {
      ...claims[index],
      status: 'rejected',
      ownershipProof: reason ? `${claims[index].ownershipProof}\n【驳回原因】${reason}` : claims[index].ownershipProof,
    };

    storage.claims.setAll(claims);
    return true;
  },

  getByUmbrellaId: (umbrellaId: string): ClaimApplication[] => {
    return storage.claims.getAll().filter(c => c.umbrellaId === umbrellaId);
  },
};
