CREATE TABLE printers (
    id TEXT PRIMARY KEY,
    location TEXT NOT NULL,
    printer_model TEXT NOT NULL,
    paper_spec TEXT NOT NULL,
    min_stock INTEGER NOT NULL DEFAULT 10,
    current_stock INTEGER NOT NULL DEFAULT 0,
    manager TEXT NOT NULL,
    manager_phone TEXT,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consumptions (
    id TEXT PRIMARY KEY,
    printer_id TEXT NOT NULL,
    department TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    receiver TEXT NOT NULL,
    is_abnormal BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (printer_id) REFERENCES printers(id)
);

CREATE TABLE replenishments (
    id TEXT PRIMARY KEY,
    printer_id TEXT NOT NULL,
    supplier TEXT NOT NULL,
    box_count INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (printer_id) REFERENCES printers(id)
);

CREATE TABLE alerts (
    id TEXT PRIMARY KEY,
    printer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (printer_id) REFERENCES printers(id)
);

CREATE INDEX idx_consumptions_printer_id ON consumptions(printer_id);
CREATE INDEX idx_consumptions_created_at ON consumptions(created_at);
CREATE INDEX idx_replenishments_printer_id ON replenishments(printer_id);
CREATE INDEX idx_alerts_printer_id ON alerts(printer_id);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved);

INSERT INTO printers (id, location, printer_model, paper_spec, min_stock, current_stock, manager, manager_phone) VALUES
('p1', '1楼前台大厅', 'HP LaserJet Pro M404dn', 'A4/70g', 10, 25, '张三', '13800138001'),
('p2', '2楼研发部', 'Canon imageCLASS LBP312x', 'A4/80g', 15, 8, '李四', '13800138002'),
('p3', '3楼财务部', 'Epson WorkForce AL-M310DN', 'A4/70g', 10, 5, '王五', '13800138003'),
('p4', '5楼会议室', 'Brother HL-L6200DW', 'A4/70g', 20, 12, '赵六', '13800138004');

INSERT INTO consumptions (id, printer_id, department, quantity, purpose, receiver) VALUES
('c1', 'p1', '行政部', 2, '日常办公打印', '张小明'),
('c2', 'p2', '研发部', 5, '项目文档打印', '李华'),
('c3', 'p3', '财务部', 3, '财务报表打印', '王芳'),
('c4', 'p1', '销售部', 4, '客户合同打印', '刘强'),
('c5', 'p4', '行政部', 8, '会议资料打印', '赵敏'),
('c6', 'p2', '研发部', 3, '技术方案打印', '陈明'),
('c7', 'p1', '人事部', 2, '员工手册打印', '刘红'),
('c8', 'p3', '财务部', 6, '年度审计报告', '王芳'),
('c9', 'p4', '市场部', 10, '产品宣传册打印', '杨丽'),
('c10', 'p2', '研发部', 4, '代码评审文档', '张伟');

INSERT INTO replenishments (id, printer_id, supplier, box_count, unit_price, total_amount) VALUES
('r1', 'p1', '亚太纸业', 5, 120.00, 600.00),
('r2', 'p2', '得力办公', 3, 135.00, 405.00),
('r3', 'p3', '亚太纸业', 2, 120.00, 240.00),
('r4', 'p4', '晨光文具', 4, 118.00, 472.00);

INSERT INTO alerts (id, printer_id, type, level, message) VALUES
('a1', 'p2', 'low_stock', 'warning', '2楼研发部打印机库存低于安全库存'),
('a2', 'p3', 'low_stock', 'danger', '3楼财务部打印机库存严重不足');
