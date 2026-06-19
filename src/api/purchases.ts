import { http } from "./client";
import type {
  Purchase,
  CreatePurchaseDto,
  UpdatePurchaseDto,
  Product,
  OrderWithDetail,
} from "@/types";

export const purchasesApi = {
  getAll: (params?: { status?: string; search?: string }) =>
    http.get<Purchase[]>("/purchases", params),

  getOne: (id: string) => http.get<Purchase>(`/purchases/${id}`),

  create: (data: CreatePurchaseDto) => http.post<Purchase>("/purchases", data),

  update: (id: string, data: UpdatePurchaseDto) =>
    http.put<Purchase>(`/purchases/${id}`),

  complete: (id: string) =>
    http.post<{ purchase: Purchase; product: Product; affectedOrders: OrderWithDetail[] }>(
      `/purchases/${id}/complete`
    ),

  delete: (id: string) => http.delete<{ id: string }>(`/purchases/${id}`),
};
