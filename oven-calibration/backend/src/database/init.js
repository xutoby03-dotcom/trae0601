const db = require('./index');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function createTables() {
  db.exec(`
    DROP TABLE IF EXISTS batches;
    DROP TABLE IF EXISTS recipes;
    DROP TABLE IF EXISTS calibration_records;
    DROP TABLE IF EXISTS ovens;
    DROP TABLE IF EXISTS employees;

    CREATE TABLE employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE ovens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT NOT NULL,
      serial_number TEXT NOT NULL UNIQUE,
      total_layers INTEGER NOT NULL,
      probe_position TEXT NOT NULL,
      common_temp_zone_low INTEGER NOT NULL,
      common_temp_zone_high INTEGER NOT NULL,
      employee_id INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      last_maintenance_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE calibration_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oven_id INTEGER NOT NULL,
      layer_number INTEGER NOT NULL,
      set_temp INTEGER NOT NULL,
      actual_temp INTEGER NOT NULL,
      top_heat INTEGER,
      bottom_heat INTEGER,
      preheat_minutes INTEGER,
      test_point TEXT,
      deviation INTEGER NOT NULL,
      temp_suggestion TEXT,
      employee_id INTEGER,
      calibrated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oven_id) REFERENCES ovens(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      recommended_oven_id INTEGER,
      recommended_layer INTEGER,
      temp_compensation INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recommended_oven_id) REFERENCES ovens(id)
    );

    CREATE TABLE batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      oven_id INTEGER NOT NULL,
      layer_used INTEGER NOT NULL,
      actual_temp INTEGER,
      result TEXT NOT NULL,
      failure_reason TEXT,
      photo_path TEXT,
      produced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id),
      FOREIGN KEY (oven_id) REFERENCES ovens(id)
    );
  `);
  console.log('✅ 数据表创建成功');
}

function generateTempSuggestion(deviation, topHeat, bottomHeat) {
  const suggestions = [];
  const absDeviation = Math.abs(deviation);

  if (topHeat !== undefined && bottomHeat !== null && topHeat !== null) {
    const topBottomDiff = topHeat - bottomHeat;
    if (Math.abs(topBottomDiff) > 10) {
      if (topBottomDiff > 0) {
        suggestions.push(`上火偏高${topBottomDiff}度，建议降低上火${topBottomDiff}度`);
      } else {
        suggestions.push(`下火偏高${Math.abs(topBottomDiff)}度，建议降低下火${Math.abs(topBottomDiff)}度`);
      }
    }
  }

  if (absDeviation > 10) {
    if (deviation < 0) {
      suggestions.push(`实际比设定低${absDeviation}度，建议设定温度增加${absDeviation}度`);
    } else {
      suggestions.push(`实际比设定高${absDeviation}度，建议设定温度降低${absDeviation}度`);
    }
  }

  if (suggestions.length === 0) {
    return '温度正常，无需调整';
  }

  return suggestions.join('；');
}

function insertSeedData() {
  const insertEmployee = db.prepare(`
    INSERT INTO employees (name, role, phone) VALUES (?, ?, ?)
  `);

  const employees = [
    ['张师傅', 'master', '13800138001'],
    ['李师傅', 'master', '13800138002'],
    ['王师傅', 'master', '13800138003'],
    ['陈学徒', 'apprentice', '13800138004'],
    ['刘学徒', 'apprentice', '13800138005'],
    ['赵店长', 'manager', '13800138006'],
  ];

  employees.forEach((emp) => insertEmployee.run(...emp));
  console.log('✅ 员工数据插入成功');

  const insertOven = db.prepare(`
    INSERT INTO ovens (model, serial_number, total_layers, probe_position, common_temp_zone_low, common_temp_zone_high, employee_id, status, last_maintenance_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const ovens = [
    ['三麦SEC-3Y', 'SEC3Y2024001', 3, 'middle', 160, 220, 1, 'active', '2026-05-15 10:00:00'],
    ['新麦SM2-704E', 'SM2704E2024002', 4, 'top', 170, 210, 2, 'active', '2026-04-20 14:30:00'],
    ['赛思达NFD-60', 'NFD602023003', 5, 'bottom', 160, 230, 3, 'maintenance', '2026-06-01 09:00:00'],
    ['俊麦JMC-3D', 'JMC3D2023004', 3, 'middle', 180, 220, 1, 'active', '2026-03-10 11:00:00'],
  ];

  ovens.forEach((oven) => insertOven.run(...oven));
  console.log('✅ 烤箱数据插入成功');

  const insertCalibration = db.prepare(`
    INSERT INTO calibration_records (oven_id, layer_number, set_temp, actual_temp, top_heat, bottom_heat, preheat_minutes, test_point, deviation, temp_suggestion, employee_id, calibrated_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const calibrationData = [
    [1, 1, 180, 175, 178, 172, 20, 'center', null, null, 1, '2026-06-10 08:00:00', '正常'],
    [1, 2, 180, 165, 168, 162, 20, 'center', null, null, 1, '2026-06-10 08:15:00', '温度偏低'],
    [1, 3, 180, 195, 200, 190, 20, 'center', null, null, 2, '2026-06-10 08:30:00', '上层温度偏高'],
    [2, 1, 200, 198, 200, 196, 25, 'center', null, null, 2, '2026-06-11 09:00:00', '正常'],
    [2, 2, 200, 185, 188, 182, 25, 'center', null, null, 2, '2026-06-11 09:20:00', '中层温度偏低'],
    [2, 3, 200, 210, 215, 205, 25, 'center', null, null, 3, '2026-06-11 09:40:00', '温度略高'],
    [2, 4, 200, 225, 230, 220, 25, 'center', null, null, 3, '2026-06-11 10:00:00', '顶层温度过高'],
    [3, 1, 170, 172, 175, 169, 30, 'center', null, null, 1, '2026-06-12 08:00:00', '正常'],
    [3, 2, 170, 158, 160, 156, 30, 'center', null, null, 1, '2026-06-12 08:20:00', '温度偏低需调整'],
    [3, 3, 170, 168, 170, 166, 30, 'center', null, null, 2, '2026-06-12 08:40:00', '正常'],
    [3, 4, 170, 185, 190, 180, 30, 'center', null, null, 2, '2026-06-12 09:00:00', '温度偏高'],
    [3, 5, 170, 200, 205, 195, 30, 'center', null, null, 3, '2026-06-12 09:20:00', '顶层温度过高'],
    [4, 1, 190, 192, 195, 189, 20, 'center', null, null, 3, '2026-06-13 10:00:00', '正常'],
    [4, 2, 190, 188, 190, 186, 20, 'center', null, null, 1, '2026-06-13 10:15:00', '正常'],
    [4, 3, 190, 175, 178, 172, 20, 'center', null, null, 1, '2026-06-13 10:30:00', '温度偏低'],
  ];

  calibrationData.forEach((record) => {
    const deviation = record[3] - record[2];
    const tempSuggestion = generateTempSuggestion(deviation, record[4], record[5]);
    record[8] = deviation;
    record[9] = tempSuggestion;
    insertCalibration.run(...record);
  });
  console.log('✅ 校准记录数据插入成功');

  const insertRecipe = db.prepare(`
    INSERT INTO recipes (name, recommended_oven_id, recommended_layer, temp_compensation, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const recipes = [
    ['蛋挞', 1, 2, -5, '葡式蛋挞，酥脆外皮，嫩滑蛋液'],
    ['葡挞', 1, 3, 5, '正宗葡式蛋挞，焦糖表面'],
    ['老婆饼', 2, 2, 0, '传统糕点，冬瓜蓉馅'],
    ['面包', 3, 4, 10, '软质吐司面包，中种法制作'],
    ['蛋糕', 4, 2, -10, '戚风蛋糕，松软细腻'],
    ['曲奇', 1, 1, 5, '黄油曲奇，酥松香脆'],
    ['蛋黄酥', 2, 3, 0, '传统糕点，咸蛋黄豆沙馅'],
    ['月饼', 3, 2, -5, '广式月饼，莲蓉蛋黄馅'],
  ];

  recipes.forEach((recipe) => insertRecipe.run(...recipe));
  console.log('✅ 配方数据插入成功');

  const insertBatch = db.prepare(`
    INSERT INTO batches (recipe_id, oven_id, layer_used, actual_temp, result, failure_reason, photo_path, produced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const batches = [
    [1, 1, 2, 175, 'success', null, null, '2026-06-10 08:00:00'],
    [1, 1, 2, 165, 'failed', '温度过低，蛋液未完全凝固', '/photos/batch_1_failed.jpg', '2026-06-10 10:00:00'],
    [2, 1, 3, 195, 'success', null, null, '2026-06-10 11:00:00'],
    [3, 2, 2, 198, 'success', null, null, '2026-06-11 08:00:00'],
    [4, 3, 4, 185, 'success', null, null, '2026-06-11 09:00:00'],
    [5, 4, 2, 180, 'success', null, null, '2026-06-11 10:00:00'],
    [6, 1, 1, 195, 'success', null, null, '2026-06-12 08:00:00'],
    [6, 1, 1, 175, 'failed', '温度过低，曲奇未上色', '/photos/batch_8_failed.jpg', '2026-06-12 09:30:00'],
    [7, 2, 3, 210, 'success', null, null, '2026-06-12 11:00:00'],
    [8, 3, 2, 158, 'failed', '温度过低，月饼皮未熟透', '/photos/batch_10_failed.jpg', '2026-06-13 08:00:00'],
    [1, 1, 2, 175, 'success', null, null, '2026-06-13 09:00:00'],
    [2, 1, 3, 195, 'success', null, null, '2026-06-13 10:00:00'],
    [3, 2, 2, 185, 'failed', '中层温度偏低，饼皮不够酥脆', '/photos/batch_13_failed.jpg', '2026-06-14 08:00:00'],
    [4, 3, 4, 200, 'success', null, null, '2026-06-14 09:00:00'],
    [5, 4, 2, 188, 'success', null, null, '2026-06-14 10:00:00'],
    [7, 2, 4, 225, 'failed', '顶层温度过高，表面烤焦', '/photos/batch_16_failed.jpg', '2026-06-15 08:00:00'],
    [8, 3, 2, 168, 'success', null, null, '2026-06-15 09:00:00'],
    [1, 1, 2, 175, 'success', null, null, '2026-06-15 10:00:00'],
    [4, 3, 5, 200, 'failed', '顶层温度过高，面包顶部烤焦', '/photos/batch_19_failed.jpg', '2026-06-16 08:00:00'],
    [5, 4, 2, 175, 'failed', '温度偏低，蛋糕未完全熟透', '/photos/batch_20_failed.jpg', '2026-06-16 09:00:00'],
  ];

  batches.forEach((batch) => insertBatch.run(...batch));
  console.log('✅ 批次记录数据插入成功');
}

function initDatabase() {
  console.log('🚀 开始初始化数据库...');
  createTables();
  insertSeedData();
  console.log('🎉 数据库初始化完成！');
}

initDatabase();
