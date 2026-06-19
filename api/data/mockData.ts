import type { Product, Sample, Incident, ProductCategory, SampleStatus, IncidentType, IncidentStatus } from "../../shared/types.js";

const generateId = () => Math.random().toString(36).substring(2, 10);

const hoursFromNow = (hours: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

const daysAgo = (days: number, hours = 0, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() + hours);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
};

export const products: Product[] = [
  {
    id: generateId(),
    name: "招牌卤鸡爪",
    category: "chicken_feet" as ProductCategory,
    formulaBatch: "PF-20260620-A1",
    processor: "张师傅",
    cookTime: daysAgo(0, 6),
    salesWindow: "窗口A-1号",
    photoUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=braised%20chicken%20feet%20Chinese%20style%20dark%20soy%20sauce%20food%20photography&image_size=square",
    isOnSale: true,
    hasSample: true,
    createdAt: daysAgo(0, 6),
  },
  {
    id: generateId(),
    name: "麻辣鸭脖",
    category: "duck_neck" as ProductCategory,
    formulaBatch: "PF-20260620-B2",
    processor: "李师傅",
    cookTime: daysAgo(0, 7),
    salesWindow: "窗口A-2号",
    photoUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spicy%20braised%20duck%20neck%20Chinese%20snack%20food%20photography&image_size=square",
    isOnSale: true,
    hasSample: true,
    createdAt: daysAgo(0, 7),
  },
  {
    id: generateId(),
    name: "五香豆干",
    category: "tofu" as ProductCategory,
    formulaBatch: "PF-20260620-C3",
    processor: "王师傅",
    cookTime: daysAgo(0, 8),
    salesWindow: "窗口B-1号",
    photoUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=braised%20spiced%20dried%20tofu%20Chinese%20snack%20food%20photography&image_size=square",
    isOnSale: false,
    hasSample: false,
    createdAt: daysAgo(0, 8),
  },
  {
    id: generateId(),
    name: "卤鸭翅",
    category: "other" as ProductCategory,
    formulaBatch: "PF-20260619-D1",
    processor: "张师傅",
    cookTime: daysAgo(1, 6),
    salesWindow: "窗口A-3号",
    photoUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=braised%20duck%20wings%20Chinese%20style%20food%20photography&image_size=square",
    isOnSale: true,
    hasSample: true,
    createdAt: daysAgo(1, 6),
  },
  {
    id: generateId(),
    name: "老卤鸡爪",
    category: "chicken_feet" as ProductCategory,
    formulaBatch: "PF-20260619-A2",
    processor: "李师傅",
    cookTime: daysAgo(1, 7),
    salesWindow: "窗口A-1号",
    photoUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20braised%20chicken%20feet%20dark%20sauce%20food%20photography&image_size=square",
    isOnSale: true,
    hasSample: true,
    createdAt: daysAgo(1, 7),
  },
];

const pIds = products.map((p) => p.id);

export const samples: Sample[] = [
  {
    id: generateId(),
    productId: pIds[0],
    weight: 150,
    containerNo: "C-001",
    fridgeSlot: "1-A",
    startTime: daysAgo(0, 6, 30),
    expireTime: hoursFromNow(45),
    status: "active" as SampleStatus,
  },
  {
    id: generateId(),
    productId: pIds[1],
    weight: 200,
    containerNo: "C-002",
    fridgeSlot: "1-B",
    startTime: daysAgo(0, 7, 30),
    expireTime: hoursFromNow(46),
    status: "active" as SampleStatus,
  },
  {
    id: generateId(),
    productId: pIds[3],
    weight: 180,
    containerNo: "C-003",
    fridgeSlot: "2-A",
    startTime: daysAgo(1, 6, 30),
    expireTime: hoursFromNow(20),
    status: "expiring" as SampleStatus,
  },
  {
    id: generateId(),
    productId: pIds[4],
    weight: 150,
    containerNo: "C-004",
    fridgeSlot: "1-C",
    startTime: daysAgo(1, 7, 30),
    expireTime: hoursFromNow(10),
    status: "expiring" as SampleStatus,
  },
  {
    id: generateId(),
    productId: pIds[0],
    weight: 160,
    containerNo: "C-005",
    fridgeSlot: "2-B",
    startTime: daysAgo(2, 6),
    expireTime: daysAgo(0, 5),
    status: "expired" as SampleStatus,
  },
  {
    id: generateId(),
    productId: pIds[1],
    weight: 190,
    containerNo: "C-006",
    fridgeSlot: "3-A",
    startTime: daysAgo(3, 7),
    expireTime: daysAgo(1, 6),
    status: "destroyed" as SampleStatus,
    destructionPhoto:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20waste%20disposal%20trash%20bin%20kitchen&image_size=square",
    destructionPerson: "张师傅",
    destructionTime: daysAgo(1, 6, 30),
  },
];

samples.forEach((s) => {
  const p = products.find((prod) => prod.id === s.productId);
  if (p) s.product = p;
});

export const incidents: Incident[] = [
  {
    id: generateId(),
    type: "complaint" as IncidentType,
    description: "顾客反映购买的卤鸡爪口感偏咸，要求换货",
    sampleId: samples[0].id,
    occurTime: daysAgo(0, 10),
    reporter: "收银员小王",
    status: "investigating" as IncidentStatus,
  },
  {
    id: generateId(),
    type: "temperature" as IncidentType,
    description: "冷藏柜温度显示8°C，超过标准4°C阈值，已调整",
    sampleId: samples[2].id,
    occurTime: daysAgo(1, 14),
    reporter: "晚班值班",
    status: "resolved" as IncidentStatus,
  },
  {
    id: generateId(),
    type: "odor" as IncidentType,
    description: "员工巡检时闻到样品柜有轻微异味，已排查通风系统",
    sampleId: undefined,
    occurTime: daysAgo(2, 9),
    reporter: "质量员小李",
    status: "pending" as IncidentStatus,
  },
];

incidents.forEach((i) => {
  if (i.sampleId) {
    const s = samples.find((sa) => sa.id === i.sampleId);
    if (s) i.sample = s;
  }
});
