import type { Equipment, EquipmentCategory, SceneType } from '../store/types'

interface EssentialCheck {
  category: EquipmentCategory
  label: string
  satisfied: boolean
}

interface EssentialItem {
  category: EquipmentCategory
  label: string
  keywords: string[]
}

const ESSENTIAL_ITEMS: Record<SceneType, EssentialItem[]> = {
  mountain_overnight: [
    { category: 'shelter', label: '帐篷', keywords: ['帐篷'] },
    { category: 'sleeping', label: '睡袋', keywords: ['睡袋'] },
    { category: 'sleeping', label: '防潮垫', keywords: ['防潮垫', '地垫', '垫子'] },
    { category: 'lighting', label: '头灯/手电', keywords: ['头灯', '手电', '电筒'] },
    { category: 'safety', label: '急救包', keywords: ['急救'] },
    { category: 'other', label: '垃圾袋', keywords: ['垃圾'] },
  ],
  beach_bbq: [
    { category: 'shelter', label: '遮阳篷/天幕', keywords: ['天幕', '遮阳', '阳篷'] },
    { category: 'cooking', label: '炉具', keywords: ['炉', '灶'] },
    { category: 'cooking', label: '燃料/炭火', keywords: ['气罐', '燃料', '炭', '柴'] },
    { category: 'other', label: '冰桶', keywords: ['冰桶', '冷藏', '保温箱'] },
    { category: 'other', label: '垃圾袋', keywords: ['垃圾'] },
  ],
  family_camping: [
    { category: 'shelter', label: '帐篷', keywords: ['帐篷'] },
    { category: 'sleeping', label: '睡袋', keywords: ['睡袋'] },
    { category: 'sleeping', label: '防潮垫', keywords: ['防潮垫', '地垫', '垫子'] },
    { category: 'lighting', label: '头灯', keywords: ['头灯', '手电', '电筒'] },
    { category: 'safety', label: '急救包', keywords: ['急救'] },
    { category: 'other', label: '垃圾袋', keywords: ['垃圾'] },
    { category: 'furniture', label: '儿童椅', keywords: ['儿童椅', '小孩椅'] },
  ],
  custom: [],
}

export function checkEssentials(
  selectedEquipment: { equipmentId: string; quantity: number }[],
  allEquipment: Equipment[],
  scene: SceneType
): EssentialCheck[] {
  const essentials = ESSENTIAL_ITEMS[scene]
  if (!essentials.length) return []

  const selectedNames: string[] = []

  selectedEquipment.forEach((se) => {
    const eq = allEquipment.find((e) => e.id === se.equipmentId)
    if (eq) {
      selectedNames.push(eq.name)
    }
  })

  return essentials.map((item) => {
    const satisfied = item.keywords.some((kw) =>
      selectedNames.some((name) => name.includes(kw))
    )
    return {
      category: item.category,
      label: item.label,
      satisfied,
    }
  })
}

export function getMissingEssentials(
  selectedEquipment: { equipmentId: string; quantity: number }[],
  allEquipment: Equipment[],
  scene: SceneType
): EssentialCheck[] {
  return checkEssentials(selectedEquipment, allEquipment, scene).filter(
    (item) => !item.satisfied
  )
}
