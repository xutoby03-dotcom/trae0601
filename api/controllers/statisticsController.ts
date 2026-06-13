import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import type { RainGear, BorrowRecord, StatisticsSummary, OverdueItem } from '../../shared/index.js';
import { isOverdue, getOverdueHours } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const GEARS_FILE = path.join(DATA_DIR, 'gears.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

const readGears = (): RainGear[] => {
  if (!fs.existsSync(GEARS_FILE)) return [];
  return JSON.parse(fs.readFileSync(GEARS_FILE, 'utf-8'));
};

const readRecords = (): BorrowRecord[] => {
  if (!fs.existsSync(RECORDS_FILE)) return [];
  return JSON.parse(fs.readFileSync(RECORDS_FILE, 'utf-8'));
};

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const gears = readGears();
    const records = readRecords();

    const totalCount = gears.length;
    const inCabinetCount = gears.filter((g) => g.status === 'in_cabinet').length;
    const lentCount = gears.filter((g) => g.status === 'lent').length;
    const dryingCount = gears.filter((g) => g.status === 'drying').length;
    const damagedCount = gears.filter((g) => g.status === 'damaged' || g.isDamaged).length;

    const activeRecords = records.filter((r) => r.status === 'active');
    const overdueCount = activeRecords.filter((r) => isOverdue(r.lendTime)).length;

    const mostBorrowed = [...gears]
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5)
      .map((gear) => ({ gear, count: gear.borrowCount }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRecords = records.filter(
      (r) => new Date(r.lendTime) >= thirtyDaysAgo && r.status === 'returned'
    );
    
    let maxConcurrent = 0;
    const lendTimes = recentRecords.map((r) => ({ time: new Date(r.lendTime), type: 'lend' }));
    const returnTimes = recentRecords
      .filter((r) => r.actualReturnTime)
      .map((r) => ({ time: new Date(r.actualReturnTime!), type: 'return' }));
    const events = [...lendTimes, ...returnTimes].sort((a, b) => a.time.getTime() - b.time.getTime());
    
    let current = 0;
    for (const event of events) {
      if (event.type === 'lend') current++;
      else current--;
      maxConcurrent = Math.max(maxConcurrent, current);
    }

    const needed = Math.max(2, maxConcurrent);
    const available = inCabinetCount;
    const spareGap = { needed, available };

    const summary: StatisticsSummary = {
      totalCount,
      inCabinetCount,
      lentCount,
      dryingCount,
      damagedCount,
      overdueCount,
      mostBorrowed,
      spareGap,
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get summary' });
  }
};

export const getOverdue = async (req: Request, res: Response): Promise<void> => {
  try {
    const gears = readGears();
    const records = readRecords();

    const activeRecords = records.filter((r) => r.status === 'active');
    const overdueItems: OverdueItem[] = activeRecords
      .filter((r) => isOverdue(r.lendTime))
      .map((record) => {
        const gear = gears.find((g) => g.id === record.gearId)!;
        return {
          record,
          gear,
          overdueHours: getOverdueHours(record.lendTime),
        };
      });

    res.status(200).json(overdueItems);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get overdue items' });
  }
};
