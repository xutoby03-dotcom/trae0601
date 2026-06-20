import type { FamilyMember, DryingRecord, BalconyProfile, WeatherData } from "@/types";

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const hoursLater = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();

export const mockMembers: FamilyMember[] = [
  { id: "m1", name: "爸爸", avatar: "👨", color: "#4A90D9" },
  { id: "m2", name: "妈妈", avatar: "👩", color: "#EE5253" },
  { id: "m3", name: "小明", avatar: "👦", color: "#1DD1A1" },
  { id: "m4", name: "小红", avatar: "👧", color: "#FF9F43" },
];

export const mockDryingRecords: DryingRecord[] = [
  {
    id: "d1",
    clothingType: "被套",
    quantity: 2,
    location: "主卧晾衣杆",
    startTime: hoursAgo(26),
    expectedTime: hoursAgo(2),
    owner: "妈妈",
    ownerId: "m2",
    status: "drying",
    notes: "纯棉被套，厚款",
  },
  {
    id: "d2",
    clothingType: "床单",
    quantity: 3,
    location: "客厅阳台外杆",
    startTime: hoursAgo(3),
    expectedTime: hoursLater(2),
    owner: "爸爸",
    ownerId: "m1",
    status: "drying",
  },
  {
    id: "d3",
    clothingType: "T恤",
    quantity: 5,
    location: "次卧晾衣杆",
    startTime: hoursAgo(1),
    expectedTime: hoursLater(3),
    owner: "小明",
    ownerId: "m3",
    status: "drying",
  },
  {
    id: "d4",
    clothingType: "内衣",
    quantity: 8,
    location: "阳台晾衣夹区",
    startTime: hoursAgo(5),
    expectedTime: hoursLater(1),
    owner: "小红",
    ownerId: "m4",
    status: "drying",
  },
  {
    id: "d5",
    clothingType: "牛仔裤",
    quantity: 2,
    location: "客厅阳台外杆",
    startTime: hoursAgo(30),
    expectedTime: hoursAgo(6),
    owner: "爸爸",
    ownerId: "m1",
    status: "collected",
    collectedAt: hoursAgo(5),
    isDry: true,
    isDamp: false,
    needRewash: false,
  },
  {
    id: "d6",
    clothingType: "毛衣",
    quantity: 1,
    location: "主卧晾衣杆",
    startTime: hoursAgo(50),
    expectedTime: hoursAgo(26),
    owner: "妈妈",
    ownerId: "m2",
    status: "collected",
    collectedAt: hoursAgo(25),
    isDry: true,
    isDamp: true,
    needRewash: false,
  },
  {
    id: "d7",
    clothingType: "浴巾",
    quantity: 3,
    location: "浴室门口",
    startTime: hoursAgo(10),
    expectedTime: hoursAgo(2),
    owner: "小明",
    ownerId: "m3",
    status: "rewash",
    collectedAt: hoursAgo(1),
    isDry: false,
    isDamp: true,
    needRewash: true,
  },
];

export const mockBalcony: BalconyProfile = {
  id: "b1",
  orientation: "朝南",
  isSealed: false,
  poleCount: 4,
  rainCover: "有可伸缩遮雨棚",
  ventilation: "通风良好，南北通透",
  notes: "阳台正对小区花园，上午9点至下午4点有阳光直射",
};

export const mockWeather: WeatherData = {
  timestamp: new Date().toISOString(),
  temperature: 26,
  humidity: 78,
  windSpeed: 12.5,
  rainProbability: 65,
  weatherType: "cloudy",
  riskLevel: 3,
  riskReasons: ["降雨概率65%，预计2小时内有阵雨", "风力较大，可能吹落衣物", "湿度偏高，晾晒速度减缓"],
};

export const clothingTypes = [
  "T恤",
  "衬衫",
  "裤子",
  "牛仔裤",
  "内衣",
  "袜子",
  "床单",
  "被套",
  "枕套",
  "毛巾",
  "浴巾",
  "毛衣",
  "外套",
  "羽绒服",
  "裙子",
  "其他",
];

export const locations = [
  "主卧晾衣杆",
  "次卧晾衣杆",
  "客厅阳台内杆",
  "客厅阳台外杆",
  "阳台晾衣夹区",
  "浴室门口",
  "窗户护栏",
  "楼顶露台",
];

export const orientations = ["朝东", "朝南", "朝西", "朝北", "东南", "西南", "东北", "西北"];

export const rainCovers = ["无遮雨设施", "有固定遮雨棚", "有可伸缩遮雨棚", "半遮雨结构", "全封闭玻璃"];

export const ventilations = ["通风较差", "通风一般", "通风良好", "南北通透", "风口位置"];
