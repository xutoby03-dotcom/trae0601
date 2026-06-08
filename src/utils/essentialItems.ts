import type { Equipment, EquipmentCategory, SceneType } from '../store/types'

interface EssentialCheck {
  category: EquipmentCategory
  label: string
  satisfied: boolean
}

const ESSENTIAL_ITEMS: Record<SceneType, { category: EquipmentCategory; label: string }[]> = {
  mountain_overnight: [
    { category: 'shelter', label: '帐篷' },
    { category: 'sleeping', label: '睡袋' },
    { category: 'sleeping', label: '防潮垫' },
    { category: 'lighting', label: '头灯/手电' },
    { category: 'safety', label: '急救包' },
    { category: 'other', label: '垃圾袋' },
  ],
  beach_bbq: [
    { category: 'shelter', label: '遮阳篷/天幕' },
    { category: 'cooking', label: '炉具' },
    { category: 'cooking', label: '燃料/炭火' },
    { category: 'other', label: '冰桶' },
    { category: 'other', label: '垃圾袋' },
  ],
  family_camping: [
    { category: 'shelter', label: '帐篷' },
    { category: 'sleeping', label: '睡袋' },
    { category: 'sleeping', label: '防潮垫' },
    { category: 'lighting', label: '头灯' },
    { category: 'safety', label: '急救包' },
    { category: 'other', label: '垃圾袋' },
    { category: 'furniture', label: '儿童椅' },
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

  const selectedNames = new Set<string>()

  selectedEquipment.forEach((se) => {
    const eq = allEquipment.find((e) => e.id === se.equipmentId)
    if (eq) {
      selectedNames.add(eq.name)
    }
  })

  return essentials.map((item) => {
    const keyword = item.label.replace(/\/.*/, '')
    const nameSatisfied = Array.from(selectedNames).some((name) =>
      name.includes(keyword)
    )
    return {
      category: item.category,
      label: item.label,
      satisfied: nameSatisfied,
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
