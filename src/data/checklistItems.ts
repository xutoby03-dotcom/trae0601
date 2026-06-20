import { CheckItem, CheckCategory } from '@/types';

const genId = () => Math.random().toString(36).slice(2, 10);

export interface ChecklistGroup {
  category: CheckCategory;
  title: string;
  subtitle: string;
  icon: string;
  items: Omit<CheckItem, 'id' | 'category' | 'status' | 'notes'>[];
}

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    category: 'appearance',
    title: '外观检查',
    subtitle: '镜身、卡口、螺丝痕迹',
    icon: 'camera',
    items: [
      { itemName: '镜身划痕与掉漆', description: '检查镜身是否有明显划痕、掉漆、磕碰凹痕' },
      { itemName: '镜身变形', description: '检查镜身是否有弯曲、变形等物理损伤' },
      { itemName: '卡口磨损情况', description: '检查金属卡口磨损程度，是否有松动' },
      { itemName: '螺丝痕迹', description: '检查固定螺丝是否有拧动痕迹（暗示维修史）' },
      { itemName: '变焦/对焦环', description: '检查阻尼是否均匀顺畅，有无卡顿或过松' },
      { itemName: '触点清洁度', description: '检查电子触点是否氧化、腐蚀' },
    ],
  },
  {
    category: 'optics',
    title: '镜片检查',
    subtitle: '霉斑、灰尘、划痕、脱膜',
    icon: 'eye',
    items: [
      { itemName: '霉斑', description: '强光下检查镜片内部是否有蛛网状或点状霉斑（高风险）' },
      { itemName: '镜片内部灰尘', description: '检查内部灰尘数量，少量灰尘属正常' },
      { itemName: '镜片表面划痕', description: '检查前后镜片表面是否有可见划痕' },
      { itemName: '脱膜/镀膜老化', description: '检查镜片表面是否有彩色斑块、脱膜迹象' },
      { itemName: '镜片起雾', description: '检查内部是否有雾气或油渍凝结' },
      { itemName: '胶合松动', description: '轻摇听是否有内部零件松动声音' },
    ],
  },
  {
    category: 'aperture',
    title: '光圈叶片检查',
    subtitle: '油迹、开合顺畅度、均匀度',
    icon: 'aperture',
    items: [
      { itemName: '叶片油迹', description: '检查叶片上是否有润滑油渗出（光圈油是常见问题）' },
      { itemName: '开合顺畅度', description: '测试光圈从最大到最小开合是否顺畅无卡顿' },
      { itemName: '叶片均匀度', description: '检查光圈收缩时形状是否规则对称' },
      { itemName: '叶片数量', description: '记录叶片数量（影响散景效果）' },
    ],
  },
  {
    category: 'af',
    title: '自动对焦检查',
    subtitle: '速度、精度、对焦漂移',
    icon: 'focus',
    items: [
      { itemName: 'AF速度', description: '测试不同光线条件下对焦速度是否正常' },
      { itemName: 'AF精度', description: '对同一目标多次对焦，检查是否都能准确合焦' },
      { itemName: '对焦漂移/跑焦', description: '测试前后移动后再对焦是否存在前后漂移' },
      { itemName: '对焦噪音', description: '对焦时是否有异响或过大噪音' },
      { itemName: '连续AF', description: '测试连续对焦（AF-C）追焦是否稳定' },
    ],
  },
  {
    category: 'extreme_focus',
    title: '极限对焦检查',
    subtitle: '无限远、最近对焦距离',
    icon: 'target',
    items: [
      { itemName: '无限远合焦', description: '对准远处物体（>500m）测试是否能准确合焦，焦点是否超过无限远标记' },
      { itemName: '最近对焦距离', description: '测试是否能达到标称最近对焦距离' },
      { itemName: '微距功能', description: '如镜头支持微距，检查近摄时成像是否清晰' },
    ],
  },
  {
    category: 'samples',
    title: '样张拍摄',
    subtitle: '不同光圈、中心/边角/暗角',
    icon: 'image',
    items: [
      { itemName: '最大光圈中心画质', description: '全开光圈拍摄中心区域分辨率' },
      { itemName: '最大光圈边角画质', description: '全开光圈拍摄四角是否有明显崩边、色散' },
      { itemName: 'f/4-f/5.6画质', description: '常用光圈档位的整体画质表现' },
      { itemName: '小光圈衍射', description: 'f/11-f/16时衍射对画质的影响' },
      { itemName: '暗角表现', description: '检查全开时是否有明显四角失光' },
      { itemName: '眩光/鬼影', description: '逆光拍摄检查是否有明显眩光和鬼影' },
    ],
  },
];

export function createInitialCheckItems(): CheckItem[] {
  const items: CheckItem[] = [];
  for (const group of CHECKLIST_GROUPS) {
    for (const item of group.items) {
      items.push({
        id: genId(),
        category: group.category,
        itemName: item.itemName,
        description: item.description,
        status: 'untested',
        notes: '',
      });
    }
  }
  return items;
}

export const LENS_BRANDS = [
  'Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'Olympus',
  'Sigma', 'Tamron', 'Tokina', 'Voigtländer', 'Zeiss', 'Leica',
  'Samyang', 'Rokinon', 'Pentax', '其他',
];

export const LENS_MOUNTS = [
  'Canon EF', 'Canon RF', 'Nikon F', 'Nikon Z', 'Sony E', 'Sony A',
  'Fujifilm X', 'Fujifilm GFX', 'Micro Four Thirds', 'Leica M',
  'Leica L', 'Pentax K', 'Hasselblad XCD', '其他',
];

export const CONDITIONS = [
  { label: '99新 / 准新', value: 'mint', discount: 0.95 },
  { label: '95新 / 几乎无使用痕迹', value: 'excellent', discount: 0.9 },
  { label: '9成新 / 轻微使用痕迹', value: 'good', discount: 0.8 },
  { label: '8成新 / 明显使用痕迹', value: 'fair', discount: 0.7 },
  { label: '7成新及以下 / 外观较旧', value: 'poor', discount: 0.6 },
];

export const PURCHASE_CHANNELS = [
  '闲鱼', '淘宝二手', '转转', '脸书/FB Marketplace',
  '本地实体店', '摄影器材店二手', '朋友转让', '展会/跳蚤市场', '其他',
];

export const APERTURES = ['最大光圈', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16'];
