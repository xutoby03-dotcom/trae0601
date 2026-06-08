import type { SceneTemplate } from '../store/types'

export const sceneTemplates: SceneTemplate[] = [
  {
    id: 'mountain_overnight',
    name: '山里过夜',
    description: '山区露营过夜，需要完善的睡眠系统和保暖装备，注意防风防潮',
    icon: 'Mountain',
    requiredCategories: ['shelter', 'sleeping', 'lighting', 'safety'],
    recommendedItems: [
      { category: 'shelter', itemNames: ['双层帐篷', '地钉', '防风绳'] },
      { category: 'sleeping', itemNames: ['睡袋(-10°C)', '防潮垫', '充气枕头'] },
      { category: 'lighting', itemNames: ['头灯', '营地灯'] },
      { category: 'safety', itemNames: ['急救包', '哨子', '垃圾袋'] },
      { category: 'cooking', itemNames: ['炉具', '气罐', '套锅'] },
      { category: 'furniture', itemNames: ['折叠桌'] },
      { category: 'other', itemNames: ['登山杖', '保温杯'] },
    ],
  },
  {
    id: 'beach_bbq',
    name: '海边烧烤',
    description: '海边休闲烧烤，重点是遮阳和烹饪设备，记得带冰桶保鲜',
    icon: 'Waves',
    requiredCategories: ['shelter', 'cooking', 'safety'],
    recommendedItems: [
      { category: 'shelter', itemNames: ['天幕', '地钉', '遮阳篷'] },
      { category: 'cooking', itemNames: ['烧烤炉', '炭火', '烧烤架', '冰桶', '保鲜箱'] },
      { category: 'safety', itemNames: ['防晒霜', '急救包', '垃圾袋'] },
      { category: 'furniture', itemNames: ['折叠椅', '折叠桌'] },
      { category: 'lighting', itemNames: ['营地灯', '氛围灯'] },
      { category: 'other', itemNames: ['蓝牙音箱', '飞盘'] },
    ],
  },
  {
    id: 'family_camping',
    name: '亲子露营',
    description: '带娃露营，安全第一，备好急救包和儿童专属装备，舒适度要拉满',
    icon: 'Baby',
    requiredCategories: ['shelter', 'sleeping', 'lighting', 'safety', 'furniture'],
    recommendedItems: [
      { category: 'shelter', itemNames: ['家庭帐篷(4-6人)', '天幕', '地垫'] },
      { category: 'sleeping', itemNames: ['睡袋', '防潮垫', '儿童睡袋'] },
      { category: 'lighting', itemNames: ['头灯', '营地灯', '小夜灯'] },
      { category: 'safety', itemNames: ['急救包', '驱蚊液', '垃圾袋'] },
      { category: 'furniture', itemNames: ['儿童椅', '折叠桌', '折叠椅'] },
      { category: 'cooking', itemNames: ['炉具', '套锅', '餐具套装'] },
      { category: 'other', itemNames: ['玩具', '零食箱'] },
    ],
  },
]
