import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

interface CategoryDetail {
  category: string
  listedValue: number
  listedCount: number
  soldValue: number
  soldCount: number
  spaceEstimate: number
}

const volumeMap: Record<string, number> = {
  '数码': 0.02,
  '家电': 0.15,
  '服装': 0.005,
  '书籍': 0.003,
  '家居': 0.1,
  '其他': 0.05,
}

router.get('/', (req: Request, res: Response): void => {
  const statusFilter = req.query.status as string | undefined
  const statusWhere = statusFilter && ['selling', 'sold'].includes(statusFilter)
    ? `WHERE status = '${statusFilter}'`
    : ''

  const listedWhere = statusFilter === 'sold'
    ? 'WHERE 1=0'
    : statusFilter === 'selling'
      ? "WHERE status = 'selling'"
      : "WHERE status = 'selling'"

  const soldWhere = statusFilter === 'selling'
    ? 'WHERE 1=0'
    : statusFilter === 'sold'
      ? "WHERE status = 'sold'"
      : "WHERE status = 'sold'"

  const listedStats = db.prepare(`
    SELECT COALESCE(SUM(current_price), 0) as totalListedValue,
           COUNT(*) as totalListedCount
    FROM items ${listedWhere}
  `).get() as { totalListedValue: number; totalListedCount: number }

  const soldStats = db.prepare(`
    SELECT COALESCE(SUM(current_price), 0) as totalSoldValue,
           COUNT(*) as totalSoldCount
    FROM items ${soldWhere}
  `).get() as { totalSoldValue: number; totalSoldCount: number }

  const listedByCategory = db.prepare(`
    SELECT category, COUNT(*) as count, COALESCE(SUM(current_price), 0) as value
    FROM items ${listedWhere} GROUP BY category
  `).all() as { category: string; count: number; value: number }[]

  const soldByCategory = db.prepare(`
    SELECT category, COUNT(*) as count, COALESCE(SUM(current_price), 0) as value
    FROM items ${soldWhere} GROUP BY category
  `).all() as { category: string; count: number; value: number }[]

  const allByCategory = db.prepare(`
    SELECT category, COUNT(*) as count, COALESCE(SUM(current_price), 0) as value
    FROM items ${statusWhere} GROUP BY category
  `).all() as { category: string; count: number; value: number }[]

  const listedMap = new Map(listedByCategory.map(c => [c.category, c]))
  const soldMap = new Map(soldByCategory.map(c => [c.category, c]))
  const allCategories = new Set([
    ...listedMap.keys(),
    ...soldMap.keys(),
  ])

  const categoryDetails: CategoryDetail[] = Array.from(allCategories).map(cat => {
    const listed = listedMap.get(cat)
    const sold = soldMap.get(cat)
    const count = (listed?.count || 0) + (sold?.count || 0)
    return {
      category: cat,
      listedValue: listed?.value || 0,
      listedCount: listed?.count || 0,
      soldValue: sold?.value || 0,
      soldCount: sold?.count || 0,
      spaceEstimate: Math.round(count * (volumeMap[cat] || 0.05) * 100) / 100,
    }
  })

  const totalCount = listedStats.totalListedCount + soldStats.totalSoldCount
  let recycledSpaceEstimate = 0
  for (const cat of categoryDetails) {
    recycledSpaceEstimate += cat.spaceEstimate
  }

  res.json({
    success: true,
    data: {
      totalListedValue: listedStats.totalListedValue,
      totalListedCount: listedStats.totalListedCount,
      totalSoldValue: soldStats.totalSoldValue,
      totalSoldCount: soldStats.totalSoldCount,
      recycledSpaceEstimate: Math.round(recycledSpaceEstimate * 100) / 100,
      categoryBreakdown: allByCategory,
      categoryDetails,
    },
  })
})

export default router
