import { Router, type Response } from 'express'
import db from '../database.js'

const router = Router()

interface StatsRow {
  totalListedValue: number
  totalListedCount: number
  totalSoldValue: number
  totalSoldCount: number
}

interface CategoryRow {
  category: string
  count: number
  value: number
}

router.get('/', (_req, res: Response): void => {
  const listedStats = db.prepare(`
    SELECT COALESCE(SUM(current_price), 0) as totalListedValue,
           COUNT(*) as totalListedCount
    FROM items WHERE status = 'selling'
  `).get() as { totalListedValue: number; totalListedCount: number }

  const soldStats = db.prepare(`
    SELECT COALESCE(SUM(current_price), 0) as totalSoldValue,
           COUNT(*) as totalSoldCount
    FROM items WHERE status = 'sold'
  `).get() as { totalSoldValue: number; totalSoldCount: number }

  const categoryBreakdown = db.prepare(`
    SELECT category, COUNT(*) as count, COALESCE(SUM(current_price), 0) as value
    FROM items GROUP BY category
  `).all() as CategoryRow[]

  const volumeMap: Record<string, number> = {
    '数码': 0.02,
    '家电': 0.15,
    '服装': 0.005,
    '书籍': 0.003,
    '家居': 0.1,
    '其他': 0.05,
  }

  let recycledSpaceEstimate = 0
  for (const cat of categoryBreakdown) {
    recycledSpaceEstimate += cat.count * (volumeMap[cat.category] || 0.05)
  }

  res.json({
    success: true,
    data: {
      totalListedValue: listedStats.totalListedValue,
      totalListedCount: listedStats.totalListedCount,
      totalSoldValue: soldStats.totalSoldValue,
      totalSoldCount: soldStats.totalSoldCount,
      recycledSpaceEstimate: Math.round(recycledSpaceEstimate * 100) / 100,
      categoryBreakdown,
    },
  })
})

export default router
