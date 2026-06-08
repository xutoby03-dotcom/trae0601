export type LightPreference = 'full_sun' | 'bright_indirect' | 'medium_indirect' | 'low_light'

export interface Plant {
  id: string
  name: string
  variety: string
  location: string
  waterCycleDays: number
  fertilizeCycleDays: number
  lightPreference: LightPreference
  repotDate: string
  photo: string
  createdAt: string
  lastWateredDate: string
  lastFertilizedDate: string
}

export interface GrowthRecord {
  id: string
  plantId: string
  date: string
  photo: string
  note: string
}

export interface CareTask {
  id: string
  plantId: string
  plantName: string
  plantPhoto: string
  type: 'water' | 'fertilize' | 'repot'
  scheduledDate: string
  completedDate: string | null
  completed: boolean
}

export interface DiagnosisResult {
  symptom: string
  possibleCauses: string[]
  suggestions: string[]
}

export type PlantStatus = 'healthy' | 'needs_water' | 'needs_fertilizer' | 'low_light' | 'needs_repot'

export const LIGHT_LABELS: Record<LightPreference, string> = {
  full_sun: '全日照',
  bright_indirect: '明亮散射光',
  medium_indirect: '中等散射光',
  low_light: '耐阴',
}

export const SYMPTOM_DIAGNOSIS: DiagnosisResult[] = [
  {
    symptom: '叶子发黄',
    possibleCauses: ['浇水过多导致根部腐烂', '光照不足', '营养缺乏（缺氮）', '自然老化（底部老叶）'],
    suggestions: ['检查土壤是否过湿，减少浇水频率', '移至光线更好的位置', '适当施肥补充营养', '摘除黄叶，观察是否蔓延'],
  },
  {
    symptom: '叶子卷边',
    possibleCauses: ['空气湿度过低', '浇水不足', '温度过高或过低', '病虫害'],
    suggestions: ['增加喷雾提高湿度', '检查土壤湿度，及时补水', '避免放在空调/暖气出风口', '检查叶片背面是否有虫害'],
  },
  {
    symptom: '掉叶',
    possibleCauses: ['浇水过多或过少', '环境变化（换位置/换盆）', '光照突变', '温度过低'],
    suggestions: ['保持浇水规律，避免忽干忽湿', '换盆后给植物适应期', '逐步调整光照，避免突然改变', '保持室温在15°C以上'],
  },
  {
    symptom: '叶尖发褐',
    possibleCauses: ['空气湿度过低', '施肥过多（肥害）', '自来水氯气伤害', '浇水不足'],
    suggestions: ['定期喷水或使用加湿器', '减少施肥频率，用清水冲洗土壤', '使用晾置过的水浇灌', '保持土壤适度湿润'],
  },
  {
    symptom: '茎部徒长',
    possibleCauses: ['光照不足', '氮肥过多', '温度过高'],
    suggestions: ['移至光照更充足的位置', '减少氮肥施用', '控制环境温度', '适当修剪促进分枝'],
  },
  {
    symptom: '叶片有斑点',
    possibleCauses: ['真菌感染', '细菌性病害', '浇水时水溅到叶片', '日灼伤'],
    suggestions: ['摘除病叶并隔离', '使用杀菌剂处理', '浇水时避免淋湿叶面', '避免强光直射'],
  },
]
