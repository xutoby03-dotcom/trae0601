import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import db, { getConfirmedCount, updateActivityStatus } from '../db.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { status } = req.query
  let activities
  if (status) {
    activities = db.prepare('SELECT * FROM activities WHERE status = ? ORDER BY created_at DESC').all(status)
  } else {
    activities = db.prepare('SELECT * FROM activities ORDER BY created_at DESC').all()
  }

  const result = activities.map((a: any) => ({
    ...a,
    confirmed_count: getConfirmedCount(a.id),
  }))

  res.json({ success: true, data: result })
})

router.get('/:id', (req: Request, res: Response): void => {
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id) as any
  if (!activity) {
    res.status(404).json({ success: false, error: '活动不存在' })
    return
  }

  const registrations = db.prepare('SELECT * FROM registrations WHERE activity_id = ? ORDER BY created_at ASC').all(req.params.id)

  res.json({
    success: true,
    data: {
      ...activity,
      confirmed_count: getConfirmedCount(activity.id),
      registrations,
    },
  })
})

router.post('/', (req: Request, res: Response): void => {
  const { title, location, start_time, end_time, max_participants, cost, bring_items, poster, status, type } = req.body

  if (!title || !location || !start_time || !end_time || max_participants === undefined) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }

  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()

  db.prepare(`
    INSERT INTO activities (id, title, location, start_time, end_time, max_participants, cost, bring_items, poster, status, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, location, start_time, end_time, max_participants, cost ?? 0, bring_items ?? '', poster ?? '', status ?? 'not_started', type ?? '其他', created_at)

  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id)
  res.status(201).json({ success: true, data: activity })
})

router.put('/:id', (req: Request, res: Response): void => {
  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id)
  if (!existing) {
    res.status(404).json({ success: false, error: '活动不存在' })
    return
  }

  const { title, location, start_time, end_time, max_participants, cost, bring_items, poster, status, type } = req.body

  db.prepare(`
    UPDATE activities SET
      title = COALESCE(?, title),
      location = COALESCE(?, location),
      start_time = COALESCE(?, start_time),
      end_time = COALESCE(?, end_time),
      max_participants = COALESCE(?, max_participants),
      cost = COALESCE(?, cost),
      bring_items = COALESCE(?, bring_items),
      poster = COALESCE(?, poster),
      status = COALESCE(?, status),
      type = COALESCE(?, type)
    WHERE id = ?
  `).run(title ?? null, location ?? null, start_time ?? null, end_time ?? null, max_participants ?? null, cost ?? null, bring_items ?? null, poster ?? null, status ?? null, type ?? null, req.params.id)

  if (max_participants !== undefined) {
    updateActivityStatus(req.params.id)
  }

  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id)
  res.json({ success: true, data: activity })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id)
  if (!existing) {
    res.status(404).json({ success: false, error: '活动不存在' })
    return
  }

  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id)
  res.json({ success: true, message: '删除成功' })
})

router.get('/:id/export', (req: Request, res: Response): void => {
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id) as any
  if (!activity) {
    res.status(404).json({ success: false, error: '活动不存在' })
    return
  }

  const registrations = db.prepare('SELECT * FROM registrations WHERE activity_id = ? ORDER BY created_at ASC').all(req.params.id) as any[]

  const header = '姓名,联系方式,备注,带朋友数,状态,是否签到,报名时间'
  const rows = registrations.map(r =>
    `"${r.name}","${r.contact}","${r.note}",${r.bring_friends},${r.status === 'confirmed' ? '已确认' : '候补'},${r.checked_in ? '已签到' : '未签到'},"${r.created_at}"`
  )

  const csv = '\uFEFF' + [header, ...rows].join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${activity.title}_报名名单.csv"`)
  res.send(csv)
})

export default router
