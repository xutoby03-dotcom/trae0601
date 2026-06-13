import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import type { BorrowRecord } from '../../shared/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

const readRecords = (): BorrowRecord[] => {
  if (!fs.existsSync(RECORDS_FILE)) return [];
  return JSON.parse(fs.readFileSync(RECORDS_FILE, 'utf-8'));
};

export const getAllRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const records = readRecords();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get records' });
  }
};
