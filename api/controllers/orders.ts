import type { Request, Response } from "express";
import db from "../db/index.js";
import { OrderService } from "../services/index.js";
import type {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  PaymentStatus,
  OrderStatus,
} from "../../shared/types.js";

function parseOrderRow(row: any): Order {
  return {
    ...row,
    isExchange: row.isExchange === 1,
  };
}

export const getOrders = (req: Request, res: Response) => {
  const { orderStatus, paymentStatus, className, search } = req.query;
  let query = `
    SELECT o.* FROM orders o
    LEFT JOIN students s ON o.studentId = s.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (orderStatus) {
    query += " AND o.orderStatus = ?";
    params.push(String(orderStatus));
  }
  if (paymentStatus) {
    query += " AND o.paymentStatus = ?";
    params.push(String(paymentStatus));
  }
  if (className) {
    query += " AND s.className = ?";
    params.push(String(className));
  }
  if (search) {
    query += " AND (s.name LIKE ? OR s.className LIKE ?)";
    const like = `%${String(search)}%`;
    params.push(like, like);
  }
  query += " ORDER BY o.createdAt DESC";

  const rows = db.prepare(query).all(...params) as any[];
  res.json({
    success: true,
    data: rows.map(parseOrderRow),
  });
};

export const getOrder = (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ success: false, error: "Order not found" });
    return;
  }
  res.json({ success: true, data: parseOrderRow(row) });
};

export const createOrder = (req: Request, res: Response) => {
  try {
    const data: CreateOrderDto = req.body;
    const order = OrderService.createOrder(data);
    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateOrder = (req: Request, res: Response) => {
  const data: UpdateOrderDto = req.body;
  const id = String(req.params.id);

  const updated = OrderService.updateOrder(id, data);
  if (!updated) {
    res.status(404).json({ success: false, error: "Order not found" });
    return;
  }
  res.json({ success: true, data: updated });
};

export const updatePaymentStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: PaymentStatus };

  const result = db
    .prepare("UPDATE orders SET paymentStatus = ? WHERE id = ?")
    .run(status, id);

  if (result.changes === 0) {
    res.status(404).json({ success: false, error: "Order not found" });
    return;
  }

  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;
  res.json({ success: true, data: parseOrderRow(row) });
};

export const updateOrderStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: OrderStatus };

  const result = db
    .prepare("UPDATE orders SET orderStatus = ? WHERE id = ?")
    .run(status, id);

  if (result.changes === 0) {
    res.status(404).json({ success: false, error: "Order not found" });
    return;
  }

  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;
  res.json({ success: true, data: parseOrderRow(row) });
};

export const deleteOrder = (req: Request, res: Response) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  if (result.changes === 0) {
    res.status(404).json({ success: false, error: "Order not found" });
    return;
  }
  res.json({ success: true, data: { id } });
};
