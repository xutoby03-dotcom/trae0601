import { api } from './client';
import type { Ingredient } from '../types';

export const ingredientsApi = {
  list: (search?: string) =>
    api.get<Ingredient[]>(`/ingredients${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  get: (id: string) => api.get<Ingredient>(`/ingredients/${id}`),

  create: (data: Omit<Ingredient, 'id' | 'createdAt'>) =>
    api.post<Ingredient>('/ingredients', data),

  update: (id: string, data: Partial<Ingredient>) =>
    api.put<Ingredient>(`/ingredients/${id}`, data),

  remove: (id: string) => api.delete<null>(`/ingredients/${id}`),
};

export default ingredientsApi;
