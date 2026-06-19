import { http } from "./client";
import type { Product, UpdateProductDto, Size } from "@/types";

export const productsApi = {
  getAll: (params?: { category?: string }) =>
    http.get<Product[]>("/products", params),

  getOne: (id: string) => http.get<Product>(`/products/${id}`),

  update: (id: string, data: UpdateProductDto) =>
    http.put<Product>(`/products/${id}`, data),

  updateStock: (id: string, size: Size, delta: number) =>
    http.put<Product>(`/products/${id}/stock`, { size, delta }),
};
