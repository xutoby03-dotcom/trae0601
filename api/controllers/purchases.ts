import type { Request, Response } from "express";
import db from "../db/index.js";
import { PurchaseService } from "../services/index.js";
import { generateId } from "../utils/db.js";
import type {
  Purchase,
  CreatePurchaseDto,
  UpdatePurchaseDto,
} from "../../shared/types.js";

function parsePurchaseRow(row: any): Purchase {
  return row;
}

export const getPurchases = (req: Request, res: Response) => {
  const { status, search } = req.query;
  let query = `
    SELECT p.* FROM purchases p
    LEFT JOIN products pr ON p.productId = pr.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) {
    query += " AND p.status = ?";
    params.push(String(status));
  }
  if (search) {
    query += " AND (pr.name LIKE ? OR p.supplier LIKE ?)";
    const like = `%${String(search)}%`;
    params.push(like, like);
  }
  query += `
    ORDER BY 
      CASE p.status WHEN 'pending' THEN 0 ELSE 1 END,
      p.createdAt DESC
  `;

  const rows = db.prepare(query).all(...params) as any[];
  res.json({
    success: true,
    data: rows.map(parsePurchaseRow),
  });
};

export const getPurchase = (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM purchases WHERE id = ?").get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ success: false, error: "Purchase not found" });
    return;
  }
  res.json({ success: true, data: parsePurchaseRow(row) });
};

export const createPurchase = (req: Request, res: Response) => {
  const data: CreatePurchaseDto = req.body;
  const id = generateId("pur");
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO purchases (id, productId, size, quantity, supplier, status, createdAt)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    id,
    data.productId,
    data.size,
    data.quantity,
    data.supplier,
    now
  );

  const row = db.prepare("SELECT * FROM purchases WHERE id = ?").get(id) as any;
  res.status(201).json({ success: true, data: parsePurchaseRow(row) });
};

export const updatePurchase = (req: Request, res: Response) => {
  const data: UpdatePurchaseDto = req.body;
  const id = String(req.params.id);

  const fields = Object.keys(data).filter(
    (k) => data[k as keyof UpdatePurchaseDto] !== undefined
  );
  if (fields.length === 0) {
    const row = db.prepare("SELECT * FROM purchases WHERE id = ?").get(id) as any;
    if (!row) {
      res.status(404).json({ success: false, error: "Purchase not found" });
      return;
    }
    res.json({ success: true, data: parsePurchaseRow(row) });
    return;
  }

  const setClauses = fields.map((k) => `${k} = ?`).join(", ");
  const values = fields.map((k) => data[k as keyof UpdatePurchaseDto]);
  values.push(id);

  const stmt = db.prepare(`UPDATE purchases SET ${setClauses} WHERE id = ?`);
  const result = stmt.run(...values);

  if (result.changes === 0) {
    res.status(404).json({ success: false, error: "Purchase not found" });
    return;
  }

  const row = db.prepare("SELECT * FROM purchases WHERE id = ?").get(id) as any;
  res.json({ success: true, data: parsePurchaseRow(row) });
};

export const completePurchase = (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = PurchaseService.completePurchase(id);
  if (!result) {
    res.status(404).json({ success: false, error: "Purchase not found or already completed" });
    return;
  }
  res.json({ success: true, data: result });
};

export const deletePurchase = (req: Request, res: Response) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM purchases WHERE id = ?").run(id);
  if (result.changes === 0) {
    res.status(404).json({ success: false, error: "Purchase not found" });
    return;
  }
  res.json({ success: true, data: { id } });
};
