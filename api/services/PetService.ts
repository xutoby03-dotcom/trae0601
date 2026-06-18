import { PetRepository } from '../repositories/PetRepository.js';
import type { Pet } from '../../shared/types.js';

export interface PetListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  species?: string;
}

export interface PetListResponse {
  data: Pet[];
  total: number;
  page: number;
  pageSize: number;
}

export const PetService = {
  list(params: PetListParams): PetListResponse {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const result = PetRepository.findAll(page, pageSize, params.keyword, params.species);
    return {
      ...result,
      page,
      pageSize
    };
  },

  getById(id: number): Pet {
    const pet = PetRepository.findById(id);
    if (!pet) {
      throw new Error('宠物档案不存在');
    }
    return pet;
  },

  create(data: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Pet {
    if (!data.name || !data.species || !data.breed || !data.ownerName || !data.ownerPhone) {
      throw new Error('必填字段不能为空');
    }
    return PetRepository.create(data);
  },

  update(id: number, data: Partial<Omit<Pet, 'id' | 'createdAt'>>): Pet {
    const existing = PetRepository.findById(id);
    if (!existing) {
      throw new Error('宠物档案不存在');
    }
    const updated = PetRepository.update(id, data);
    if (!updated) {
      throw new Error('更新失败');
    }
    return updated;
  },

  delete(id: number): void {
    const existing = PetRepository.findById(id);
    if (!existing) {
      throw new Error('宠物档案不存在');
    }
    const success = PetRepository.delete(id);
    if (!success) {
      throw new Error('删除失败');
    }
  },

  search(keyword: string): Pet[] {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }
    return PetRepository.search(keyword);
  }
};
