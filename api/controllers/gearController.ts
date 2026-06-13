import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import type { RainGear, CreateGearDto, UpdateGearDto, LendDto, ReturnDto } from '../../shared/index.js';
import { generateId } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const GEARS_FILE = path.join(DATA_DIR, 'gears.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

const readGears = (): RainGear[] => {
  if (!fs.existsSync(GEARS_FILE)) return [];
  return JSON.parse(fs.readFileSync(GEARS_FILE, 'utf-8'));
};

const writeGears = (gears: RainGear[]): void => {
  fs.writeFileSync(GEARS_FILE, JSON.stringify(gears, null, 2));
};

const readRecords = (): any[] => {
  if (!fs.existsSync(RECORDS_FILE)) return [];
  return JSON.parse(fs.readFileSync(RECORDS_FILE, 'utf-8'));
};

const writeRecords = (records: any[]): void => {
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
};

export const getAllGears = async (req: Request, res: Response): Promise<void> => {
  try {
    const gears = readGears();
    res.status(200).json(gears);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get gears' });
  }
};

export const getGearById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gears = readGears();
    const gear = gears.find((g) => g.id === id);
    if (!gear) {
      res.status(404).json({ success: false, error: 'Gear not found' });
      return;
    }
    res.status(200).json(gear);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get gear' });
  }
};

export const createGear = async (req: Request, res: Response): Promise<void> => {
  try {
    const dto: CreateGearDto = req.body;
    const gears = readGears();
    const newGear: RainGear = {
      id: generateId(),
      ...dto,
      status: dto.isDamaged ? 'damaged' : 'in_cabinet',
      borrowCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    gears.push(newGear);
    writeGears(gears);
    res.status(201).json(newGear);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create gear' });
  }
};

export const updateGear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dto: UpdateGearDto = req.body;
    const gears = readGears();
    const index = gears.findIndex((g) => g.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Gear not found' });
      return;
    }
    gears[index] = {
      ...gears[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    if (dto.isDamaged !== undefined) {
      gears[index].status = dto.isDamaged ? 'damaged' : gears[index].status;
    }
    writeGears(gears);
    res.status(200).json(gears[index]);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update gear' });
  }
};

export const deleteGear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gears = readGears();
    const newGears = gears.filter((g) => g.id !== id);
    if (newGears.length === gears.length) {
      res.status(404).json({ success: false, error: 'Gear not found' });
      return;
    }
    writeGears(newGears);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete gear' });
  }
};

export const lendGear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dto: LendDto = req.body;
    const gears = readGears();
    const records = readRecords();
    
    const gearIndex = gears.findIndex((g) => g.id === id);
    if (gearIndex === -1) {
      res.status(404).json({ success: false, error: 'Gear not found' });
      return;
    }
    if (gears[gearIndex].status === 'lent') {
      res.status(400).json({ success: false, error: 'Gear is already lent' });
      return;
    }

    const newRecord = {
      id: 'r' + generateId(),
      gearId: id,
      borrower: dto.borrower,
      destination: dto.destination,
      lendTime: new Date().toISOString(),
      expectedReturnTime: new Date(dto.expectedReturnTime).toISOString(),
      status: 'active' as const,
      isDry: false,
      hasNewDamage: false,
    };
    records.push(newRecord);

    gears[gearIndex].status = 'lent';
    gears[gearIndex].borrowCount += 1;
    gears[gearIndex].updatedAt = new Date().toISOString();

    writeGears(gears);
    writeRecords(records);
    res.status(200).json(newRecord);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to lend gear' });
  }
};

export const returnGear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dto: ReturnDto = req.body;
    const gears = readGears();
    const records = readRecords();

    const gearIndex = gears.findIndex((g) => g.id === id);
    if (gearIndex === -1) {
      res.status(404).json({ success: false, error: 'Gear not found' });
      return;
    }

    const activeRecordIndex = records.findIndex(
      (r) => r.gearId === id && r.status === 'active'
    );
    if (activeRecordIndex === -1) {
      res.status(400).json({ success: false, error: 'No active lend record found' });
      return;
    }

    records[activeRecordIndex] = {
      ...records[activeRecordIndex],
      actualReturnTime: new Date().toISOString(),
      isDry: dto.isDry,
      hasNewDamage: dto.hasNewDamage,
      returnNote: dto.returnNote,
      status: 'returned' as const,
    };

    if (dto.isDry) {
      gears[gearIndex].status = dto.hasNewDamage ? 'damaged' : 'in_cabinet';
    } else {
      gears[gearIndex].status = 'drying';
    }
    if (dto.hasNewDamage) {
      gears[gearIndex].isDamaged = true;
    }
    gears[gearIndex].updatedAt = new Date().toISOString();

    writeGears(gears);
    writeRecords(records);
    res.status(200).json(records[activeRecordIndex]);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to return gear' });
  }
};
