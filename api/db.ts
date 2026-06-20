import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'snack.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL,
      department_id INTEGER NOT NULL,
      avatar VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      spec VARCHAR(50),
      flavor VARCHAR(50),
      cost_price DECIMAL(10,2) NOT NULL,
      sale_price DECIMAL(10,2) NOT NULL,
      expiry_date DATE,
      shelf_position VARCHAR(50),
      photo VARCHAR(255),
      stock INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      barcode VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_expiry ON products(expiry_date);

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      bill_id INTEGER,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (bill_id) REFERENCES bills(id)
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_employee ON transactions(employee_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
    CREATE INDEX IF NOT EXISTS idx_transactions_bill ON transactions(bill_id);

    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      month VARCHAR(7) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      unpaid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_bills_employee_month ON bills(employee_id, month);
    CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
  `);

  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get() as { count: number };
  if (deptCount.count === 0) {
    seedData();
  }

  checkAndUpdateExpiredProducts();
}

function seedData() {
  const insertDept = db.prepare('INSERT INTO departments (name) VALUES (?)');
  const departments = ['技术部', '产品部', '设计部', '市场部', '行政部'];
  departments.forEach(name => insertDept.run(name));

  const insertEmp = db.prepare('INSERT INTO employees (name, department_id) VALUES (?, ?)');
  const employees = [
    ['张三', 1], ['李四', 1], ['王五', 2], ['赵六', 2],
    ['钱七', 3], ['孙八', 4], ['周九', 5], ['吴十', 1]
  ];
  employees.forEach(([name, deptId]) => insertEmp.run(name, deptId));

  const insertProd = db.prepare(`
    INSERT INTO products (name, spec, flavor, cost_price, sale_price, expiry_date, shelf_position, photo, stock, barcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const products = [
    ['乐事薯片', '75g', '原味', 5.5, 8.0, '2026-12-31', 'A1-01', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lays%20potato%20chips%20original%20flavor%2075g%20package&image_size=square', 20, '6924743915701'],
    ['乐事薯片', '75g', '番茄味', 5.5, 8.0, '2026-11-15', 'A1-02', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lays%20potato%20chips%20tomato%20flavor%2075g%20red%20package&image_size=square', 15, '6924743915702'],
    ['乐事薯片', '75g', '黄瓜味', 5.5, 8.0, '2026-10-20', 'A1-03', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lays%20potato%20chips%20cucumber%20flavor%2075g%20green%20package&image_size=square', 3, '6924743915703'],
    ['奥利奥饼干', '116g', '原味', 6.0, 9.9, '2027-01-10', 'A2-01', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Oreo%20cookies%20original%20flavor%20116g%20blue%20package&image_size=square', 25, '6901668002471'],
    ['奥利奥饼干', '116g', '巧克力味', 6.0, 9.9, '2026-09-05', 'A2-02', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Oreo%20cookies%20chocolate%20flavor%20116g%20brown%20package&image_size=square', 8, '6901668002472'],
    ['怡宝矿泉水', '555ml', '原味', 1.0, 2.0, '2027-06-01', 'B1-01', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=C%27est%20bon%20mineral%20water%20555ml%20bottle&image_size=square', 50, '6901285991219'],
    ['旺仔牛奶', '245ml', '原味', 3.5, 5.0, '2026-08-15', 'B1-02', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Wangzai%20milk%20245ml%20red%20can&image_size=square', 4, '6920459950581'],
    ['士力架', '51g', '花生夹心', 3.0, 5.5, '2026-07-01', 'A3-01', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Snickers%20chocolate%20bar%2051g%20peanut%20filling&image_size=square', 2, '6923018811515'],
    ['可口可乐', '330ml', '原味', 1.8, 3.5, '2026-12-01', 'B2-01', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Coca%20Cola%20330ml%20red%20can&image_size=square', 30, '5000112637939'],
    ['三只松鼠坚果', '175g', '每日坚果', 15.0, 22.0, '2026-11-20', 'A4-01', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Three%20Squirrels%20mixed%20nuts%20175g%20package&image_size=square', 12, '6956511234567'],
  ];
  products.forEach(p => insertProd.run(...p));

  const insertTrans = db.prepare(`
    INSERT INTO transactions (product_id, employee_id, department_id, quantity, unit_price, total_amount, payment_type, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const transactions = [
    [1, 1, 1, 2, 8.0, 16.0, 'monthly', 'pending'],
    [2, 2, 1, 1, 8.0, 8.0, 'monthly', 'pending'],
    [4, 3, 2, 3, 9.9, 29.7, 'monthly', 'pending'],
    [6, 4, 2, 5, 2.0, 10.0, 'instant', 'paid'],
    [9, 5, 3, 2, 3.5, 7.0, 'monthly', 'pending'],
    [1, 6, 4, 1, 8.0, 8.0, 'monthly', 'pending'],
    [10, 7, 5, 1, 22.0, 22.0, 'instant', 'paid'],
    [3, 8, 1, 2, 8.0, 16.0, 'monthly', 'pending'],
    [5, 1, 1, 1, 9.9, 9.9, 'monthly', 'pending'],
    [7, 2, 1, 3, 5.0, 15.0, 'monthly', 'pending'],
  ];
  transactions.forEach(t => insertTrans.run(...t));
}

function checkAndUpdateExpiredProducts() {
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    UPDATE products 
    SET status = 'expired' 
    WHERE expiry_date < ? AND status = 'active'
  `).run(today);
}

export { db, initDatabase, checkAndUpdateExpiredProducts };
