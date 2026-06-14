import { db } from './index.js';
import { v4 as uuidv4 } from 'uuid';
import type { CostumeSize, TimeSlot } from '../../shared/types.js';

const sizes: CostumeSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const timeSlots: TimeSlot[] = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'];

function getPhotoUrl(size: string) {
  const prompts: Record<string, string> = {
    'XS': 'black%20graduation%20gown%20extra%20small%20size%20on%20hanger%20with%20cap%20and%20tassel',
    'S': 'black%20graduation%20gown%20small%20size%20on%20hanger%20with%20cap%20and%20tassel',
    'M': 'black%20graduation%20gown%20medium%20size%20on%20hanger%20with%20cap%20and%20tassel',
    'L': 'black%20graduation%20gown%20large%20size%20on%20hanger%20with%20cap%20and%20tassel',
    'XL': 'black%20graduation%20gown%20extra%20large%20size%20on%20hanger%20with%20cap%20and%20tassel',
    'XXL': 'black%20graduation%20gown%20double%20extra%20large%20size%20on%20hanger%20with%20cap%20and%20tassel'
  };
  const prompt = prompts[size] || prompts['M'];
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`;
}

export function seedData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM costumes').get() as { count: number };
  
  if (count.count > 0) {
    console.log('数据已存在，跳过初始化');
    return;
  }

  const insertCostume = db.prepare(`
    INSERT INTO costumes (id, type, size, color, accessories_json, status, cleaning_status, photo_url, rfid_tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertReservation = db.prepare(`
    INSERT INTO reservations (id, class_name, class_contact, contact_phone, shoot_date, time_slot, head_count, size_breakdown_json, teacher_in_charge, pickup_location, status, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLendingRecord = db.prepare(`
    INSERT INTO lending_records (id, reservation_id, lender_name, lend_date, expected_return_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLendingItem = db.prepare(`
    INSERT INTO lending_items (id, lending_record_id, costume_id, returned)
    VALUES (?, ?, ?, ?)
  `);

  const accessories = JSON.stringify({ hat: true, tassel: true, bowtie: true, shawl: true });

  for (const size of sizes) {
    for (let i = 1; i <= 10; i++) {
      const id = `c-${size.toLowerCase()}-${String(i).padStart(3, '0')}`;
      insertCostume.run(
        id,
        '学士服',
        size,
        '黑色',
        accessories,
        '在库',
        '干净',
        getPhotoUrl(size),
        `RFID-${size}-${String(i).padStart(3, '0')}`
      );
    }
  }

  const classNames = [
    '计算机科学2022级1班',
    '软件工程2022级2班',
    '人工智能2022级1班',
    '数据科学2022级1班',
    '网络安全2022级1班',
    '信息管理2022级1班'
  ];

  const contacts = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
  const phones = ['13800138001', '13800138002', '13800138003', '13800138004', '13800138005', '13800138006'];
  const teachers = ['李教授', '王教授', '张教授', '刘教授', '陈教授', '杨教授'];
  const locations = ['行政楼101室', '图书馆B201', '教学楼A301', '实验楼C102', '综合楼D205'];

  const today = new Date();
  const sizeBreakdownTemplate: Record<CostumeSize, number> = {
    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '均码': 0
  };

  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const sizeBreakdown = { ...sizeBreakdownTemplate };
    const headCount = 40 + Math.floor(Math.random() * 15);
    
    let remaining = headCount;
    for (const size of sizes) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, Math.floor(headCount * (0.1 + Math.random() * 0.2)));
      sizeBreakdown[size] = count;
      remaining -= count;
    }
    if (remaining > 0) {
      sizeBreakdown['M'] += remaining;
    }

    const status = i < 2 ? '已通过' : i < 4 ? '待审核' : i === 4 ? '已驳回' : '已取消';

    insertReservation.run(
      uuidv4(),
      classNames[i],
      contacts[i],
      phones[i],
      dateStr,
      timeSlots[i % 4],
      headCount,
      JSON.stringify(sizeBreakdown),
      teachers[i],
      locations[i % locations.length],
      status,
      status === '已驳回' ? '该时段已有其他班级预约' : null
    );
  }

  const approvedReservations = db.prepare("SELECT id FROM reservations WHERE status = '已通过'").all() as { id: string }[];
  
  if (approvedReservations.length > 0) {
    const reservationId = approvedReservations[0].id;
    const lendDate = new Date();
    const expectedReturn = new Date();
    expectedReturn.setDate(lendDate.getDate() + 3);

    const lendingId = uuidv4();
    insertLendingRecord.run(
      lendingId,
      reservationId,
      '张管理员',
      lendDate.toISOString(),
      expectedReturn.toISOString().split('T')[0]
    );

    const availableCostumes = db.prepare(
      "SELECT id FROM costumes WHERE status = '在库' LIMIT 5"
    ).all() as { id: string }[];

    for (const costume of availableCostumes) {
      insertLendingItem.run(
        uuidv4(),
        lendingId,
        costume.id,
        0
      );

      db.prepare("UPDATE costumes SET status = '借出中' WHERE id = ?").run(costume.id);
    }
  }

  console.log('数据初始化完成');
}

export default seedData;
