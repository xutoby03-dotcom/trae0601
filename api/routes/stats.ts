import { Router, type Request, type Response } from 'express'
import db, { getConfirmedCount } from '../db.js'

const router = Router()

router.get('/history', (req: Request, res: Response): void => {
  const endedActivities = db.prepare("SELECT * FROM activities WHERE status = 'ended'").all() as any[]

  let totalCheckedIn = 0
  let totalConfirmed = 0

  const activities = endedActivities.map(a => {
    const confirmedCount = getConfirmedCount(a.id)
    const checkedInCount = db.prepare(
      "SELECT COUNT(*) as count FROM registrations WHERE activity_id = ? AND status = 'confirmed' AND checked_in = 1"
    ).get(a.id) as { count: number }

    const attendanceRate = confirmedCount > 0 ? checkedInCount.count / confirmedCount : 0

    totalCheckedIn += checkedInCount.count
    totalConfirmed += confirmedCount

    return {
      id: a.id,
      title: a.title,
      confirmed_count: confirmedCount,
      checked_in_count: checkedInCount.count,
      attendance_rate: Math.round(attendanceRate * 100) / 100,
    }
  })

  const avgAttendanceRate = totalConfirmed > 0 ? Math.round((totalCheckedIn / totalConfirmed) * 100) / 100 : 0

  res.json({
    success: true,
    data: {
      total_activities: endedActivities.length,
      avg_attendance_rate: avgAttendanceRate,
      activities,
    },
  })
})

router.get('/activity-types', (req: Request, res: Response): void => {
  const types = db.prepare(`
    SELECT a.type,
           COALESCE(SUM(1 + r.bring_friends), 0) as participant_count
    FROM activities a
    LEFT JOIN registrations r ON a.id = r.activity_id AND r.status = 'confirmed'
    GROUP BY a.type
    ORDER BY participant_count DESC
  `).all() as any[]

  res.json({ success: true, data: types })
})

export default router
