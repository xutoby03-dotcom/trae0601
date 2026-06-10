import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

router.get('/exhibitions/:id/setup', (req, res) => {
  const exId = Number(req.params.id)
  const rows = db.prepare(`
    SELECT sr.*,
           a.vendor_name, a.brand, a.product_type, a.status AS app_status,
           b.booth_number AS current_booth,
           (SELECT booth_number FROM booths WHERE id = sr.swap_to_booth_id) AS swapped_booth
    FROM setup_records sr
    JOIN applications a ON a.id = sr.application_id
    JOIN booths b ON b.id = sr.booth_id
    WHERE a.exhibition_id = ?
    ORDER BY sr.id
  `).all(exId)
  const remaining = db.prepare(`
    SELECT a.id AS application_id, a.vendor_name, a.brand, a.product_type, a.status AS app_status,
           b.id AS booth_id, b.booth_number AS current_booth
    FROM applications a
    JOIN booths b ON b.id = a.booth_id
    WHERE a.exhibition_id = ? AND a.status = 'approved'
      AND a.id NOT IN (SELECT application_id FROM setup_records)
  `).all(exId)
  res.json({ success: true, data: { checked_in: rows, pending: remaining } })
})

router.post('/setup/checkin', (req, res) => {
  const { application_id, booth_id, check_in_time, is_late = 0 } = req.body
  if (!application_id || !booth_id) return res.status(400).json({ success: false, error: '缺少必要字段' })
  const existing = db.prepare(`SELECT id FROM setup_records WHERE application_id = ?`).get(application_id) as any
  const time = check_in_time || new Date().toISOString()
  if (existing) {
    db.prepare(`UPDATE setup_records SET check_in_time = ?, is_late = ?, booth_id = ? WHERE application_id = ?`)
      .run(time, is_late ? 1 : 0, booth_id, application_id)
  } else {
    db.prepare(`INSERT INTO setup_records (application_id, booth_id, check_in_time, is_late) VALUES (?, ?, ?, ?)`)
      .run(application_id, booth_id, time, is_late ? 1 : 0)
  }
  res.json({ success: true })
})

router.post('/setup/swap', (req, res) => {
  const { from_application_id, to_booth_id, reason } = req.body
  if (!from_application_id || !to_booth_id) return res.status(400).json({ success: false, error: '缺少必要字段' })
  const app = db.prepare(`SELECT booth_id FROM applications WHERE id = ?`).get(from_application_id) as any
  if (!app) return res.status(404).json({ success: false, error: '申请不存在' })

  const tx = db.transaction(() => {
    const otherApp = db.prepare(`SELECT id FROM applications WHERE booth_id = ? AND status != 'rejected'`).get(to_booth_id) as any
    const oldBooth = app.booth_id
    db.prepare(`UPDATE applications SET booth_id = ? WHERE id = ?`).run(to_booth_id, from_application_id)
    db.prepare(`UPDATE setup_records SET booth_id = ?, swap_to_booth_id = ?, swap_reason = ? WHERE application_id = ?`)
      .run(to_booth_id, oldBooth, reason || '临时调整', from_application_id)
    db.prepare(`UPDATE booths SET status = 'available' WHERE id = ?`).run(oldBooth)
    db.prepare(`UPDATE booths SET status = 'confirmed' WHERE id = ?`).run(to_booth_id)

    if (otherApp) {
      db.prepare(`UPDATE applications SET booth_id = ? WHERE id = ?`).run(oldBooth, otherApp.id)
      const otherSetup = db.prepare(`SELECT id FROM setup_records WHERE application_id = ?`).get(otherApp.id) as any
      if (otherSetup) {
        db.prepare(`UPDATE setup_records SET booth_id = ?, swap_to_booth_id = ?, swap_reason = ? WHERE application_id = ?`)
          .run(oldBooth, to_booth_id, reason || '临时调整', otherApp.id)
      }
    }

    const affectedIds = [from_application_id]
    if (otherApp) affectedIds.push(otherApp.id)
    for (const aid of affectedIds) {
      const app2 = db.prepare(`SELECT exhibition_id, booth_id, product_type, power_watts FROM applications WHERE id = ?`).get(aid) as any
      if (app2) {
        const { exhibition_id, booth_id, product_type, power_watts } = app2
        db.prepare(`DELETE FROM conflicts WHERE application_id = ?`).run(aid)
        const insertC = db.prepare(`INSERT INTO conflicts (application_id, type, message, related_booth_id) VALUES (?, ?, ?, ?)`)
        const booth = db.prepare(`SELECT row, col, type, zone FROM booths WHERE id = ?`).get(booth_id) as any
        if (booth && booth.type !== 'booth') {
          insertC.run(aid, 'aisle_blocked', '所选位置为通道，请勿占用', null)
        }
        if (booth) {
          const neighbors = db.prepare(`
            SELECT b.booth_number, b.id, a.product_type
            FROM booths b LEFT JOIN applications a ON a.booth_id = b.id AND a.status != 'rejected' AND a.id != ?
            WHERE b.exhibition_id = ? AND ABS(b.row - ?) + ABS(b.col - ?) = 1 AND a.product_type IS NOT NULL
          `).all(aid, exhibition_id, booth.row, booth.col) as any[]
          for (const n of neighbors) {
            if (n.product_type === product_type) {
              insertC.run(aid, 'adjacent_type', `相邻摊位 ${n.booth_number}（${n.product_type}）品类重复`, n.id)
            }
          }
        }
      }
    }
  })
  tx()
  res.json({ success: true })
})

export default router
