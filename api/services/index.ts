import db from "../db/index.js";
import { generateId, parseProductRow } from "../utils/db.js";
import type {
  CreateOrderDto,
  Order,
  OrderStatus,
  OrderWithDetail,
  Product,
  Purchase,
  PurchaseStatus,
  Size,
  UpdateOrderDto,
} from "../../shared/types.js";

export class OrderService {
  static createOrder(data: CreateOrderDto): Order {
    const productRow = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(data.productId) as any;
    if (!productRow) {
      throw new Error("Product not found");
    }
    const product = parseProductRow(productRow);

    const currentStock = product.stock[data.size] || 0;
    const needPurchase = currentStock < data.quantity;
    const orderStatus: OrderStatus = data.orderStatus ?? (needPurchase ? "purchasing" : "ready");

    const orderId = generateId("ord");
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO orders (
        id, studentId, productId, size, quantity, isExchange,
        originalSize, originalCondition, paymentStatus, orderStatus, remark, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      insert.run(
        orderId,
        data.studentId,
        data.productId,
        data.size,
        data.quantity,
        data.isExchange ? 1 : 0,
        data.originalSize || null,
        data.originalCondition || null,
        data.paymentStatus,
        orderStatus,
        data.remark,
        now
      );

      if (!needPurchase) {
        const newStock = { ...product.stock };
        newStock[data.size] = Math.max(0, (newStock[data.size] || 0) - data.quantity);
        db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(
          JSON.stringify(newStock),
          data.productId
        );
      } else {
        const shortage = data.quantity - currentStock;
        const existingPurchase = db
          .prepare(
            "SELECT * FROM purchases WHERE productId = ? AND size = ? AND status = 'pending'"
          )
          .get(data.productId, data.size);

        if (!existingPurchase) {
          const purchaseId = generateId("pur");
          db.prepare(`
            INSERT INTO purchases (id, productId, size, quantity, supplier, status, createdAt)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
          `).run(
            purchaseId,
            data.productId,
            data.size,
            Math.max(shortage, 5),
            product.supplier,
            now
          );
        } else {
          const newQuantity = (existingPurchase as any).quantity + Math.max(shortage, 1);
          db.prepare(
            "UPDATE purchases SET quantity = ? WHERE id = ?"
          ).run(newQuantity, (existingPurchase as any).id);
        }
      }

      const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as any;
      return {
        ...row,
        isExchange: row.isExchange === 1,
      };
    });

    return tx() as Order;
  }

  static updateOrder(id: string, data: UpdateOrderDto): Order | null {
    const fields = Object.keys(data).filter((k) => data[k as keyof UpdateOrderDto] !== undefined);
    if (fields.length === 0) {
      const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;
      return row ? { ...row, isExchange: row.isExchange === 1 } : null;
    }

    const setClauses = fields
      .map((k) => {
        if (k === "isExchange") return `${k} = ?`;
        return `${k} = ?`;
      })
      .join(", ");

    const values = fields.map((k) => {
      const v = data[k as keyof UpdateOrderDto];
      if (k === "isExchange") return v ? 1 : 0;
      return v ?? null;
    });
    values.push(id);

    const stmt = db.prepare(`UPDATE orders SET ${setClauses} WHERE id = ?`);
    stmt.run(...values);

    const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;
    return row ? { ...row, isExchange: row.isExchange === 1 } : null;
  }

  static deleteOrder(id: string): boolean {
    const result = db.prepare("DELETE FROM orders WHERE id = ?").run(id);
    return result.changes > 0;
  }
}

export class PurchaseService {
  static completePurchase(id: string): { purchase: Purchase; product: Product; affectedOrders: OrderWithDetail[] } | null {
    const purchaseRow = db
      .prepare("SELECT * FROM purchases WHERE id = ?")
      .get(id) as any;
    if (!purchaseRow || purchaseRow.status === "completed") {
      return null;
    }

    const productRow = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(purchaseRow.productId) as any;
    if (!productRow) return null;

    const product = parseProductRow(productRow);
    const now = new Date().toISOString();

    const tx = db.transaction(() => {
      db.prepare(
        "UPDATE purchases SET status = 'completed', completedAt = ? WHERE id = ?"
      ).run(now, id);

      const newStock = { ...product.stock };
      newStock[purchaseRow.size as Size] =
        (newStock[purchaseRow.size as Size] || 0) + purchaseRow.quantity;

      db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(
        JSON.stringify(newStock),
        purchaseRow.productId
      );

      const updatedProduct = parseProductRow(
        db.prepare("SELECT * FROM products WHERE id = ?").get(purchaseRow.productId) as any
      );

      const pendingOrders = db
        .prepare(
          "SELECT * FROM orders WHERE productId = ? AND size = ? AND orderStatus = 'purchasing'"
        )
        .all(purchaseRow.productId, purchaseRow.size) as any[];

      const affectedOrderIds: string[] = [];

      pendingOrders.forEach((order) => {
        const currentStock = updatedProduct.stock[order.size as Size] || 0;
        if (currentStock >= order.quantity) {
          db.prepare(
            "UPDATE orders SET orderStatus = 'ready' WHERE id = ?"
          ).run(order.id);

          const remainingStock = currentStock - order.quantity;
          const newStockAfter = { ...updatedProduct.stock };
          newStockAfter[order.size as Size] = remainingStock;

          db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(
            JSON.stringify(newStockAfter),
            purchaseRow.productId
          );
          updatedProduct.stock = newStockAfter;
          affectedOrderIds.push(order.id);
        }
      });

      const finalPurchase = db.prepare("SELECT * FROM purchases WHERE id = ?").get(id) as any;
      const finalProduct = parseProductRow(
        db.prepare("SELECT * FROM products WHERE id = ?").get(purchaseRow.productId) as any
      );

      let affectedOrders: OrderWithDetail[] = [];
      if (affectedOrderIds.length > 0) {
        const placeholders = affectedOrderIds.map(() => "?").join(",");
        const rows = db
          .prepare(
            `SELECT o.*, s.name as studentName, s.className, pr.name as productName
             FROM orders o
             LEFT JOIN students s ON o.studentId = s.id
             LEFT JOIN products pr ON o.productId = pr.id
             WHERE o.id IN (${placeholders})`
          )
          .all(...affectedOrderIds) as any[];
        affectedOrders = rows.map((row: any) => ({
          ...row,
          isExchange: row.isExchange === 1,
        }));
      }

      return {
        purchase: finalPurchase,
        product: finalProduct,
        affectedOrders,
      };
    });

    return tx() as { purchase: Purchase; product: Product; affectedOrders: OrderWithDetail[] };
  }
}
