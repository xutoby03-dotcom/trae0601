import { Router } from 'express'
import { db } from '../lib/db.js'
import type { Application, Conflict } from '../../shared/types.js'

const router = Router()

function detectConflicts(applicationId: number, exhibitionId: number, boothId: number, productType: string, powerWatts: number) {
  const booth = db.prepare(`SELECT row, col, type, zone FROM booths WHERE id = ?`).get(boothId) as any
  if (!booth) return

  db.prepare(`DELETE FROM conflicts WHERE application_id = ?`).run(applicationId)
  const insertC = db.prepare(`INSERT INTO conflicts (application_id, type, message, related_booth_id) VALUES (?, ?, ?, ?)`)

  if (booth.type !== 'booth') {
    insertC.run(applicationId, 'aisle_blocked', '所选位置为通道，请勿占用', null)
  }

  const neighbors = db.prepare(`
    SELECT b.id, b.booth_number, a.product_type
    FROM booths b
    LEFT JOIN applications a ON a.booth_id = b.id AND a.status != 'rejected'
    WHERE b.exhibition_id = ? AND ABS(b.row - ?) + ABS(b.col - ?) = 1 AND a.product_type IS NOT NULL
  `).all(exhibitionId, booth.row, booth.col) as any[]

  for (const n of neighbors) {
    if (n.product_type === productType) {
      insertC.run(applicationId, 'adjacent_type',
        `相邻摊位 ${n.booth_number}（${n.product_type}）品类重复，请考虑调整`, n.id)
    }
  }

  const zonePower = db.prepare(`
    SELECT COALESCE(SUM(a.power_watts), 0) AS total
    FROM applications a
    JOIN booths b ON b.id = a.booth_id
    WHERE b.exhibition_id = ? AND b.zone = ? AND a.status != 'rejected' AND a.id != ?
  `).get(exhibitionId, booth.zone, applicationId) as { total: number }
  const boothLimit = db.prepare(`SELECT max_power_watts FROM booths WHERE id = ?`).get(boothId) as { max_power_watts: number } | undefined
  const zoneLimit = (boothLimit?.max_power_watts || 2000) * 6
  const newTotal = zonePower.total + powerWatts
  if (powerWatts > (boothLimit?.max_power_watts || 2000)) {
    insertC.run(applicationId, 'power_overload',
      `用电需求 ${powerWatts}W 超过单摊位供电上限 ${boothLimit?.max_power_watts || 2000}W`, null)
  } else if (newTotal > zoneLimit) {
    insertC.run(applicationId, 'power_overload',
      `区域总用电将达到 ${newTotal}W，超过 ${booth.zone} 区供电上限 ${zoneLimit}W`, null)
  }

  const hasConflict = db.prepare(`SELECT COUNT(*) AS c FROM conflicts WHERE application_id = ?`).get(applicationId) as { c: number }
  db.prepare(`UPDATE booths SET status = ? WHERE id = ?`)
    .run(hasConflict.c > 0 ? 'conflict' : 'applied', boothId)
}

router.get('/exhibitions/:id/applications', (req, res) => {
  const exId = Number(req.params.id)
  const rows = db.prepare(`
    SELECT a.*, b.booth_number, b.row, b.col, b.status AS booth_status
    FROM applications a
    JOIN booths b ON b.id = a.booth_id
    WHERE a.exhibition_id = ?
    ORDER BY a.created_at DESC
  `).all(exId) as any[]
  const data: Application[] = rows.map(r => ({
    ...r,
    has_open_flame: !!r.has_open_flame,
    conflicts: db.prepare('SELECT type, message, related_booth_id FROM conflicts WHERE application_id = ?').all(r.id) as Conflict[],
    booth_number: r.booth_number,
  })) as any
  res.json({ success: true, data })
})

router.post('/applications', (req, res) => {
  const { exhibition_id, booth_id, vendor_name, brand, product_type, power_watts = 0,
    tables = 0, chairs = 0, has_open_flame = 0, contact_name, contact_phone } = req.body
  if (!exhibition_id || !booth_id || !vendor_name || !brand || !product_type || !contact_name || !contact_phone) {
    return res.status(400).json({ success: false, error: '缺少必要字段' })
  }
  const booth = db.prepare(`SELECT id, status FROM booths WHERE id = ? AND exhibition_id = ?`).get(booth_id, exhibition_id) as any
  if (!booth) return res.status(400).json({ success: false, error: '摊位不存在' })
  if (['confirmed', 'applied', 'conflict'].includes(booth.status)) {
    return res.status(400).json({ success: false, error: '该摊位已被申请或已确认' })
  }
  const info = db.prepare(`
    INSERT INTO applications (exhibition_id, booth_id, vendor_name, brand, product_type, power_watts, tables, chairs, has_open_flame, contact_name, contact_phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(exhibition_id, booth_id, vendor_name, brand, product_type, power_watts, tables, chairs, has_open_flame ? 1 : 0, contact_name, contact_phone)
  const appId = info.lastInsertRowid as number
  detectConflicts(appId, exhibition_id, booth_id, product_type, Number(power_watts))
  res.json({ success: true, data: { id: appId } })
})

router.put('/applications/:id/status', (req, res) => {
  const appId = Number(req.params.id)
  const { status } = req.body as { status: 'approved' | 'rejected' }
  const app = db.prepare(`SELECT * FROM applications WHERE id = ?`).get(appId) as any
  if (!app) return res.status(404).json({ success: false, error: '申请不存在' })
  db.prepare(`UPDATE applications SET status = ? WHERE id = ?`).run(status, appId)
  if (status === 'approved') {
    db.prepare(`UPDATE booths SET status = 'confirmed' WHERE id = ?`).run(app.booth_id)
  } else if (status === 'rejected') {
    db.prepare(`DELETE FROM conflicts WHERE application_id = ?`).run(appId)
    const stillActive = db.prepare(`SELECT COUNT(*) AS c FROM applications WHERE booth_id = ? AND status != 'rejected'`).get(app.booth_id) as { c: number }
    if (stillActive.c === 0) {
      db.prepare(`UPDATE booths SET status = 'available' WHERE id = ?`).run(app.booth_id)
    }
  }
  res.json({ success: true })
})

router.get('/applications/my', (req, res) => {
  const phone = (req.query.phone as string) || ''
  let rows: any[]
  if (phone) {
    rows = db.prepare(`
      SELECT a.*, b.booth_number, e.name AS exhibition_name, e.venue, e.start_date, e.end_date, e.status AS exhibition_status
      FROM applications a
      JOIN booths b ON b.id = a.booth_id
      JOIN exhibitions e ON e.id = a.exhibition_id
      WHERE a.contact_phone = ?
      ORDER BY a.created_at DESC
    `).all(phone)
  } else {
    rows = db.prepare(`
      SELECT a.*, b.booth_number, e.name AS exhibition_name, e.venue, e.start_date, e.end_date, e.status AS exhibition_status
      FROM applications a
      JOIN booths b ON b.id = a.booth_id
      JOIN exhibitions e ON e.id = a.exhibition_id
      ORDER BY a.created_at DESC LIMIT 50
    `).all()
  }
  const data = rows.map(r => ({
    ...r,
    has_open_flame: !!r.has_open_flame,
    conflicts: db.prepare('SELECT type, message, related_booth_id FROM conflicts WHERE application_id = ?').all(r.id),
  }))
  res.json({ success: true, data })
})

export default router
