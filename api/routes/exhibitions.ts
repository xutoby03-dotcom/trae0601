import { Router } from 'express'
import { db } from '../lib/db.js'
import type { Exhibition } from '../../shared/types.js'

const router = Router()

router.get('/', (_req, res) => {
  const list = db.prepare('SELECT * FROM exhibitions ORDER BY created_at DESC').all() as Exhibition[]
  const enriched = list.map(ex => {
    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM booths WHERE exhibition_id = ? AND type = 'booth') AS total,
        (SELECT COUNT(*) FROM booths WHERE exhibition_id = ? AND type = 'booth' AND status IN ('confirmed','applied','conflict')) AS occupied,
        (SELECT COUNT(*) FROM applications WHERE exhibition_id = ? AND status = 'pending') AS pending,
        (SELECT COUNT(*) FROM booths WHERE exhibition_id = ? AND type = 'booth' AND status = 'conflict') AS conflicts
    `).get(ex.id, ex.id, ex.id, ex.id) as any
    return { ...ex, ...stats }
  })
  res.json({ success: true, data: enriched })
})

router.get('/:id', (req, res) => {
  const ex = db.prepare('SELECT * FROM exhibitions WHERE id = ?').get(req.params.id) as Exhibition | undefined
  if (!ex) return res.status(404).json({ success: false, error: '展会不存在' })
  res.json({ success: true, data: ex })
})

router.post('/', (req, res) => {
  const { name, venue, start_date, end_date, booth_count, open_time, close_time, setup_rules, grid_rows = 5, grid_cols = 8 } = req.body
  if (!name || !venue || !start_date || !end_date || !open_time || !close_time) {
    return res.status(400).json({ success: false, error: '缺少必要字段' })
  }
  const info = db.prepare(
    `INSERT INTO exhibitions (name, venue, start_date, end_date, booth_count, open_time, close_time, setup_rules, status, grid_rows, grid_cols)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
  ).run(name, venue, start_date, end_date, booth_count || 0, open_time, close_time, setup_rules || '', grid_rows, grid_cols)

  const exId = info.lastInsertRowid as number
  const boothStmt = db.prepare(
    `INSERT INTO booths (exhibition_id, booth_number, row, col, type, zone, max_power_watts, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const tx = db.transaction(() => {
    let count = 0
    const midRow = Math.floor(grid_rows / 2)
    const midCol = Math.floor(grid_cols / 2)
    for (let r = 0; r < grid_rows; r++) {
      for (let c = 0; c < grid_cols; c++) {
        if (r === midRow && (c === midCol || c === Math.max(0, midCol - 1))) {
          boothStmt.run(
            exId,
            `通道-${r + 1}-${c + 1}`,
            r,
            c,
            'aisle',
            '通道',
            0,
            'available'
          )
          continue
        }
        const num = String.fromCharCode(65 + r) + (c + 1).toString().padStart(2, '0')
        const zone = num[0]
        boothStmt.run(
          exId,
          num,
          r,
          c,
          'booth',
          zone,
          2000,
          'available'
        )
        count++
      }
    }
    db.prepare('UPDATE exhibitions SET booth_count = ? WHERE id = ?').run(count, exId)
  })
  tx()
  res.json({ success: true, data: { id: exId } })
})

router.put('/:id', (req, res) => {
  const exId = Number(req.params.id)
  const existing = db.prepare('SELECT id FROM exhibitions WHERE id = ?').get(exId)
  if (!existing) return res.status(404).json({ success: false, error: '展会不存在' })
  const { name, venue, start_date, end_date, booth_count, open_time, close_time, setup_rules, status, grid_rows, grid_cols } = req.body
  db.prepare(
    `UPDATE exhibitions SET
       name = COALESCE(?, name),
       venue = COALESCE(?, venue),
       start_date = COALESCE(?, start_date),
       end_date = COALESCE(?, end_date),
       booth_count = COALESCE(?, booth_count),
       open_time = COALESCE(?, open_time),
       close_time = COALESCE(?, close_time),
       setup_rules = COALESCE(?, setup_rules),
       status = COALESCE(?, status),
       grid_rows = COALESCE(?, grid_rows),
       grid_cols = COALESCE(?, grid_cols)
     WHERE id = ?`
  ).run(name, venue, start_date, end_date, booth_count, open_time, close_time, setup_rules, status, grid_rows, grid_cols, exId)
  res.json({ success: true })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM exhibitions WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
