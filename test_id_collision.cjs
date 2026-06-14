const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'graduation.db');
const db = new Database(dbPath, { readonly: true });

const rows = db.prepare(`
  SELECT lr.id as lr_id, r.id as r_id, lr.*, r.*
  FROM lending_records lr
  LEFT JOIN reservations r ON lr.reservation_id = r.id
  LIMIT 1
`).get();

console.log('字段 id:', rows.id);
console.log('lr_id (显式):', rows.lr_id);
console.log('r_id (显式):', rows.r_id);
console.log('lender_name:', rows.lender_name);
console.log('class_name:', rows.class_name);

db.close();
