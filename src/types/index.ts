export enum ElementType {
  RECT = 'RECT',
  CIRCLE = 'CIRCLE',
  TRIANGLE = 'TRIANGLE',
  LINE = 'LINE',
  INPUT = 'INPUT',
  BUTTON = 'BUTTON',
  DROPDOWN = 'DROPDOWN',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  SWITCH = 'SWITCH',
  SLIDER = 'SLIDER',
  RATING = 'RATING',
  FILE_UPLOAD = 'FILE_UPLOAD',
  TABLE = 'TABLE',
  FORM_LABEL = 'FORM_LABEL',
  STATUS_BAR = 'STATUS_BAR',
  NAV_BAR = 'NAV_BAR',
  TOP_BAR = 'TOP_BAR',
  BOTTOM_BAR = 'BOTTOM_BAR',
  CARD = 'CARD',
  LIST_ITEM = 'LIST_ITEM',
  DRAWER = 'DRAWER',
  MODAL = 'MODAL',
  AVATAR = 'AVATAR',
  TEXT = 'TEXT',
  ICON = 'ICON',
  IMAGE_PLACEHOLDER = 'IMAGE_PLACEHOLDER',
  CHART_PLACEHOLDER = 'CHART_PLACEHOLDER',
  CUSTOM = 'CUSTOM',
}

export interface CanvasElement {
  id: string
  pageId: string
  parentId: string | null
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
  shadow: string
  text: string
  locked: boolean
  visible: boolean
  zIndex: number
  groupId: string | null
  styleProps: Record<string, any>
  opacity: number
}

export interface Interaction {
  id: string
  elementId: string
  trigger: 'onClick' | 'onHover'
  action: 'navigate'
  targetPageId: string
}

export interface Page {
  id: string
  projectId: string
  name: string
  order: number
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  theme: 'light' | 'dark'
}

export interface CustomComponent {
  id: string
  projectId: string
  name: string
  category: 'basic' | 'form' | 'mobile' | 'common' | 'custom'
  elements: CanvasElement[]
}

export type ComponentCategory = 'basic' | 'form' | 'mobile' | 'common'

export interface ComponentDef {
  type: ElementType
  label: string
  category: ComponentCategory
  defaultWidth: number
  defaultHeight: number
  defaultProps: Partial<CanvasElement>
}

export interface ExportData {
  project: Project
  pages: Page[]
  elements: Record<string, CanvasElement[]>
  interactions: Interaction[]
  customComponents: CustomComponent[]
}
