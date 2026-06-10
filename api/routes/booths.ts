import { Router } from 'express'
import { db } from '../lib/db.js'
import type { Booth } from '../../shared/types.js'

const router = Router()

router.get('/exhibitions/:id/booths', (req, res) => {
  const exId = Number(req.params.id)
  const booths = db.prepare(`
    SELECT b.*, a.id AS app_id, a.brand, a.product_type, a.vendor_name, a.power_watts,
           a.tables, a.chairs, a.has_open_flame, a.contact_name, a.contact_phone, a.status AS app_status
    FROM booths b
    LEFT JOIN applications a ON a.booth_id = b.id AND a.status != 'rejected'
    WHERE b.exhibition_id = ?
    ORDER BY b.row, b.col
  `).all(exId) as any[]
  const result = booths.map(b => ({
    id: b.id,
    exhibition_id: b.exhibition_id,
    booth_number: b.booth_number,
    row: b.row,
    col: b.col,
    type: b.type,
    zone: b.zone,
    max_power_watts: b.max_power_watts,
    status: b.status,
    application: b.app_id ? {
      id: b.app_id,
      exhibition_id: b.exhibition_id,
      booth_id: b.id,
      vendor_name: b.vendor_name,
      brand: b.brand,
      product_type: b.product_type,
      power_watts: b.power_watts,
      tables: b.tables,
      chairs: b.chairs,
      has_open_flame: !!b.has_open_flame,
      contact_name: b.contact_name,
      contact_phone: b.contact_phone,
      status: b.app_status,
      conflicts: db.prepare('SELECT type, message, related_booth_id FROM conflicts WHERE application_id = ?').all(b.app_id),
    } : undefined,
  })) as Booth[]
  res.json({ success: true, data: result })
})

router.put('/booths/:id', (req, res) => {
  const id = Number(req.params.id)
  const { booth_number, row, col, type, zone, max_power_watts, status } = req.body
  db.prepare(
    `UPDATE booths SET
       booth_number = COALESCE(?, booth_number),
       row = COALESCE(?, row),
       col = COALESCE(?, col),
       type = COALESCE(?, type),
       zone = COALESCE(?, zone),
       max_power_watts = COALESCE(?, max_power_watts),
       status = COALESCE(?, status)
     WHERE id = ?`
  ).run(booth_number, row, col, type, zone, max_power_watts, status, id)
  res.json({ success: true })
})

router.put('/exhibitions/:id/layout', (req, res) => {
  const exId = Number(req.params.id)
  const booths = req.body as Booth[]
  const tx = db.transaction(() => {
    const stmt = db.prepare(
      `UPDATE booths SET booth_number = ?, row = ?, col = ?, type = ?, zone = ?, max_power_watts = ?, status = ? WHERE id = ?`
    )
    for (const b of booths) {
      stmt.run(b.booth_number, b.row, b.col, b.type, b.zone, b.max_power_watts, b.status, b.id)
    }
  })
  tx()
  res.json({ success: true })
})

export default router
