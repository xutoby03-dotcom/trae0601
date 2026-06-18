import db from '../db/database.js';
import { VaccineRecord } from '../../shared/types.js';

function rowToVaccine(row: any): VaccineRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    type: row.type,
    name: row.name,
    vaccinationDate: row.vaccination_date,
    expiryDate: row.expiry_date,
    certificateUrl: row.certificate_url,
    status: row.status,
    verified: row.verified === 1,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    notes: row.notes
  };
}

export const VaccineRepository = {
  findByPetId(petId: number): VaccineRecord[] {
    const rows = db.prepare(`
      SELECT * FROM vaccine_records 
      WHERE pet_id = ? 
      ORDER BY vaccination_date DESC
    `).all(petId);
    return rows.map(rowToVaccine);
  },

  findById(id: number): VaccineRecord | undefined {
    const row = db.prepare('SELECT * FROM vaccine_records WHERE id = ?').get(id);
    return row ? rowToVaccine(row) : undefined;
  },

  findExpiring(days: number = 30): (VaccineRecord & { daysRemaining: number })[] {
    const rows = db.prepare(`
      SELECT vr.*, 
             julianday(vr.expiry_date) - julianday('now') as days_remaining
      FROM vaccine_records vr
      WHERE vr.status IN ('valid', 'expiring')
        AND julianday(vr.expiry_date) - julianday('now') <= ?
        AND julianday(vr.expiry_date) - julianday('now') >= 0
      ORDER BY days_remaining ASC
    `).all(days);
    
    return rows.map((row: any) => ({
      ...rowToVaccine(row),
      daysRemaining: Math.floor(row.days_remaining)
    }));
  },

  create(vaccine: Omit<VaccineRecord, 'id'>): VaccineRecord {
    const stmt = db.prepare(`
      INSERT INTO vaccine_records 
        (pet_id, type, name, vaccination_date, expiry_date, certificate_url, status, verified, verified_by, verified_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      vaccine.petId, vaccine.type, vaccine.name, vaccine.vaccinationDate, vaccine.expiryDate,
      vaccine.certificateUrl, vaccine.status, vaccine.verified ? 1 : 0,
      vaccine.verifiedBy, vaccine.verifiedAt, vaccine.notes
    );
    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, updates: Partial<Omit<VaccineRecord, 'id' | 'petId'>>): VaccineRecord | undefined {
    const fields = [];
    const values: any[] = [];
    
    if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.vaccinationDate !== undefined) { fields.push('vaccination_date = ?'); values.push(updates.vaccinationDate); }
    if (updates.expiryDate !== undefined) { fields.push('expiry_date = ?'); values.push(updates.expiryDate); }
    if (updates.certificateUrl !== undefined) { fields.push('certificate_url = ?'); values.push(updates.certificateUrl); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.verified !== undefined) { fields.push('verified = ?'); values.push(updates.verified ? 1 : 0); }
    if (updates.verifiedBy !== undefined) { fields.push('verified_by = ?'); values.push(updates.verifiedBy); }
    if (updates.verifiedAt !== undefined) { fields.push('verified_at = ?'); values.push(updates.verifiedAt); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    db.prepare(`UPDATE vaccine_records SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  verify(id: number, verifiedBy: number, notes?: string): VaccineRecord | undefined {
    db.prepare(`
      UPDATE vaccine_records 
      SET verified = 1, verified_by = ?, verified_at = CURRENT_TIMESTAMP, notes = ?
      WHERE id = ?
    `).run(verifiedBy, notes, id);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM vaccine_records WHERE id = ?').run(id);
    return result.changes > 0;
  },

  updateStatus(id: number, status: 'valid' | 'expiring' | 'expired'): boolean {
    const result = db.prepare('UPDATE vaccine_records SET status = ? WHERE id = ?').run(status, id);
    return result.changes > 0;
  }
};
