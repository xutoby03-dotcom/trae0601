const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'graduation.db');
console.log('数据库路径:', dbPath);

try {
  const db = new Database(dbPath, { readonly: true });
  
  console.log('\n=== damage_records 表内容 ===');
  const dr = db.prepare('SELECT * FROM damage_records').all();
  console.log(`共 ${dr.length} 条：`);
  dr.forEach((r, i) => {
    console.log(`\n${i+1}. ID: ${r.id}`);
    console.log(`   costume_id: ${r.costume_id}`);
    console.log(`   lending_record_id: ${r.lending_record_id}`);
    console.log(`   missing_accessories_json: ${r.missing_accessories_json}`);
    console.log(`   has_stain: ${r.has_stain}`);
    console.log(`   damage_description: ${r.damage_description}`);
  });

  console.log('\n=== lending_records 表（最新） ===');
  const lr = db.prepare('SELECT id, lender_name, lend_date FROM lending_records ORDER BY lend_date DESC').all();
  console.log(`共 ${lr.length} 条：`);
  lr.forEach((r, i) => {
    console.log(`${i+1}. ID: ${r.id}  | ${r.lender_name} | ${r.lend_date}`);
  });

  console.log('\n=== lending_items 第2条借出记录 ===');
  const li = db.prepare(`
    SELECT li.*, c.type, c.size
    FROM lending_items li
    LEFT JOIN costumes c ON li.costume_id = c.id
    WHERE li.lending_record_id = ?
  `).all('a07bd509-6361-42b2-afd0-cb9e47228101');
  console.log(`共 ${li.length} 件：`);
  li.forEach((r, i) => {
    console.log(`${i+1}. ${r.type} - ${r.size} #${r.costume_id}`);
    console.log(`   returned: ${r.returned}`);
    console.log(`   accessory_check_json: ${r.accessory_check_json}`);
    console.log(`   has_stain: ${r.has_stain}`);
    console.log(`   damage_note: ${r.damage_note}`);
  });
  
  db.close();
} catch (e) {
  console.error('错误:', e.message);
}
