export type ItemType = '纸箱' | '自行车' | '鞋柜' | '家具' | '杂物' | '其他'

export type OccupyLocation = '楼道' | '楼梯口' | '电梯口' | '消防通道' | '入户门前' | '其他'

export type ReportStatus = '待处理' | '已联系' | '已认领' | '已清理' | '无人认领'

export type FireRiskLevel = '高' | '中' | '低'

export interface ClutterReport {
  id: string
  building: string
  floor: string
  itemType: ItemType
  occupyLocation: OccupyLocation
  photo: string
  discoveryTime: string
  blocksPassage: boolean
  status: ReportStatus
  fireRisk: FireRiskLevel
  createdAt: string
  claimedBy?: string
  claimPhone?: string
  expectedCleanupTime?: string
  propertyNote?: string
  resolvedAt?: string
  recurrenceCount: number
  recurrenceGroupKey: string
  gentleReminder?: string
}

export interface RecurrenceRecord {
  groupKey: string
  building: string
  floor: string
  occupyLocation: OccupyLocation
  count: number
  lastReportId: string
}

export const ITEM_TYPE_OPTIONS: ItemType[] = ['纸箱', '自行车', '鞋柜', '家具', '杂物', '其他']
export const OCCUPY_LOCATION_OPTIONS: OccupyLocation[] = ['楼道', '楼梯口', '电梯口', '消防通道', '入户门前', '其他']
export const STATUS_OPTIONS: ReportStatus[] = ['待处理', '已联系', '已认领', '已清理', '无人认领']

export function calculateFireRisk(itemType: ItemType, occupyLocation: OccupyLocation, blocksPassage: boolean): FireRiskLevel {
  if (occupyLocation === '消防通道') return '高'
  if (occupyLocation === '楼梯口' && blocksPassage) return '高'
  if (itemType === '纸箱' && (occupyLocation === '楼道' || occupyLocation === '楼梯口')) return '高'
  if (blocksPassage) return '中'
  if (occupyLocation === '楼梯口' || occupyLocation === '电梯口') return '中'
  return '低'
}

export function generateGroupKey(building: string, floor: string, occupyLocation: OccupyLocation): string {
  return `${building}-${floor}-${occupyLocation}`
}

export function getGentleReminder(itemType: ItemType, occupyLocation: OccupyLocation, blocksPassage: boolean, recurrenceCount: number): string {
  const baseReminders: Record<ItemType, string> = {
    '纸箱': '亲，纸箱属于易燃物品，堆放在公共区域存在消防隐患，建议尽快整理回收哦～',
    '自行车': '邻居您好，自行车停在楼道可能影响大家通行，也容易刮碰到，建议停到指定车棚～',
    '鞋柜': '您好，鞋柜放在楼道占用公共空间，也影响邻居出入，建议移回室内哦～',
    '家具': '亲，大件家具放在楼道既影响通行又有安全隐患，建议尽快搬走或联系物业协助处理～',
    '杂物': '邻居您好，楼道堆放杂物不仅影响通行，还存在消防隐患，建议尽快清理一下哦～',
    '其他': '您好，楼道是公共通道，物品堆放会影响大家通行和安全，建议尽快整理哦～',
  }

  let reminder = baseReminders[itemType]

  if (blocksPassage) {
    reminder = reminder.replace('建议', '特别提醒，此处已影响通行，建议')
  }

  if (occupyLocation === '消防通道') {
    reminder += ' ⚠️ 消防通道是生命通道，请务必保持畅通！'
  }

  if (recurrenceCount >= 2) {
    reminder += ` 🔄 该位置已多次出现堆物情况，希望大家共同维护楼道整洁～`
  }

  return reminder
}
