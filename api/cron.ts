import cron from 'node-cron';
import { getDb } from './db/index.js';
import { v4 as uuidv4 } from 'uuid';

export function startCronJobs(): void {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] 执行每日逾期检查任务');
    checkOverdue();
    checkLongTermOverdue();
  });

  console.log('[Cron] 定时任务已启动');
}

function checkOverdue(): void {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const updateStmt = db.prepare(`
    UPDATE borrow_records
    SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'borrowed'
    AND expected_return_date < ?
  `);

  const result = updateStmt.run(today);
  console.log(`[Cron] 已将 ${result.changes} 条借用记录标记为逾期`);
}

function checkLongTermOverdue(): void {
  const db = getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

  const overdueRecords = db.prepare(`
    SELECT br.id, br.mold_id, br.master_id, m.name as mold_name, ma.name as master_name
    FROM borrow_records br
    JOIN molds m ON br.mold_id = m.id
    JOIN masters ma ON br.master_id = ma.id
    WHERE br.status = 'overdue'
    AND br.expected_return_date < ?
    AND br.id NOT IN (
      SELECT borrow_record_id FROM exception_records
      WHERE type = 'long_term_overdue' AND status != 'resolved'
    )
  `).all(dateStr) as Array<{
    id: string;
    mold_id: string;
    master_id: string;
    mold_name: string;
    master_name: string;
  }>;

  const insertException = db.prepare(`
    INSERT INTO exception_records (id, mold_id, borrow_record_id, type, description, status)
    VALUES (?, ?, ?, 'long_term_overdue', ?, 'pending')
  `);

  const updateBorrow = db.prepare(`
    UPDATE borrow_records SET status = 'exception', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);

  const updateMold = db.prepare(`
    UPDATE molds SET status = 'maintenance', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);

  for (const record of overdueRecords) {
    const exceptionId = uuidv4();
    const description = `模具[${record.mold_name}]已逾期超过30天，借用人：${record.master_name}`;

    const transaction = db.transaction(() => {
      insertException.run(exceptionId, record.mold_id, record.id, description);
      updateBorrow.run(record.id);
      updateMold.run(record.mold_id);
    });

    try {
      transaction();
      console.log(`[Cron] 为长期未还模具 ${record.mold_name} 创建异常记录`);
    } catch (e) {
      console.error(`[Cron] 创建异常记录失败: ${e}`);
    }
  }
}
