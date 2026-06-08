import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

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

router.put('/:id', (req: Request, res: Response): void => {
  const bargain = db.prepare('SELECT * FROM bargain_offers WHERE id = ?').get(req.params.id) as BargainRow | undefined

  if (!bargain) {
    res.status(404).json({ success: false, error: '砍价记录不存在' })
    return
  }

  const { status, sellerNote } = req.body

  if (!status || !['accepted', 'rejected'].includes(status)) {
    res.status(400).json({ success: false, error: '状态必须是 accepted 或 rejected' })
    return
  }

  const updateBargain = db.prepare(`
    UPDATE bargain_offers SET status = ?, seller_note = ?, updated_at = datetime('now')
    WHERE id = ?
  `)

  const updateItemPrice = db.prepare(`
    UPDATE items SET current_price = ?, status = 'sold', updated_at = datetime('now') WHERE id = ?
  `)

  const insertPriceRecord = db.prepare(`
    INSERT INTO price_records (item_id, price, reason)
    VALUES (?, ?, ?)
  `)

  const transaction = db.transaction(() => {
    updateBargain.run(status, sellerNote || '', req.params.id)

    if (status === 'accepted') {
      updateItemPrice.run(bargain.offer_price, bargain.item_id)
      insertPriceRecord.run(bargain.item_id, bargain.offer_price, '砍价成交')
    }
  })

  transaction()
  const updatedBargain = db.prepare('SELECT * FROM bargain_offers WHERE id = ?').get(req.params.id) as BargainRow

  res.json({ success: true, data: updatedBargain })
})

export default router
