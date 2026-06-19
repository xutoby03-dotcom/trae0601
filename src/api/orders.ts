import { http } from "./client";
import type {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  PaymentStatus,
  OrderStatus,
} from "@/types";

export const ordersApi = {
  getAll: (params?: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    className?: string;
    search?: string;
  }) => http.get<Order[]>("/orders", params),

  getOne: (id: string) => http.get<Order>(`/orders/${id}`),

  create: (data: CreateOrderDto) => http.post<Order>("/orders", data),

  update: (id: string, data: UpdateOrderDto) =>
    http.put<Order>(`/orders/${id}`, data),

  updatePayment: (id: string, status: PaymentStatus) =>
    http.patch<Order>(`/orders/${id}/payment`, { status }),

  updateStatus: (id: string, status: OrderStatus) =>
    http.patch<Order>(`/orders/${id}/status`, { status }),

  delete: (id: string) => http.delete<{ id: string }>(`/orders/${id}`),
};
