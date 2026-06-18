import db from '../db/database.js';
import { Stay, Pet, Cage } from '../../shared/types.js';

function rowToStay(row: any): Stay {
  return {
    id: row.id,
    petId: row.pet_id,
    cageId: row.cage_id,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    actualCheckOut: row.actual_check_out,
    status: row.status,
    vaccinationVerified: row.vaccination_verified === 1,
    requiresIsolation: row.requires_isolation === 1,
    highRisk: row.high_risk === 1,
    highRiskReason: row.high_risk_reason,
    assignedStaffId: row.assigned_staff_id,
    notes: row.notes,
    createdAt: row.created_at
  };
}

export interface StayWithRelations extends Stay {
  pet: Pet;
  cage?: Cage;
}

function rowToPet(row: any): Pet {
  return {
    id: row.pet_id,
    name: row.pet_name,
    species: row.pet_species,
    breed: row.pet_breed,
    age: row.pet_age,
    weight: row.pet_weight,
    personality: row.pet_personality || '',
    sterilized: row.pet_sterilized === 1,
    ownerName: row.pet_owner_name,
    ownerPhone: row.pet_owner_phone,
    photoUrl: row.pet_photo_url,
    medicalHistory: row.pet_medical_history,
    allergies: row.pet_allergies,
    specialRequirements: row.pet_special_requirements,
    createdAt: row.pet_created_at,
    updatedAt: row.pet_updated_at
  };
}

function rowToCage(row: any): Cage | undefined {
  if (!row.cage_id) return undefined;
  return {
    id: row.cage_id,
    code: row.cage_code,
    name: row.cage_name,
    type: row.cage_type,
    suitableFor: row.cage_suitable_for,
    size: row.cage_size,
    status: row.cage_status,
    currentStayId: row.cage_current_stay_id,
    notes: row.cage_notes
  };
}

export const StayRepository = {
  findAll(status?: string, page: number = 1, pageSize: number = 20): { data: StayWithRelations[], total: number } {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      whereClause += ' AND s.status = ?';
      params.push(status);
    }
    
    const totalRow = db.prepare(`SELECT COUNT(*) as count FROM stays s ${whereClause}`).get(...params) as { count: number };
    
    const offset = (page - 1) * pageSize;
    const rows = db.prepare(`
      SELECT s.*,
             p.id as pet_id, p.name as pet_name, p.species as pet_species, p.breed as pet_breed,
             p.age as pet_age, p.weight as pet_weight, p.personality as pet_personality,
             p.sterilized as pet_sterilized, p.owner_name as pet_owner_name, p.owner_phone as pet_owner_phone,
             p.photo_url as pet_photo_url, p.medical_history as pet_medical_history,
             p.allergies as pet_allergies, p.special_requirements as pet_special_requirements,
             p.created_at as pet_created_at, p.updated_at as pet_updated_at,
             c.id as cage_id, c.code as cage_code, c.name as cage_name, c.type as cage_type,
             c.suitable_for as cage_suitable_for, c.size as cage_size, c.status as cage_status,
             c.current_stay_id as cage_current_stay_id, c.notes as cage_notes
      FROM stays s
      INNER JOIN pets p ON s.pet_id = p.id
      LEFT JOIN cages c ON s.cage_id = c.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, pageSize, offset);
    
    return {
      data: rows.map(row => ({
        ...rowToStay(row),
        pet: rowToPet(row),
        cage: rowToCage(row)
      })),
      total: totalRow.count
    };
  },

  findById(id: number): StayWithRelations | undefined {
    const row = db.prepare(`
      SELECT s.*,
             p.id as pet_id, p.name as pet_name, p.species as pet_species, p.breed as pet_breed,
             p.age as pet_age, p.weight as pet_weight, p.personality as pet_personality,
             p.sterilized as pet_sterilized, p.owner_name as pet_owner_name, p.owner_phone as pet_owner_phone,
             p.photo_url as pet_photo_url, p.medical_history as pet_medical_history,
             p.allergies as pet_allergies, p.special_requirements as pet_special_requirements,
             p.created_at as pet_created_at, p.updated_at as pet_updated_at,
             c.id as cage_id, c.code as cage_code, c.name as cage_name, c.type as cage_type,
             c.suitable_for as cage_suitable_for, c.size as cage_size, c.status as cage_status,
             c.current_stay_id as cage_current_stay_id, c.notes as cage_notes
      FROM stays s
      INNER JOIN pets p ON s.pet_id = p.id
      LEFT JOIN cages c ON s.cage_id = c.id
      WHERE s.id = ?
    `).get(id);
    
    if (!row) return undefined;
    return {
      ...rowToStay(row),
      pet: rowToPet(row),
      cage: rowToCage(row)
    };
  },

  findByPetId(petId: number): Stay[] {
    const rows = db.prepare(`
      SELECT * FROM stays 
      WHERE pet_id = ? 
      ORDER BY check_in_date DESC
    `).all(petId);
    return rows.map(rowToStay);
  },

  findByStatus(status: Stay['status']): Stay[] {
    const rows = db.prepare('SELECT * FROM stays WHERE status = ? ORDER BY check_in_date').all(status);
    return rows.map(rowToStay);
  },

  findTodayCheckIn(): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM stays 
      WHERE DATE(check_in_date) = DATE('now') AND status IN ('confirmed', 'checked-in')
    `).get() as { count: number };
    return row.count;
  },

  findTodayCheckOut(): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM stays 
      WHERE DATE(check_out_date) = DATE('now') AND status = 'checked-in'
    `).get() as { count: number };
    return row.count;
  },

  findCurrentlyStaying(): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM stays WHERE status = 'checked-in'
    `).get() as { count: number };
    return row.count;
  },

  findIsolationCount(): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM stays 
      WHERE status = 'checked-in' AND requires_isolation = 1
    `).get() as { count: number };
    return row.count;
  },

  findHighRiskCount(): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM stays 
      WHERE status = 'checked-in' AND high_risk = 1
    `).get() as { count: number };
    return row.count;
  },

  findPendingVaccination(): (Stay & { pet: Pet })[] {
    const rows = db.prepare(`
      SELECT s.*,
             p.id as pet_id, p.name as pet_name, p.species as pet_species, p.breed as pet_breed,
             p.age as pet_age, p.weight as pet_weight, p.personality as pet_personality,
             p.sterilized as pet_sterilized, p.owner_name as pet_owner_name, p.owner_phone as pet_owner_phone,
             p.photo_url as pet_photo_url, p.medical_history as pet_medical_history,
             p.allergies as pet_allergies, p.special_requirements as pet_special_requirements,
             p.created_at as pet_created_at, p.updated_at as pet_updated_at
      FROM stays s
      INNER JOIN pets p ON s.pet_id = p.id
      WHERE s.vaccination_verified = 0 AND s.status = 'pending'
      ORDER BY s.created_at DESC
    `).all();
    
    return rows.map(row => ({
      ...rowToStay(row),
      pet: rowToPet(row)
    }));
  },

  findHighRiskStays(): (Stay & { pet: Pet })[] {
    const rows = db.prepare(`
      SELECT s.*,
             p.id as pet_id, p.name as pet_name, p.species as pet_species, p.breed as pet_breed,
             p.age as pet_age, p.weight as pet_weight, p.personality as pet_personality,
             p.sterilized as pet_sterilized, p.owner_name as pet_owner_name, p.owner_phone as pet_owner_phone,
             p.photo_url as pet_photo_url, p.medical_history as pet_medical_history,
             p.allergies as pet_allergies, p.special_requirements as pet_special_requirements,
             p.created_at as pet_created_at, p.updated_at as pet_updated_at
      FROM stays s
      INNER JOIN pets p ON s.pet_id = p.id
      WHERE s.status = 'checked-in' AND s.high_risk = 1
      ORDER BY s.created_at DESC
    `).all();
    
    return rows.map(row => ({
      ...rowToStay(row),
      pet: rowToPet(row)
    }));
  },

  create(stay: Omit<Stay, 'id' | 'createdAt'>): Stay {
    const stmt = db.prepare(`
      INSERT INTO stays 
        (pet_id, cage_id, check_in_date, check_out_date, actual_check_out, status,
         vaccination_verified, requires_isolation, high_risk, high_risk_reason,
         assigned_staff_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      stay.petId, stay.cageId, stay.checkInDate, stay.checkOutDate, stay.actualCheckOut,
      stay.status, stay.vaccinationVerified ? 1 : 0, stay.requiresIsolation ? 1 : 0,
      stay.highRisk ? 1 : 0, stay.highRiskReason, stay.assignedStaffId, stay.notes
    );
    return this.findById(result.lastInsertRowid as number) as unknown as Stay;
  },

  update(id: number, updates: Partial<Omit<Stay, 'id' | 'createdAt'>>): Stay | undefined {
    const fields = [];
    const values: any[] = [];
    
    if (updates.petId !== undefined) { fields.push('pet_id = ?'); values.push(updates.petId); }
    if (updates.cageId !== undefined) { fields.push('cage_id = ?'); values.push(updates.cageId); }
    if (updates.checkInDate !== undefined) { fields.push('check_in_date = ?'); values.push(updates.checkInDate); }
    if (updates.checkOutDate !== undefined) { fields.push('check_out_date = ?'); values.push(updates.checkOutDate); }
    if (updates.actualCheckOut !== undefined) { fields.push('actual_check_out = ?'); values.push(updates.actualCheckOut); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.vaccinationVerified !== undefined) { fields.push('vaccination_verified = ?'); values.push(updates.vaccinationVerified ? 1 : 0); }
    if (updates.requiresIsolation !== undefined) { fields.push('requires_isolation = ?'); values.push(updates.requiresIsolation ? 1 : 0); }
    if (updates.highRisk !== undefined) { fields.push('high_risk = ?'); values.push(updates.highRisk ? 1 : 0); }
    if (updates.highRiskReason !== undefined) { fields.push('high_risk_reason = ?'); values.push(updates.highRiskReason); }
    if (updates.assignedStaffId !== undefined) { fields.push('assigned_staff_id = ?'); values.push(updates.assignedStaffId); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
    
    if (fields.length === 0) return this.findById(id) as unknown as Stay;
    
    values.push(id);
    db.prepare(`UPDATE stays SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id) as unknown as Stay;
  },

  checkIn(id: number, cageId: number, assignedStaffId?: number): Stay | undefined {
    db.prepare(`
      UPDATE stays 
      SET status = 'checked-in', cage_id = ?, assigned_staff_id = ?
      WHERE id = ?
    `).run(cageId, assignedStaffId, id);
    return this.findById(id) as unknown as Stay;
  },

  checkOut(id: number, notes?: string): Stay | undefined {
    db.prepare(`
      UPDATE stays 
      SET status = 'checked-out', actual_check_out = DATE('now'), notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(notes, id);
    return this.findById(id) as unknown as Stay;
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM stays WHERE id = ?').run(id);
    return result.changes > 0;
  }
};
