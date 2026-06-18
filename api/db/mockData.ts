import db from './database.js';
import bcrypt from 'bcryptjs';
import { formatDate, addDays, getToday } from '../utils/dateUtils.js';

const today = new Date();

function getDateStr(daysOffset: number): string {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  return formatDate(date);
}

function getDateTimeStr(daysOffset: number): string {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export function seedMockData() {
  const petCount = db.prepare('SELECT COUNT(*) as count FROM pets').get() as { count: number };
  if (petCount.count > 0) {
    console.log('Mock data already exists, skipping seed');
    return;
  }

  const passwordHash = bcrypt.hashSync('admin123', 10);

  const insertPet = db.prepare(`
    INSERT INTO pets (name, species, breed, age, weight, personality, sterilized, 
                      owner_name, owner_phone, photo_url, medical_history, allergies, special_requirements,
                      created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVaccine = db.prepare(`
    INSERT INTO vaccine_records (pet_id, type, name, vaccination_date, expiry_date, 
                                 certificate_url, status, verified, verified_by, verified_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertStay = db.prepare(`
    INSERT INTO stays (pet_id, cage_id, check_in_date, check_out_date, actual_check_out, status,
                       vaccination_verified, requires_isolation, high_risk, high_risk_reason,
                       assigned_staff_id, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDailyRecord = db.prepare(`
    INSERT INTO daily_records (stay_id, record_date, feeding, defecation, defecation_count,
                               mental_state, water_intake, exercise, abnormal, abnormal_description,
                               abnormal_photos, handling_measures, recorded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const pets = [
    { id: 1, name: '大黄', species: 'dog', breed: '金毛寻回犬', age: 3, weight: 28.5, personality: '温顺亲人，喜欢户外活动', sterilized: true, ownerName: '张三', ownerPhone: '13800010001', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20retriever%20dog%20portrait%20friendly&image_size=square', medicalHistory: '曾患轻微皮肤病，已治愈', allergies: '无', specialRequirements: '每天需要至少1小时户外活动' },
    { id: 2, name: '小黑', species: 'dog', breed: '拉布拉多', age: 5, weight: 32.0, personality: '活泼好动，服从性强', sterilized: true, ownerName: '李四', ownerPhone: '13800010002', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20labrador%20dog%20portrait%20playful&image_size=square', medicalHistory: '健康', allergies: '对某些鱼类过敏', specialRequirements: '食量较大，需控制饮食' },
    { id: 3, name: '豆豆', species: 'dog', breed: '泰迪', age: 2, weight: 5.2, personality: '粘人，喜欢撒娇', sterilized: false, ownerName: '王五', ownerPhone: '13800010003', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brown%20poodle%20dog%20cute%20portrait&image_size=square', medicalHistory: '健康', allergies: '无', specialRequirements: '需要定期美容' },
    { id: 4, name: '旺财', species: 'dog', breed: '哈士奇', age: 4, weight: 25.0, personality: '精力旺盛，有点调皮', sterilized: true, ownerName: '赵六', ownerPhone: '13800010004', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=husky%20dog%20blue%20eyes%20portrait&image_size=square', medicalHistory: '幼年曾患细小病毒，已康复', allergies: '无', specialRequirements: '需要大量运动，破坏力较强' },
    { id: 5, name: '咪咪', species: 'cat', breed: '英国短毛猫', age: 2, weight: 4.5, personality: '安静独立，喜欢晒太阳', sterilized: true, ownerName: '孙七', ownerPhone: '13800010005', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=british%20shorthair%20cat%20gray%20portrait&image_size=square', medicalHistory: '健康', allergies: '无', specialRequirements: '喜欢安静环境，怕陌生人' },
    { id: 6, name: '橘子', species: 'cat', breed: '橘猫', age: 3, weight: 6.8, personality: '贪吃，性格随和', sterilized: true, ownerName: '周八', ownerPhone: '13800010006', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20tabby%20cat%20chubby%20portrait&image_size=square', medicalHistory: '体重超标，需要控制饮食', allergies: '无', specialRequirements: '食量需严格控制，多运动' },
    { id: 7, name: '雪球', species: 'cat', breed: '布偶猫', age: 1, weight: 3.2, personality: '温柔粘人，喜欢被抱', sterilized: false, ownerName: '吴九', ownerPhone: '13800010007', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ragdoll%20cat%20white%20fluffy%20portrait&image_size=square', medicalHistory: '健康', allergies: '无', specialRequirements: '毛发需要每天梳理' },
    { id: 8, name: '煤球', species: 'cat', breed: '中华田园猫', age: 4, weight: 4.0, personality: '警惕性高，独立性强', sterilized: true, ownerName: '郑十', ownerPhone: '13800010008', photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20domestic%20cat%20yellow%20eyes%20portrait&image_size=square', medicalHistory: '曾患尿路感染，已治愈', allergies: '对某些猫粮过敏', specialRequirements: '需要处方粮，多饮水' }
  ];

  const now = getDateTimeStr(0);
  for (const pet of pets) {
    insertPet.run(
      pet.name, pet.species, pet.breed, pet.age, pet.weight, pet.personality,
      pet.sterilized ? 1 : 0, pet.ownerName, pet.ownerPhone, pet.photoUrl,
      pet.medicalHistory, pet.allergies, pet.specialRequirements, now, now
    );
  }

  const vaccines = [
    { petId: 1, type: 'rabies', name: '狂犬疫苗', vaccinationDate: getDateStr(-60), expiryDate: getDateStr(305), status: 'valid', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-55) },
    { petId: 1, type: 'dog-quad', name: '犬四联', vaccinationDate: getDateStr(-60), expiryDate: getDateStr(305), status: 'valid', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-55) },
    { petId: 1, type: 'deworming', name: '体内外驱虫', vaccinationDate: getDateStr(-30), expiryDate: getDateStr(60), status: 'valid', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-28) },

    { petId: 2, type: 'rabies', name: '狂犬疫苗', vaccinationDate: getDateStr(-350), expiryDate: getDateStr(15), status: 'expiring', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-345) },
    { petId: 2, type: 'dog-quad', name: '犬四联', vaccinationDate: getDateStr(-350), expiryDate: getDateStr(15), status: 'expiring', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-345) },
    { petId: 2, type: 'deworming', name: '体内外驱虫', vaccinationDate: getDateStr(-100), expiryDate: getDateStr(-10), status: 'expired', verified: false },

    { petId: 3, type: 'rabies', name: '狂犬疫苗', vaccinationDate: getDateStr(-200), expiryDate: getDateStr(165), status: 'valid', verified: true, verifiedBy: 2, verifiedAt: getDateTimeStr(-195) },
    { petId: 3, type: 'dog-quad', name: '犬四联', vaccinationDate: getDateStr(-200), expiryDate: getDateStr(165), status: 'valid', verified: true, verifiedBy: 2, verifiedAt: getDateTimeStr(-195) },

    { petId: 4, type: 'rabies', name: '狂犬疫苗', vaccinationDate: getDateStr(-400), expiryDate: getDateStr(-35), status: 'expired', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-395) },
    { petId: 4, type: 'dog-quad', name: '犬四联', vaccinationDate: getDateStr(-400), expiryDate: getDateStr(-35), status: 'expired', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-395) },
    { petId: 4, type: 'deworming', name: '体内外驱虫', vaccinationDate: getDateStr(-120), expiryDate: getDateStr(-30), status: 'expired', verified: false },

    { petId: 5, type: 'rabies', name: '狂犬疫苗', vaccinationDate: getDateStr(-100), expiryDate: getDateStr(265), status: 'valid', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-95) },
    { petId: 5, type: 'cat-triple', name: '猫三联', vaccinationDate: getDateStr(-100), expiryDate: getDateStr(265), status: 'valid', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-95) },
    { petId: 5, type: 'deworming', name: '体内外驱虫', vaccinationDate: getDateStr(-45), expiryDate: getDateStr(45), status: 'valid', verified: true, verifiedBy: 2, verifiedAt: getDateTimeStr(-43) },

    { petId: 6, type: 'rabies', name: '狂犬疫苗', vaccinationDate: getDateStr(-360), expiryDate: getDateStr(5), status: 'expiring', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-355) },
    { petId: 6, type: 'cat-triple', name: '猫三联', vaccinationDate: getDateStr(-360), expiryDate: getDateStr(5), status: 'expiring', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-355) },
    { petId: 6, type: 'deworming', name: '体内外驱虫', vaccinationDate: getDateStr(-80), expiryDate: getDateStr(10), status: 'expiring', verified: false },

    { petId: 7, type: 'rabies', name: '狂犬疫苗', vaccinationDate: getDateStr(-180), expiryDate: getDateStr(185), status: 'valid', verified: true, verifiedBy: 2, verifiedAt: getDateTimeStr(-175) },
    { petId: 7, type: 'cat-triple', name: '猫三联', vaccinationDate: getDateStr(-180), expiryDate: getDateStr(185), status: 'valid', verified: true, verifiedBy: 2, verifiedAt: getDateTimeStr(-175) },

    { petId: 8, type: 'rabies', name: '狂犬疫苗', vaccinationDate: getDateStr(-380), expiryDate: getDateStr(-15), status: 'expired', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-375) },
    { petId: 8, type: 'cat-triple', name: '猫三联', vaccinationDate: getDateStr(-380), expiryDate: getDateStr(-15), status: 'expired', verified: true, verifiedBy: 1, verifiedAt: getDateTimeStr(-375) }
  ];

  for (const vac of vaccines) {
    insertVaccine.run(
      vac.petId, vac.type, vac.name, vac.vaccinationDate, vac.expiryDate,
      null, vac.status, vac.verified ? 1 : 0, vac.verifiedBy, vac.verifiedAt, null
    );
  }

  const stays = [
    { petId: 1, cageId: 2, checkInDate: getDateStr(-3), checkOutDate: getDateStr(4), status: 'checked-in', vaccinationVerified: true, requiresIsolation: false, highRisk: false, assignedStaffId: 3, notes: '客户要求每天遛狗两次', createdAt: getDateTimeStr(-10) },
    { petId: 5, cageId: 5, checkInDate: getDateStr(-5), checkOutDate: getDateStr(2), status: 'checked-in', vaccinationVerified: true, requiresIsolation: false, highRisk: false, assignedStaffId: 3, notes: '需要安静环境', createdAt: getDateTimeStr(-12) },
    { petId: 6, cageId: 6, checkInDate: getDateStr(-1), checkOutDate: getDateStr(6), status: 'checked-in', vaccinationVerified: true, requiresIsolation: false, highRisk: true, highRiskReason: '体重超标，有糖尿病风险，需要监控饮食', assignedStaffId: 3, notes: '严格控制食量', createdAt: getDateTimeStr(-5) },
    { petId: 3, cageId: null, checkInDate: getDateStr(2), checkOutDate: getDateStr(7), status: 'confirmed', vaccinationVerified: true, requiresIsolation: false, highRisk: false, assignedStaffId: null, notes: '待安排笼位', createdAt: getDateTimeStr(-2) },
    { petId: 4, cageId: null, checkInDate: getDateStr(1), checkOutDate: getDateStr(5), status: 'pending', vaccinationVerified: false, requiresIsolation: true, highRisk: true, highRiskReason: '疫苗全部过期，需隔离观察', assignedStaffId: null, notes: '待核验疫苗', createdAt: getDateTimeStr(-1) }
  ];

  for (const stay of stays) {
    const result = insertStay.run(
      stay.petId, stay.cageId, stay.checkInDate, stay.checkOutDate, null, stay.status,
      stay.vaccinationVerified ? 1 : 0, stay.requiresIsolation ? 1 : 0, stay.highRisk ? 1 : 0,
      stay.highRiskReason, stay.assignedStaffId, stay.notes, stay.createdAt
    );
    const stayId = result.lastInsertRowid as number;

    if (stay.cageId) {
      db.prepare('UPDATE cages SET status = ?, current_stay_id = ? WHERE id = ?').run('occupied', stayId, stay.cageId);
    }

    if (stay.status === 'checked-in') {
      const daysStayed = Math.abs(parseInt(stay.checkInDate.split('-')[2]) - parseInt(getToday().split('-')[2]));
      for (let i = 0; i <= daysStayed; i++) {
        const recordDate = getDateStr(-daysStayed + i);
        const feedings = ['早晚各一次狗粮，每次150g', '早餐皇家狗粮100g，晚餐150g', '定时定量喂养，早晚各一次'];
        const mentalStates: ('excellent' | 'good' | 'fair' | 'poor')[] = ['excellent', 'good', 'good', 'excellent', 'fair'];
        const defecations: ('normal' | 'soft' | 'diarrhea' | 'constipation' | 'none')[] = ['normal', 'normal', 'normal', 'soft', 'normal'];

        insertDailyRecord.run(
          stayId, recordDate,
          feedings[i % feedings.length],
          defecations[i % defecations.length],
          Math.floor(Math.random() * 3) + 1,
          mentalStates[i % mentalStates.length],
          '饮水正常',
          i % 2 === 0 ? '户外活动30分钟' : '室内玩耍',
          0, null, null, null,
          3,
          getDateTimeStr(-daysStayed + i)
        );
      }
    }
  }

  console.log('Mock data seeded successfully');
  console.log(`- Created ${pets.length} pets (4 dogs, 4 cats)`);
  console.log(`- Created ${vaccines.length} vaccine records`);
  console.log(`- Created ${stays.length} stays with daily records`);
}
