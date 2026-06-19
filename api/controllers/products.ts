import type { Request, Response } from "express";
import db from "../db/index.js";
import { parseProductRow, serializeProductForDb } from "../utils/db.js";
import type { Product, UpdateProductDto, Size } from "../../shared/types.js";

export const getProducts = (req: Request, res: Response) => {
  const { category } = req.query;
  let query = "SELECT * FROM products";
  const params: any[] = [];

  if (category) {
    query += " WHERE category = ?";
    params.push(String(category));
  }
  query += " ORDER BY createdAt DESC";

  const rows = db.prepare(query).all(...params) as any[];
  res.json({
    success: true,
    data: rows.map(parseProductRow),
  });
};

export const getProduct = (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ success: false, error: "Product not found" });
    return;
  }
  res.json({ success: true, data: parseProductRow(row) });
};

export const updateProduct = (req: Request, res: Response) => {
  const data: UpdateProductDto = req.body;
  const { id } = req.params;

  const fields = Object.keys(data).filter(
    (k) => data[k as keyof UpdateProductDto] !== undefined
  );
  if (fields.length === 0) {
    const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;
    if (!row) {
      res.status(404).json({ success: false, error: "Product not found" });
      return;
    }
    res.json({ success: true, data: parseProductRow(row) });
    return;
  }

  const serialized = serializeProductForDb(data);
  const setClauses = fields.map((k) => `${k} = ?`).join(", ");
  const values = fields.map((k) => serialized[k]);
  values.push(id);

  const stmt = db.prepare(`UPDATE products SET ${setClauses} WHERE id = ?`);
  const result = stmt.run(...values);

  if (result.changes === 0) {
    res.status(404).json({ success: false, error: "Product not found" });
    return;
  }

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;
  res.json({ success: true, data: parseProductRow(row) });
};

export const updateStock = (req: Request, res: Response) => {
  const { id } = req.params;
  const { size, delta } = req.body as { size: Size; delta: number };

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;
  if (!row) {
    res.status(404).json({ success: false, error: "Product not found" });
    return;
  }

  const product = parseProductRow(row);
  const newStock = { ...product.stock };
  newStock[size] = Math.max(0, (newStock[size] || 0) + delta);

  db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(
    JSON.stringify(newStock),
    id
  );

  const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;
  res.json({ success: true, data: parseProductRow(updated) });
};
