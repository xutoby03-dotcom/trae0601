import db from '../db/database.js';
import { DailyRecord, Stay, Pet } from '../../shared/types.js';

function rowToDailyRecord(row: any): DailyRecord {
  return {
    id: row.id,
    stayId: row.stay_id,
    recordDate: row.record_date,
    feeding: row.feeding,
    defecation: row.defecation,
    defecationCount: row.defecation_count,
    mentalState: row.mental_state,
    waterIntake: row.water_intake,
    exercise: row.exercise,
    abnormal: row.abnormal === 1,
    abnormalDescription: row.abnormal_description,
    abnormalPhotos: row.abnormal_photos ? JSON.parse(row.abnormal_photos) : undefined,
    handlingMeasures: row.handling_measures,
    recordedBy: row.recorded_by,
    createdAt: row.created_at
  };
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

function rowToStay(row: any): Stay {
  return {
    id: row.stay_id,
    petId: row.stay_pet_id,
    cageId: row.stay_cage_id,
    checkInDate: row.stay_check_in_date,
    checkOutDate: row.stay_check_out_date,
    actualCheckOut: row.stay_actual_check_out,
    status: row.stay_status,
    vaccinationVerified: row.stay_vaccination_verified === 1,
    requiresIsolation: row.stay_requires_isolation === 1,
    highRisk: row.stay_high_risk === 1,
    highRiskReason: row.stay_high_risk_reason,
    assignedStaffId: row.stay_assigned_staff_id,
    notes: row.stay_notes,
    createdAt: row.stay_created_at
  };
}

export interface TodayRecordItem {
  stay: Stay;
  pet: Pet;
  hasRecord: boolean;
  latestRecord?: DailyRecord;
}

export const DailyRecordRepository = {
  findByStayId(stayId: number): DailyRecord[] {
    const rows = db.prepare(`
      SELECT * FROM daily_records 
      WHERE stay_id = ? 
      ORDER BY record_date DESC, created_at DESC
    `).all(stayId);
    return rows.map(rowToDailyRecord);
  },

  findById(id: number): DailyRecord | undefined {
    const row = db.prepare('SELECT * FROM daily_records WHERE id = ?').get(id);
    return row ? rowToDailyRecord(row) : undefined;
  },

  findTodayRecords(): TodayRecordItem[] {
    const rows = db.prepare(`
      SELECT s.id as stay_id, s.pet_id as stay_pet_id, s.cage_id as stay_cage_id,
             s.check_in_date as stay_check_in_date, s.check_out_date as stay_check_out_date,
             s.actual_check_out as stay_actual_check_out, s.status as stay_status,
             s.vaccination_verified as stay_vaccination_verified,
             s.requires_isolation as stay_requires_isolation,
             s.high_risk as stay_high_risk, s.high_risk_reason as stay_high_risk_reason,
             s.assigned_staff_id as stay_assigned_staff_id, s.notes as stay_notes,
             s.created_at as stay_created_at,
             p.id as pet_id, p.name as pet_name, p.species as pet_species, p.breed as pet_breed,
             p.age as pet_age, p.weight as pet_weight, p.personality as pet_personality,
             p.sterilized as pet_sterilized, p.owner_name as pet_owner_name, p.owner_phone as pet_owner_phone,
             p.photo_url as pet_photo_url, p.medical_history as pet_medical_history,
             p.allergies as pet_allergies, p.special_requirements as pet_special_requirements,
             p.created_at as pet_created_at, p.updated_at as pet_updated_at,
             dr.id as record_id, dr.record_date, dr.feeding, dr.defecation,
             dr.defecation_count, dr.mental_state, dr.water_intake, dr.exercise,
             dr.abnormal, dr.abnormal_description, dr.abnormal_photos,
             dr.handling_measures, dr.recorded_by, dr.created_at as record_created_at
      FROM stays s
      INNER JOIN pets p ON s.pet_id = p.id
      LEFT JOIN daily_records dr ON s.id = dr.stay_id AND DATE(dr.record_date) = DATE('now')
      WHERE s.status = 'checked-in'
      ORDER BY s.high_risk DESC, s.created_at ASC
    `).all();
    
    const items = new Map<number, TodayRecordItem>();
    
    for (const row of rows as any[]) {
      const stayId = row.stay_id;
      if (!items.has(stayId)) {
        items.set(stayId, {
          stay: rowToStay(row),
          pet: rowToPet(row),
          hasRecord: !!row.record_id,
          latestRecord: row.record_id ? rowToDailyRecord({
            ...row,
            id: row.record_id,
            created_at: row.record_created_at
          }) : undefined
        });
      }
    }
    
    return Array.from(items.values());
  },

  findByStayAndDate(stayId: number, date: string): DailyRecord | undefined {
    const row = db.prepare(`
      SELECT * FROM daily_records 
      WHERE stay_id = ? AND DATE(record_date) = DATE(?)
      ORDER BY created_at DESC
      LIMIT 1
    `).get(stayId, date);
    return row ? rowToDailyRecord(row) : undefined;
  },

  hasRecordToday(stayId: number): boolean {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM daily_records 
      WHERE stay_id = ? AND DATE(record_date) = DATE('now')
    `).get(stayId) as { count: number };
    return row.count > 0;
  },

  create(record: Omit<DailyRecord, 'id' | 'createdAt'>): DailyRecord {
    const stmt = db.prepare(`
      INSERT INTO daily_records 
        (stay_id, record_date, feeding, defecation, defecation_count, mental_state,
         water_intake, exercise, abnormal, abnormal_description, abnormal_photos,
         handling_measures, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      record.stayId, record.recordDate, record.feeding, record.defecation,
      record.defecationCount, record.mentalState, record.waterIntake, record.exercise,
      record.abnormal ? 1 : 0, record.abnormalDescription,
      record.abnormalPhotos ? JSON.stringify(record.abnormalPhotos) : null,
      record.handlingMeasures, record.recordedBy
    );
    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, updates: Partial<Omit<DailyRecord, 'id' | 'stayId' | 'createdAt'>>): DailyRecord | undefined {
    const fields = [];
    const values: any[] = [];
    
    if (updates.recordDate !== undefined) { fields.push('record_date = ?'); values.push(updates.recordDate); }
    if (updates.feeding !== undefined) { fields.push('feeding = ?'); values.push(updates.feeding); }
    if (updates.defecation !== undefined) { fields.push('defecation = ?'); values.push(updates.defecation); }
    if (updates.defecationCount !== undefined) { fields.push('defecation_count = ?'); values.push(updates.defecationCount); }
    if (updates.mentalState !== undefined) { fields.push('mental_state = ?'); values.push(updates.mentalState); }
    if (updates.waterIntake !== undefined) { fields.push('water_intake = ?'); values.push(updates.waterIntake); }
    if (updates.exercise !== undefined) { fields.push('exercise = ?'); values.push(updates.exercise); }
    if (updates.abnormal !== undefined) { fields.push('abnormal = ?'); values.push(updates.abnormal ? 1 : 0); }
    if (updates.abnormalDescription !== undefined) { fields.push('abnormal_description = ?'); values.push(updates.abnormalDescription); }
    if (updates.abnormalPhotos !== undefined) { 
      fields.push('abnormal_photos = ?'); 
      values.push(updates.abnormalPhotos ? JSON.stringify(updates.abnormalPhotos) : null); 
    }
    if (updates.handlingMeasures !== undefined) { fields.push('handling_measures = ?'); values.push(updates.handlingMeasures); }
    if (updates.recordedBy !== undefined) { fields.push('recorded_by = ?'); values.push(updates.recordedBy); }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    db.prepare(`UPDATE daily_records SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM daily_records WHERE id = ?').run(id);
    return result.changes > 0;
  },

  getAbnormalCountToday(): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM daily_records 
      WHERE DATE(record_date) = DATE('now') AND abnormal = 1
    `).get() as { count: number };
    return row.count;
  }
};
