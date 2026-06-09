export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function getWeekDates(offset: number = 0): string[] {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  monday.setDate(monday.getDate() + offset * 7)

  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function getDayName(dateStr: string): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date(dateStr).getDay()]
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

export const PREFERENCE_OPTIONS = ['咸口', '甜口', '辣', '清淡', '快节奏', '养胃']
export const ALLERGY_OPTIONS = ['花生', '海鲜', '牛奶', '鸡蛋', '坚果', '辣', '葱蒜']
export const AVATARS = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶']
export const RECIPE_ICONS = ['🥪', '🥣', '🍳', '🥛', '🍎', '🥞', '🥯', '🍞', '🥚', '🫔', '🥗', '🍲']
export const INGREDIENT_CATEGORIES = ['主食', '蛋类', '肉类', '蔬菜', '水果', '乳制品', '饮品', '调味品', '其他']
export const UNITS = ['个', '盒', '袋', '斤', '包', '棵', '片', '块', '瓶', '根', '碗']
