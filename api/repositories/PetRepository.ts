import db from '../db/database.js';
import { Pet } from '../../shared/types.js';

function rowToPet(row: any): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    age: row.age,
    weight: row.weight,
    personality: row.personality || '',
    sterilized: row.sterilized === 1,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    photoUrl: row.photo_url,
    medicalHistory: row.medical_history,
    allergies: row.allergies,
    specialRequirements: row.special_requirements,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const PetRepository = {
  findAll(page: number = 1, pageSize: number = 20, keyword?: string, species?: string): { data: Pet[], total: number } {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (keyword) {
      whereClause += ' AND (name LIKE ? OR owner_name LIKE ? OR owner_phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (species && species !== 'all') {
      whereClause += ' AND species = ?';
      params.push(species);
    }
    
    const totalRow = db.prepare(`SELECT COUNT(*) as count FROM pets ${whereClause}`).get(...params) as { count: number };
    
    const offset = (page - 1) * pageSize;
    const rows = db.prepare(`
      SELECT * FROM pets ${whereClause}
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, pageSize, offset);
    
    return {
      data: rows.map(rowToPet),
      total: totalRow.count
    };
  },

  findById(id: number): Pet | undefined {
    const row = db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
    return row ? rowToPet(row) : undefined;
  },

  create(pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Pet {
    const stmt = db.prepare(`
      INSERT INTO pets (name, species, breed, age, weight, personality, sterilized, 
                        owner_name, owner_phone, photo_url, medical_history, allergies, special_requirements)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      pet.name, pet.species, pet.breed, pet.age, pet.weight, pet.personality,
      pet.sterilized ? 1 : 0, pet.ownerName, pet.ownerPhone, pet.photoUrl,
      pet.medicalHistory, pet.allergies, pet.specialRequirements
    );
    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, updates: Partial<Omit<Pet, 'id' | 'createdAt'>>): Pet | undefined {
    const fields = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.species !== undefined) { fields.push('species = ?'); values.push(updates.species); }
    if (updates.breed !== undefined) { fields.push('breed = ?'); values.push(updates.breed); }
    if (updates.age !== undefined) { fields.push('age = ?'); values.push(updates.age); }
    if (updates.weight !== undefined) { fields.push('weight = ?'); values.push(updates.weight); }
    if (updates.personality !== undefined) { fields.push('personality = ?'); values.push(updates.personality); }
    if (updates.sterilized !== undefined) { fields.push('sterilized = ?'); values.push(updates.sterilized ? 1 : 0); }
    if (updates.ownerName !== undefined) { fields.push('owner_name = ?'); values.push(updates.ownerName); }
    if (updates.ownerPhone !== undefined) { fields.push('owner_phone = ?'); values.push(updates.ownerPhone); }
    if (updates.photoUrl !== undefined) { fields.push('photo_url = ?'); values.push(updates.photoUrl); }
    if (updates.medicalHistory !== undefined) { fields.push('medical_history = ?'); values.push(updates.medicalHistory); }
    if (updates.allergies !== undefined) { fields.push('allergies = ?'); values.push(updates.allergies); }
    if (updates.specialRequirements !== undefined) { fields.push('special_requirements = ?'); values.push(updates.specialRequirements); }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.prepare(`UPDATE pets SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM pets WHERE id = ?').run(id);
    return result.changes > 0;
  },

  search(keyword: string): Pet[] {
    const rows = db.prepare(`
      SELECT * FROM pets 
      WHERE name LIKE ? OR owner_name LIKE ? OR owner_phone LIKE ?
      ORDER BY updated_at DESC
      LIMIT 20
    `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    return rows.map(rowToPet);
  }
};
