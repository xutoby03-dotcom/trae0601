import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

interface ItemRow {
  id: number
  name: string
  brand: string
  original_price: number
  purchase_date: string
  condition: string
  accessories_complete: number
  flaws: string
  photos: string
  category: string
  current_price: number
  suggested_price_min: number
  suggested_price_max: number
  free_shipping: number
  status: string
  created_at: string
  updated_at: string
}

interface PriceRecordRow {
  id: number
  item_id: number
  price: number
  reason: string
  created_at: string
}

interface BargainRow {
  id: number
  item_id: number
  offer_price: number
  message: string
  status: string
  seller_note: string
  created_at: string
  updated_at: string
}

router.get('/', (req: Request, res: Response): void => {
  const { category, condition, minPrice, maxPrice, freeShipping, status } = req.query

  let sql = 'SELECT * FROM items WHERE 1=1'
  const params: unknown[] = []

  if (category) {
    sql += ' AND category = ?'
    params.push(category)
  }
  if (condition) {
    sql += ' AND condition = ?'
    params.push(condition)
  }
  if (minPrice) {
    sql += ' AND current_price >= ?'
    params.push(Number(minPrice))
  }
  if (maxPrice) {
    sql += ' AND current_price <= ?'
    params.push(Number(maxPrice))
  }
  if (freeShipping !== undefined && freeShipping !== '') {
    sql += ' AND free_shipping = ?'
    params.push(Number(freeShipping))
  }
  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }

  sql += ' ORDER BY created_at DESC'

  const items = db.prepare(sql).all(...params) as ItemRow[]
  res.json({ success: true, data: items })
})

router.get('/:id', (req: Request, res: Response): void => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as ItemRow | undefined

  if (!item) {
    res.status(404).json({ success: false, error: '物品不存在' })
    return
  }

  const priceRecords = db.prepare('SELECT * FROM price_records WHERE item_id = ? ORDER BY created_at DESC').all(item.id) as PriceRecordRow[]

  res.json({ success: true, data: { ...item, priceRecords } })
})

router.post('/', (req: Request, res: Response): void => {
  const {
    name, brand, original_price, purchase_date, condition,
    accessories_complete, flaws, photos, category,
    current_price, suggested_price_min, suggested_price_max, free_shipping, status,
  } = req.body

  if (!name || !original_price || !purchase_date || !condition || !category || !current_price) {
    res.status(400).json({ success: false, error: '缺少必要字段' })
    return
  }

  const insertItem = db.prepare(`
    INSERT INTO items (name, brand, original_price, purchase_date, condition, accessories_complete, flaws, photos, category, current_price, suggested_price_min, suggested_price_max, free_shipping, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertPriceRecord = db.prepare(`
    INSERT INTO price_records (item_id, price, reason)
    VALUES (?, ?, ?)
  `)

  const transaction = db.transaction(() => {
    const result = insertItem.run(
      name,
      brand || '',
      original_price,
      purchase_date,
      condition,
      accessories_complete !== undefined ? accessories_complete : 1,
      flaws || '',
      photos || '[]',
      category,
      current_price,
      suggested_price_min || current_price * 0.85,
      suggested_price_max || current_price * 1.15,
      free_shipping || 0,
      status || 'selling',
    )
    insertPriceRecord.run(result.lastInsertRowid, current_price, '初始定价')
    return result.lastInsertRowid
  })

  const id = transaction()
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as ItemRow

  res.status(201).json({ success: true, data: item })
})

router.put('/:id', (req: Request, res: Response): void => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as ItemRow | undefined

  if (!item) {
    res.status(404).json({ success: false, error: '物品不存在' })
    return
  }

  const {
    name, brand, original_price, purchase_date, condition,
    accessories_complete, flaws, photos, category,
    current_price, suggested_price_min, suggested_price_max, free_shipping, status,
  } = req.body

  const updateItem = db.prepare(`
    UPDATE items SET
      name = ?, brand = ?, original_price = ?, purchase_date = ?,
      condition = ?, accessories_complete = ?, flaws = ?, photos = ?,
      category = ?, current_price = ?, suggested_price_min = ?,
      suggested_price_max = ?, free_shipping = ?, status = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `)

  const insertPriceRecord = db.prepare(`
    INSERT INTO price_records (item_id, price, reason)
    VALUES (?, ?, ?)
  `)

  const newPrice = current_price !== undefined ? current_price : item.current_price

  const transaction = db.transaction(() => {
    updateItem.run(
      name || item.name,
      brand !== undefined ? brand : item.brand,
      original_price || item.original_price,
      purchase_date || item.purchase_date,
      condition || item.condition,
      accessories_complete !== undefined ? accessories_complete : item.accessories_complete,
      flaws !== undefined ? flaws : item.flaws,
      photos !== undefined ? photos : item.photos,
      category || item.category,
      newPrice,
      suggested_price_min !== undefined ? suggested_price_min : item.suggested_price_min,
      suggested_price_max !== undefined ? suggested_price_max : item.suggested_price_max,
      free_shipping !== undefined ? free_shipping : item.free_shipping,
      status || item.status,
      req.params.id,
    )

    if (current_price !== undefined && current_price !== item.current_price) {
      insertPriceRecord.run(Number(req.params.id), current_price, '价格更新')
    }
  })

  transaction()
  const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as ItemRow

  res.json({ success: true, data: updatedItem })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as ItemRow | undefined

  if (!item) {
    res.status(404).json({ success: false, error: '物品不存在' })
    return
  }

  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id)
  res.json({ success: true, data: null })
})

router.post('/estimate', (req: Request, res: Response): void => {
  const { originalPrice, purchaseDate, condition, accessoriesComplete, category } = req.body

  if (!originalPrice || !purchaseDate || !condition || !category) {
    res.status(400).json({ success: false, error: '缺少必要字段' })
    return
  }

  const purchaseTime = new Date(purchaseDate).getTime()
  const now = Date.now()
  const yearsSincePurchase = Math.max(0, (now - purchaseTime) / (365.25 * 24 * 60 * 60 * 1000))

  let depreciation = 0.3 + Math.max(0, yearsSincePurchase - 1) * 0.15
  depreciation = Math.min(depreciation, 0.8)

  const conditionMultiplier: Record<string, number> = {
    '全新': 1.0,
    '9成新': 0.9,
    '8成新': 0.8,
    '7成新': 0.7,
    '6成新及以下': 0.55,
  }

  const categoryAdjustment: Record<string, number> = {
    '数码': 0.85,
    '家电': 0.8,
    '服装': 0.6,
    '书籍': 0.7,
    '家居': 0.75,
    '其他': 0.7,
  }

  const conditionMult = conditionMultiplier[condition] || 0.7
  const categoryAdj = categoryAdjustment[category] || 0.7
  const accessoriesBonus = accessoriesComplete ? 1.1 : 1.0

  const base = originalPrice * (1 - depreciation) * conditionMult * categoryAdj * accessoriesBonus
  const suggestedMin = Math.round(base * 0.85 * 100) / 100
  const suggestedMax = Math.round(base * 1.15 * 100) / 100
  const suggestedPrice = Math.round((suggestedMin + suggestedMax) / 2 * 100) / 100

  res.json({
    success: true,
    data: { suggestedMin, suggestedMax, suggestedPrice },
  })
})

router.get('/:id/prices', (req: Request, res: Response): void => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as ItemRow | undefined

  if (!item) {
    res.status(404).json({ success: false, error: '物品不存在' })
    return
  }

  const priceRecords = db.prepare('SELECT * FROM price_records WHERE item_id = ? ORDER BY created_at DESC').all(req.params.id) as PriceRecordRow[]

  res.json({ success: true, data: priceRecords })
})

router.post('/:id/prices', (req: Request, res: Response): void => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as ItemRow | undefined

  if (!item) {
    res.status(404).json({ success: false, error: '物品不存在' })
    return
  }

  const { price, reason } = req.body

  if (!price) {
    res.status(400).json({ success: false, error: '缺少价格' })
    return
  }

  const insertPriceRecord = db.prepare(`
    INSERT INTO price_records (item_id, price, reason)
    VALUES (?, ?, ?)
  `)

  const updateItemPrice = db.prepare(`
    UPDATE items SET current_price = ?, updated_at = datetime('now') WHERE id = ?
  `)

  const transaction = db.transaction(() => {
    insertPriceRecord.run(Number(req.params.id), price, reason || '降价')
    updateItemPrice.run(price, req.params.id)
  })

  transaction()
  const priceRecords = db.prepare('SELECT * FROM price_records WHERE item_id = ? ORDER BY created_at DESC').all(req.params.id) as PriceRecordRow[]

  res.status(201).json({ success: true, data: priceRecords })
})

router.get('/:id/bargains', (req: Request, res: Response): void => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as ItemRow | undefined

  if (!item) {
    res.status(404).json({ success: false, error: '物品不存在' })
    return
  }

  const bargains = db.prepare('SELECT * FROM bargain_offers WHERE item_id = ? ORDER BY created_at DESC').all(req.params.id) as BargainRow[]

  res.json({ success: true, data: bargains })
})

router.post('/:id/bargains', (req: Request, res: Response): void => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id) as ItemRow | undefined

  if (!item) {
    res.status(404).json({ success: false, error: '物品不存在' })
    return
  }

  const { offerPrice, message } = req.body

  if (!offerPrice) {
    res.status(400).json({ success: false, error: '缺少出价' })
    return
  }

  const result = db.prepare(`
    INSERT INTO bargain_offers (item_id, offer_price, message)
    VALUES (?, ?, ?)
  `).run(Number(req.params.id), offerPrice, message || '')

  const bargain = db.prepare('SELECT * FROM bargain_offers WHERE id = ?').get(result.lastInsertRowid) as BargainRow

  res.status(201).json({ success: true, data: bargain })
})

export default router
