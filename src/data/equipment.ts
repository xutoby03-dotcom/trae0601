import type { EquipmentItem, EquipmentCategory } from '@/types';

export const EQUIPMENT_CATEGORIES: { key: EquipmentCategory; label: string; icon: string; description: string }[] = [
  { key: 'optics', label: '光学设备', icon: '🔭', description: '望远镜、镜头、目镜等' },
  { key: 'imaging', label: '摄影设备', icon: '📷', description: '相机、滤镜、存储卡等' },
  { key: 'mount', label: '赤道仪/支架', icon: '🧭', description: '赤道仪、三脚架、重锤等' },
  { key: 'accessory', label: '辅助装备', icon: '🔦', description: '红光手电、笔记本、驱蚊等' },
  { key: 'power', label: '电源供给', icon: '🔋', description: '电池、充电宝、电源线等' },
];

export const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  { id: 'op-1', name: '主望远镜', category: 'optics', categoryLabel: '光学设备', essential: true, packed: false },
  { id: 'op-2', name: '寻星镜/红点寻星', category: 'optics', categoryLabel: '光学设备', essential: true, packed: false },
  { id: 'op-3', name: '低倍目镜(25mm/32mm)', category: 'optics', categoryLabel: '光学设备', essential: false, packed: false },
  { id: 'op-4', name: '高倍目镜(10mm/12mm)', category: 'optics', categoryLabel: '光学设备', essential: false, packed: false },
  { id: 'op-5', name: '巴洛镜(2x)', category: 'optics', categoryLabel: '光学设备', essential: false, packed: false },
  { id: 'op-6', name: '双筒望远镜', category: 'optics', categoryLabel: '光学设备', essential: false, packed: false },
  { id: 'op-7', name: 'UHC/LPS光害滤镜', category: 'optics', categoryLabel: '光学设备', essential: false, packed: false },
  { id: 'op-8', name: 'OIII/Ha窄带滤镜', category: 'optics', categoryLabel: '光学设备', essential: false, packed: false },

  { id: 'im-1', name: '主相机(机身)', category: 'imaging', categoryLabel: '摄影设备', essential: true, packed: false },
  { id: 'im-2', name: '相机镜头/转接环', category: 'imaging', categoryLabel: '摄影设备', essential: true, packed: false },
  { id: 'im-3', name: 'SD卡(至少2张，已格式化)', category: 'imaging', categoryLabel: '摄影设备', essential: true, packed: false },
  { id: 'im-4', name: '相机电池(3块以上满电)', category: 'imaging', categoryLabel: '摄影设备', essential: true, packed: false },
  { id: 'im-5', name: '快门线/遥控器', category: 'imaging', categoryLabel: '摄影设备', essential: true, packed: false },
  { id: 'im-6', name: '平场板/白T恤', category: 'imaging', categoryLabel: '摄影设备', essential: false, packed: false },
  { id: 'im-7', name: '镜头布/气吹', category: 'imaging', categoryLabel: '摄影设备', essential: false, packed: false },
  { id: 'im-8', name: '除雾带/加热带', category: 'imaging', categoryLabel: '摄影设备', essential: false, packed: false },

  { id: 'mt-1', name: '赤道仪主体', category: 'mount', categoryLabel: '赤道仪/支架', essential: true, packed: false },
  { id: 'mt-2', name: '三脚架', category: 'mount', categoryLabel: '赤道仪/支架', essential: true, packed: false },
  { id: 'mt-3', name: '重锤(一对)', category: 'mount', categoryLabel: '赤道仪/支架', essential: true, packed: false },
  { id: 'mt-4', name: '重锤杆', category: 'mount', categoryLabel: '赤道仪/支架', essential: true, packed: false },
  { id: 'mt-5', name: '鸠尾板', category: 'mount', categoryLabel: '赤道仪/支架', essential: true, packed: false },
  { id: 'mt-6', name: '内六角扳手套装', category: 'mount', categoryLabel: '赤道仪/支架', essential: false, packed: false },
  { id: 'mt-7', name: '指南针/指北针', category: 'mount', categoryLabel: '赤道仪/支架', essential: false, packed: false },
  { id: 'mt-8', name: '气泡水平仪', category: 'mount', categoryLabel: '赤道仪/支架', essential: false, packed: false },
  { id: 'mt-9', name: '极轴镜', category: 'mount', categoryLabel: '赤道仪/支架', essential: false, packed: false },

  { id: 'ac-1', name: '红光手电(带亮度调节)', category: 'accessory', categoryLabel: '辅助装备', essential: true, packed: false },
  { id: 'ac-2', name: '红光头灯(解放双手)', category: 'accessory', categoryLabel: '辅助装备', essential: true, packed: false },
  { id: 'ac-3', name: '星图/App(离线已下载)', category: 'accessory', categoryLabel: '辅助装备', essential: true, packed: false },
  { id: 'ac-4', name: '笔记本+笔(红光笔)', category: 'accessory', categoryLabel: '辅助装备', essential: false, packed: false },
  { id: 'ac-5', name: '观测椅/折叠凳', category: 'accessory', categoryLabel: '辅助装备', essential: false, packed: false },
  { id: 'ac-6', name: '驱蚊液/防虫喷雾', category: 'accessory', categoryLabel: '辅助装备', essential: false, packed: false },
  { id: 'ac-7', name: '厚外套/毛毯(夜间温差大)', category: 'accessory', categoryLabel: '辅助装备', essential: true, packed: false },
  { id: 'ac-8', name: '热饮/零食', category: 'accessory', categoryLabel: '辅助装备', essential: false, packed: false },
  { id: 'ac-9', name: '创可贴/小药包', category: 'accessory', categoryLabel: '辅助装备', essential: false, packed: false },

  { id: 'pw-1', name: '外接电源(12V大容量)', category: 'power', categoryLabel: '电源供给', essential: true, packed: false },
  { id: 'pw-2', name: '赤道仪电源线', category: 'power', categoryLabel: '电源供给', essential: true, packed: false },
  { id: 'pw-3', name: '充电宝(20000mAh以上)', category: 'power', categoryLabel: '电源供给', essential: false, packed: false },
  { id: 'pw-4', name: '手机充电线', category: 'power', categoryLabel: '电源供给', essential: true, packed: false },
  { id: 'pw-5', name: '相机假电池+电源线', category: 'power', categoryLabel: '电源供给', essential: false, packed: false },
];
