import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import db, { getConfirmedCount, updateActivityStatus } from '../db.js'

const router = Router()

router.post('/:id/registrations', (req: Request, res: Response): void => {
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id) as any
  if (!activity) {
    res.status(404).json({ success: false, error: '活动不存在' })
    return
  }

  const { name, contact, note, bring_friends } = req.body
  if (!name || !contact) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }

  const confirmedCount = getConfirmedCount(req.params.id)
  const friends = bring_friends ?? 0
  const status = (confirmedCount + 1 + friends) > activity.max_participants ? 'waitlisted' : 'confirmed'

  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()

  db.prepare(`
    INSERT INTO registrations (id, activity_id, name, contact, note, bring_friends, status, checked_in, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, req.params.id, name, contact, note ?? '', friends, status, created_at)

  if (status === 'confirmed') {
    updateActivityStatus(req.params.id)
  } else {
    const newConfirmedCount = getConfirmedCount(req.params.id)
    if (newConfirmedCount >= activity.max_participants && activity.status !== 'full') {
      db.prepare("UPDATE activities SET status = 'full' WHERE id = ?").run(req.params.id)
    }
  }

  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id)
  res.status(201).json({ success: true, data: registration })
})

router.put('/:id/cancel', (req: Request, res: Response): void => {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id) as any
  if (!registration) {
    res.status(404).json({ success: false, error: '报名记录不存在' })
    return
  }

  if (registration.status === 'cancelled') {
    res.status(400).json({ success: false, error: '已取消的报名不能重复取消' })
    return
  }

  const activityId = registration.activity_id

  db.prepare("UPDATE registrations SET status = 'cancelled' WHERE id = ?").run(req.params.id)

  const waitlisted = db.prepare(
    "SELECT * FROM registrations WHERE activity_id = ? AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1"
  ).get(activityId) as any

  if (waitlisted) {
    const activity = db.prepare('SELECT max_participants FROM activities WHERE id = ?').get(activityId) as any
    const currentConfirmed = getConfirmedCount(activityId)
    if (currentConfirmed + 1 + waitlisted.bring_friends <= activity.max_participants) {
      db.prepare("UPDATE registrations SET status = 'confirmed' WHERE id = ?").run(waitlisted.id)
    }
  }

  updateActivityStatus(activityId)

  const updated = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id)
  res.json({ success: true, data: updated })
})

router.put('/:id/checkin', (req: Request, res: Response): void => {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id) as any
  if (!registration) {
    res.status(404).json({ success: false, error: '报名记录不存在' })
    return
  }

  if (registration.status !== 'confirmed') {
    res.status(400).json({ success: false, error: '只有已确认的报名才能签到' })
    return
  }

  db.prepare('UPDATE registrations SET checked_in = 1 WHERE id = ?').run(req.params.id)

  const updated = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id)
  res.json({ success: true, data: updated })
})

export default router
