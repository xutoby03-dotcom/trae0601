import type {
  Cell,
  Observation,
  CellMaterial,
  Orientation,
  HeightLevel,
  OccupancyStatus,
  VisitorType,
  WeatherType,
} from '../types'
import { getDateDaysAgo, formatDate } from './dateUtils'

const MATERIALS: CellMaterial[] = [
  'bamboo',
  'wood',
  'pinecone',
  'straw',
  'hollowStem',
  'bark',
  'stone',
  'moss',
  'corrugated',
  'drilledWood',
]

const ORIENTATIONS: Orientation[] = [
  'north',
  'south',
  'east',
  'west',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
]

const HEIGHTS: HeightLevel[] = ['ground', 'low', 'middle', 'high']

const STATUSES: OccupancyStatus[] = ['empty', 'underObservation', 'occupied']

const VISITORS: VisitorType[] = ['bee', 'ladybug', 'butterfly', 'beetle', 'spider', 'ant', 'other']

const WEATHERS: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'windy', 'stormy']

const PLANTS = [
  '向日葵',
  '薰衣草',
  '玫瑰',
  '薄荷',
  '三叶草',
  '蒲公英',
  '波斯菊',
  '万寿菊',
  '月季',
  '灌木',
  '草坪',
  '树木',
]

const RECORDERS = ['张小明', '李小红', '王小华', '赵小强', '陈小美']

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPickMultiple<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function generateMockCells(): Cell[] {
  const cells: Cell[] = []
  const gridRows = 4
  const gridCols = 6

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const index = row * gridCols + col
      const height = gridRows - 1 - row
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]

      cells.push({
        id: generateId(),
        cellNumber: `A${String(index + 1).padStart(2, '0')}`,
        material: MATERIALS[index % MATERIALS.length],
        orientation: randomPick(ORIENTATIONS),
        height: HEIGHTS[height],
        hasRainProtection: Math.random() > 0.5,
        surroundingPlants: randomPickMultiple(PLANTS, 1, 3),
        status,
        registeredAt: getDateDaysAgo(30),
        lastObservedAt: status === 'empty' && Math.random() > 0.5
          ? getDateDaysAgo(Math.floor(Math.random() * 15) + 15)
          : getDateDaysAgo(Math.floor(Math.random() * 3)),
      })
    }
  }

  return cells
}

export function generateMockObservations(cells: Cell[]): Observation[] {
  const observations: Observation[] = []

  cells.forEach((cell) => {
    const observationDays = cell.status === 'empty'
      ? Math.floor(Math.random() * 10) + 5
      : Math.floor(Math.random() * 20) + 15

    for (let i = 0; i < observationDays; i++) {
      const date = getDateDaysAgo(i)
      const hasEmergenceHole = cell.status === 'occupied' && i < observationDays - 3 && Math.random() > 0.7
      const hasSeal = (cell.status === 'occupied' || cell.status === 'underObservation') && Math.random() > 0.4
      const hasBiteMarks = (cell.status === 'occupied' || cell.status === 'underObservation') && Math.random() > 0.5
      const hasVisitors = Math.random() > 0.3

      observations.push({
        id: generateId(),
        cellId: cell.id,
        observationDate: date,
        hasSeal,
        hasBiteMarks,
        hasEmergenceHole,
        visitorTypes: hasVisitors ? randomPickMultiple(VISITORS, 1, 3) : [],
        weather: randomPick(WEATHERS),
        notes: '',
        recorder: randomPick(RECORDERS),
      })
    }
  })

  return observations.sort(
    (a, b) => new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime()
  )
}

export function generateMaterialSuggestion(material: string): string {
  const suggestions: Record<string, string> = {
    bamboo: '建议更换为钻孔木或空心茎，可能更吸引独居蜂',
    wood: '建议检查木材是否过于光滑，可增加纹理或更换为树皮',
    pinecone: '松果可能过于干燥，建议在附近增加水源或更换为苔藓',
    straw: '稻草容易发霉，建议更换为瓦楞纸或增加遮雨设施',
    hollowStem: '建议检查茎干是否被堵塞，可清理后重新放置',
    bark: '树皮可能太硬，建议更换为较软的木材或增加苔藓',
    stone: '石块太硬不适合大多数昆虫，建议更换为木质材料',
    moss: '苔藓可能太湿，建议移到更干燥的位置或更换为松果',
    corrugated: '瓦楞纸容易损坏，建议更换为更耐用的竹子或木材',
    drilledWood: '钻孔木通常很受欢迎，建议检查孔洞大小是否合适',
  }
  return suggestions[material] || '建议尝试更换为其他材料观察效果'
}
