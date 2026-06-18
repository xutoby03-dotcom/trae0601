import type { Package, Locker, StatsSummary, CompanyStats, AbnormalRecord, PackageStatus } from '../../shared/types.js';
import db from '../db.js';

const OVERDUE_HOURS = 48;

function rowToPackage(row: any): Package {
  return {
    id: row.id,
    recipientName: row.recipient_name,
    phoneLast4: row.phone_last4,
    company: row.company,
    trackingNumber: row.tracking_number,
    lockerId: row.locker_id,
    lockerCode: row.locker_code,
    size: row.size,
    isCod: !!row.is_cod,
    isFragile: !!row.is_fragile,
    isColdChain: !!row.is_cold_chain,
    photoUrl: row.photo_url,
    status: row.status as PackageStatus,
    createdAt: row.created_at,
    pickedAt: row.picked_at,
    pickedBy: row.picked_by,
    isProxy: !!row.is_proxy,
    proxyName: row.proxy_name,
    proxyPhone: row.proxy_phone,
    abnormalReason: row.abnormal_reason,
  };
}

function rowToLocker(row: any): Locker {
  return {
    id: row.id,
    code: row.code,
    zone: row.zone,
    size: row.size,
    status: row.status,
  };
}

export function isOverdue(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created > OVERDUE_HOURS * 60 * 60 * 1000;
}

export function getPriorityScore(pkg: Package): number {
  let score = 0;
  if (pkg.isFragile) score += 100;
  if (pkg.isColdChain) score += 80;
  if (pkg.isCod) score += 50;
  if (isOverdue(pkg.createdAt)) score += 200;
  return score;
}

export function getAllLockers(): Locker[] {
  const rows = db.prepare('SELECT * FROM lockers ORDER BY zone, code').all();
  return rows.map(rowToLocker);
}

export function getAvailableLockers(): Locker[] {
  const rows = db.prepare("SELECT * FROM lockers WHERE status = 'free' ORDER BY zone, code").all();
  return rows.map(rowToLocker);
}

export function getLockerById(id: string): Locker | undefined {
  const row = db.prepare('SELECT * FROM lockers WHERE id = ?').get(id);
  return row ? rowToLocker(row) : undefined;
}

export function updateLockerStatus(id: string, status: string): void {
  db.prepare('UPDATE lockers SET status = ? WHERE id = ?').run(status, id);
}

export function createPackage(data: any): Package {
  const id = 'PKG' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO packages (
      id, recipient_name, phone_last4, company, tracking_number,
      locker_id, size, is_cod, is_fragile, is_cold_chain, photo_url, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?)
  `);
  stmt.run(
    id,
    data.recipientName,
    data.phoneLast4,
    data.company,
    data.trackingNumber,
    data.lockerId,
    data.size,
    data.isCod ? 1 : 0,
    data.isFragile ? 1 : 0,
    data.isColdChain ? 1 : 0,
    data.photoUrl || null,
    createdAt
  );
  updateLockerStatus(data.lockerId, 'occupied');
  return getPackageById(id)!;
}

export function getPackageById(id: string): Package | undefined {
  const row = db.prepare(`
    SELECT p.*, l.code as locker_code FROM packages p
    LEFT JOIN lockers l ON p.locker_id = l.id WHERE p.id = ?
  `).get(id);
  return row ? rowToPackage(row) : undefined;
}

export function getPackagesByPhone(phoneLast4: string): Package[] {
  const rows = db.prepare(`
    SELECT p.*, l.code as locker_code FROM packages p
    LEFT JOIN lockers l ON p.locker_id = l.id
    WHERE p.phone_last4 = ? AND p.status = 'waiting'
    ORDER BY p.created_at DESC
  `).all(phoneLast4);
  return rows.map(rowToPackage);
}

export function getWaitingPackages(): Package[] {
  const rows = db.prepare(`
    SELECT p.*, l.code as locker_code FROM packages p
    LEFT JOIN lockers l ON p.locker_id = l.id
    WHERE p.status = 'waiting'
    ORDER BY p.created_at DESC
  `).all();
  return rows.map(rowToPackage);
}

export function getOverduePackages(): Package[] {
  return getWaitingPackages().filter(p => isOverdue(p.createdAt));
}

export function getAllPackages(): Package[] {
  const rows = db.prepare(`
    SELECT p.*, l.code as locker_code FROM packages p
    LEFT JOIN lockers l ON p.locker_id = l.id
    ORDER BY p.created_at DESC
  `).all();
  return rows.map(rowToPackage);
}

export function pickupPackage(id: string, payload: any): Package | undefined {
  const pickedAt = new Date().toISOString();
  const pkg = getPackageById(id);
  if (!pkg) return undefined;
  db.prepare(`
    UPDATE packages SET
      status = 'picked',
      picked_at = ?,
      picked_by = ?,
      is_proxy = ?,
      proxy_name = ?,
      proxy_phone = ?
    WHERE id = ?
  `).run(
    pickedAt,
    payload.pickedBy,
    payload.isProxy ? 1 : 0,
    payload.proxyName || null,
    payload.proxyPhone || null,
    id
  );
  updateLockerStatus(pkg.lockerId, 'free');
  return getPackageById(id);
}

export function markAbnormal(id: string, reason: string, pickedBy: string): Package | undefined {
  const pickedAt = new Date().toISOString();
  const pkg = getPackageById(id);
  if (!pkg) return undefined;
  db.prepare(`
    UPDATE packages SET
      status = 'abnormal',
      picked_at = ?,
      picked_by = ?,
      abnormal_reason = ?
    WHERE id = ?
  `).run(pickedAt, pickedBy, reason, id);
  updateLockerStatus(pkg.lockerId, 'free');
  return getPackageById(id);
}

export function getStatsSummary(): StatsSummary {
  const lockers = getAllLockers();
  const all = getAllPackages();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const waiting = all.filter(p => p.status === 'waiting');
  const overdue = waiting.filter(p => isOverdue(p.createdAt));
  const createdToday = all.filter(p => p.createdAt.slice(0, 10) === todayStr);
  const pickedToday = all.filter(p => p.status !== 'waiting' && p.pickedAt?.slice(0, 10) === todayStr);
  const occupied = lockers.filter(l => l.status === 'occupied').length;
  const free = lockers.filter(l => l.status === 'free').length;
  return {
    totalWaiting: waiting.length,
    totalOverdue: overdue.length,
    lockerOccupancy: lockers.length > 0 ? Math.round((occupied / lockers.length) * 100) : 0,
    totalToday: createdToday.length,
    pickedToday: pickedToday.length,
    totalLockers: lockers.length,
    occupiedLockers: occupied,
    freeLockers: free,
  };
}

export function getCompanyStats(): CompanyStats[] {
  const rows = db.prepare(`
    SELECT company, COUNT(*) as count FROM packages GROUP BY company ORDER BY count DESC
  `).all() as any[];
  return rows.map(r => ({ company: r.company, count: r.count }));
}

export function getAbnormalRecords(): AbnormalRecord[] {
  const rows = db.prepare(`
    SELECT id, recipient_name, company, tracking_number, abnormal_reason, created_at, picked_at
    FROM packages WHERE status = 'abnormal' ORDER BY picked_at DESC
  `).all() as any[];
  return rows.map(r => ({
    id: r.id,
    recipientName: r.recipient_name,
    company: r.company,
    trackingNumber: r.tracking_number,
    abnormalReason: r.abnormal_reason,
    createdAt: r.created_at,
    pickedAt: r.picked_at,
  }));
}
