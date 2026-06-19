import type { Request, Response } from "express";
import db from "../db/index.js";
import { generateId } from "../utils/db.js";
import type {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
} from "../../shared/types.js";

function parseStudentRow(row: any): Student {
  return row;
}

export const getStudents = (req: Request, res: Response) => {
  const { className, search } = req.query;
  let query = "SELECT * FROM students WHERE 1=1";
  const params: any[] = [];

  if (className) {
    query += " AND className = ?";
    params.push(String(className));
  }
  if (search) {
    query += " AND (name LIKE ? OR phone LIKE ? OR className LIKE ?)";
    const like = `%${String(search)}%`;
    params.push(like, like, like);
  }
  query += " ORDER BY createdAt DESC";

  const rows = db.prepare(query).all(...params) as any[];
  res.json({
    success: true,
    data: rows.map(parseStudentRow),
  });
};

export const getStudent = (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ success: false, error: "Student not found" });
    return;
  }
  res.json({ success: true, data: parseStudentRow(row) });
};

export const createStudent = (req: Request, res: Response) => {
  const data: CreateStudentDto = req.body;
  const id = generateId("stu");
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO students (id, className, name, height, weight, originalSize, phone, remark, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.className,
    data.name,
    data.height,
    data.weight,
    data.originalSize,
    data.phone,
    data.remark || "",
    now
  );

  const row = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as any;
  res.status(201).json({ success: true, data: parseStudentRow(row) });
};

export const updateStudent = (req: Request, res: Response) => {
  const data: UpdateStudentDto = req.body;
  const id = String(req.params.id);

  const fields = Object.keys(data).filter(
    (k) => data[k as keyof UpdateStudentDto] !== undefined
  );
  if (fields.length === 0) {
    const row = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as any;
    if (!row) {
      res.status(404).json({ success: false, error: "Student not found" });
      return;
    }
    res.json({ success: true, data: parseStudentRow(row) });
    return;
  }

  const setClauses = fields.map((k) => `${k} = ?`).join(", ");
  const values = fields.map((k) => data[k as keyof UpdateStudentDto]);
  values.push(id);

  const stmt = db.prepare(`UPDATE students SET ${setClauses} WHERE id = ?`);
  const result = stmt.run(...values);

  if (result.changes === 0) {
    res.status(404).json({ success: false, error: "Student not found" });
    return;
  }

  const row = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as any;
  res.json({ success: true, data: parseStudentRow(row) });
};

export const deleteStudent = (req: Request, res: Response) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM students WHERE id = ?").run(id);
  if (result.changes === 0) {
    res.status(404).json({ success: false, error: "Student not found" });
    return;
  }
  res.json({ success: true, data: { id } });
};
