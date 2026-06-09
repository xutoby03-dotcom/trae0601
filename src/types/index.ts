export type ClothingType = '衬衫' | '牛仔裤' | '毛衣' | 'T恤' | '裙子' | '外套'
export type FabricType = '棉' | '麻' | '丝绸' | '羊毛' | '化纤' | '混纺'
export type DamageLocation = '领口' | '袖口' | '膝盖' | '拉链' | '纽扣' | '面料磨损' | '无破损'
export type ClothingGroup = 'easy' | 'missing' | 'inspiration'
export type Difficulty = '简单' | '中等' | '困难'
export type MaterialCategory = '工具' | '辅料' | '布料'
export type ProjectStatus = 'planning' | 'in_progress' | 'completed'

export interface Clothing {
  id: string
  type: ClothingType
  fabric: FabricType
  color: string
  size: string
  damageLocation: DamageLocation
  photo: string
  reason: string
  group: ClothingGroup
  createdAt: string
}

export interface UpcycleIdea {
  id: string
  clothingId: string
  title: string
  description: string
  difficulty: Difficulty
  estimatedTime: string
  requiredMaterialIds: string[]
  steps: string[]
  favorited: boolean
}

export interface Project {
  id: string
  clothingId: string
  ideaId: string
  status: ProjectStatus
  startedAt: string
  completedAt: string | null
  customSteps: ProjectStep[]
  beforePhoto: string
  afterPhoto: string
}

export interface ProjectStep {
  id: string
  description: string
  photo: string
  completed: boolean
  order: number
}

export interface Material {
  id: string
  name: string
  category: MaterialCategory
  owned: boolean
  icon: string
}
