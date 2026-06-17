const db = require('./src/database');


console.log('=== 员工数据 ===');
console.log(db.prepare('SELECT * FROM employees').all());

console.log('\n=== 烤箱数据 ===');
console.log(db.prepare('SELECT id, model, total_layers, status FROM ovens').all());

console.log('\n=== 校准记录（前5条） ===');
console.log(db.prepare('SELECT id, oven_id, layer_number, set_temp, actual_temp, deviation, temp_suggestion FROM calibration_records LIMIT 5').all());

console.log('\n=== 配方数据 ===');
console.log(db.prepare('SELECT id, name, recommended_oven_id, temp_compensation FROM recipes').all());

console.log('\n=== 批次记录统计 ===');
console.log('成功批次:', db.prepare("SELECT COUNT(*) as count FROM batches WHERE result = 'success'").get().count);
console.log('失败批次:', db.prepare("SELECT COUNT(*) as count FROM batches WHERE result = 'failed'").get().count);

console.log('\n=== 偏差超过±10度的校准记录 ===');
const overThreshold = db.prepare('SELECT oven_id, layer_number, set_temp, actual_temp, deviation, temp_suggestion FROM calibration_records WHERE ABS(deviation) > 10').all();
console.log('数量:', overThreshold.length);
overThreshold.forEach(r => console.log(r));

db.close();
