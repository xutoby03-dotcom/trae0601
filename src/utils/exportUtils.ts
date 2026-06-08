import type { Equipment, BorrowRecord, SelectedEquipment } from '../store/types'
import { CATEGORY_LABELS } from '../store/types'

interface ExportRow {
  index: number
  name: string
  category: string
  quantity: number
  borrower: string
  status: string
  notes: string
}

export function buildExportData(
  selectedEquipment: SelectedEquipment[],
  allEquipment: Equipment[],
  borrowRecords: BorrowRecord[]
): ExportRow[] {
  return selectedEquipment.map((se, idx) => {
    const eq = allEquipment.find((e) => e.id === se.equipmentId)
    const borrow = borrowRecords.find(
      (b) => b.equipmentId === se.equipmentId && b.status !== 'returned'
    )
    return {
      index: idx + 1,
      name: eq?.name ?? '未知装备',
      category: eq ? CATEGORY_LABELS[eq.category] : '',
      quantity: se.quantity,
      borrower: borrow?.borrowerName ?? '',
      status: eq?.status === 'borrowed' ? '已借出' : eq?.status === 'overdue' ? '逾期' : '待检查',
      notes: eq?.notes ?? '',
    }
  })
}

export function generateChecklistText(rows: ExportRow[], tripName: string, tripDate: string): string {
  const lines: string[] = []
  lines.push(`🏕️ 露营出发前检查表`)
  lines.push(`行程：${tripName}`)
  lines.push(`日期：${tripDate}`)
  lines.push('')
  lines.push('序号 | 装备名称 | 分类 | 数量 | 借用人 | 状态 | 备注')
  lines.push('---|---|---|---|---|---|---')
  rows.forEach((r) => {
    lines.push(`${r.index} | ${r.name} | ${r.category} | ${r.quantity} | ${r.borrower} | ${r.status} | ${r.notes}`)
  })
  lines.push('')
  lines.push('✅ 检查完毕请逐项确认')
  return lines.join('\n')
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
