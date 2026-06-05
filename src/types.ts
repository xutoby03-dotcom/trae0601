export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface Formula {
  id: string
  projectId: string
  name: string
  category: string
  latex: string
  fontSize: number
  fontFamily: string
  fontColor: string
  bgColor: string
  createdAt: number
  updatedAt: number
}

export interface Doc {
  id: string
  projectId: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface RenderSettings {
  fontSize: number
  fontFamily: string
  fontColor: string
  bgColor: string
}

export type Theme = 'light' | 'dark'

export const CATEGORIES = [
  '未分类',
  '代数',
  '微积分',
  '线性代数',
  '概率统计',
  '几何',
  '数论',
  '物理',
  '化学',
  '其他',
] as const
