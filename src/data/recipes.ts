import type { Recipe } from "@/types";

export const RECIPES: Recipe[] = [
  {
    id: "r1",
    name: "番茄炒蛋",
    icon: "🍳",
    difficulty: "easy",
    ingredients: [
      { name: "番茄", category: "vegetable", quantity: 2, unit: "个" },
      { name: "鸡蛋", category: "other", quantity: 3, unit: "个" },
      { name: "盐", category: "condiment", quantity: 1, unit: "包" },
    ],
    instructions: ["鸡蛋打散加少许盐搅匀", "番茄切块", "热锅倒油先炒鸡蛋盛出", "再加油炒番茄出汁", "倒回鸡蛋翻炒均匀即可"],
  },
  {
    id: "r2",
    name: "番茄鸡蛋面",
    icon: "🍜",
    difficulty: "easy",
    ingredients: [
      { name: "面条", category: "grain", quantity: 1, unit: "包" },
      { name: "番茄", category: "vegetable", quantity: 1, unit: "个" },
      { name: "鸡蛋", category: "other", quantity: 2, unit: "个" },
    ],
    instructions: ["番茄切块炒出汁", "加水烧开下面条", "打入鸡蛋煮成荷包蛋", "调味出锅"],
  },
  {
    id: "r3",
    name: "水果沙拉",
    icon: "🥗",
    difficulty: "easy",
    ingredients: [
      { name: "苹果", category: "fruit", quantity: 1, unit: "个" },
      { name: "香蕉", category: "fruit", quantity: 1, unit: "根" },
      { name: "酸奶", category: "dairy", quantity: 1, unit: "瓶" },
    ],
    instructions: ["水果切块", "倒入酸奶拌匀", "可加蜂蜜调味"],
  },
  {
    id: "r4",
    name: "牛奶燕麦",
    icon: "🥣",
    difficulty: "easy",
    ingredients: [
      { name: "牛奶", category: "dairy", quantity: 1, unit: "瓶" },
      { name: "燕麦", category: "grain", quantity: 1, unit: "包" },
    ],
    instructions: ["牛奶加热", "加入燕麦搅拌", "焖2分钟即可"],
  },
  {
    id: "r5",
    name: "蒜蓉西兰花",
    icon: "🥦",
    difficulty: "easy",
    ingredients: [
      { name: "西兰花", category: "vegetable", quantity: 1, unit: "个" },
      { name: "蒜", category: "condiment", quantity: 3, unit: "瓣" },
    ],
    instructions: ["西兰花掰小朵焯水", "蒜切末", "热油爆香蒜末", "倒入西兰花翻炒调味"],
  },
  {
    id: "r6",
    name: "可乐鸡翅",
    icon: "🍗",
    difficulty: "medium",
    ingredients: [
      { name: "鸡翅", category: "meat", quantity: 8, unit: "个" },
      { name: "可乐", category: "drink", quantity: 1, unit: "瓶" },
      { name: "酱油", category: "condiment", quantity: 1, unit: "瓶" },
    ],
    instructions: ["鸡翅划刀焯水", "热锅煎至两面金黄", "倒入可乐和酱油", "大火烧开转小火炖20分钟", "大火收汁即可"],
  },
  {
    id: "r7",
    name: "香蕉牛奶",
    icon: "🥤",
    difficulty: "easy",
    ingredients: [
      { name: "香蕉", category: "fruit", quantity: 1, unit: "根" },
      { name: "牛奶", category: "dairy", quantity: 1, unit: "瓶" },
    ],
    instructions: ["香蕉切段", "和牛奶一起放入搅拌机", "搅拌均匀即可饮用"],
  },
  {
    id: "r8",
    name: "红烧排骨",
    icon: "🍖",
    difficulty: "medium",
    ingredients: [
      { name: "排骨", category: "meat", quantity: 1, unit: "斤" },
      { name: "酱油", category: "condiment", quantity: 1, unit: "瓶" },
      { name: "姜", category: "condiment", quantity: 1, unit: "块" },
    ],
    instructions: ["排骨焯水去血沫", "热锅炒糖色", "放入排骨翻炒上色", "加酱油和水没过排骨", "小火炖40分钟", "大火收汁"],
  },
  {
    id: "r9",
    name: "蔬菜炒饭",
    icon: "🍚",
    difficulty: "easy",
    ingredients: [
      { name: "米饭", category: "grain", quantity: 1, unit: "盒" },
      { name: "鸡蛋", category: "other", quantity: 2, unit: "个" },
      { name: "胡萝卜", category: "vegetable", quantity: 1, unit: "根" },
    ],
    instructions: ["鸡蛋炒散盛出", "胡萝卜切丁炒软", "倒入米饭翻炒", "加鸡蛋和调料翻炒均匀"],
  },
  {
    id: "r10",
    name: "酸奶水果杯",
    icon: "🫐",
    difficulty: "easy",
    ingredients: [
      { name: "酸奶", category: "dairy", quantity: 1, unit: "瓶" },
      { name: "蓝莓", category: "fruit", quantity: 1, unit: "盒" },
      { name: "蜂蜜", category: "condiment", quantity: 1, unit: "瓶" },
    ],
    instructions: ["杯中先倒入酸奶", "放上蓝莓", "淋上蜂蜜即可"],
  },
  {
    id: "r11",
    name: "清炒时蔬",
    icon: "🥬",
    difficulty: "easy",
    ingredients: [
      { name: "青菜", category: "vegetable", quantity: 1, unit: "斤" },
      { name: "蒜", category: "condiment", quantity: 2, unit: "瓣" },
    ],
    instructions: ["青菜洗净沥干", "热油爆香蒜末", "大火快炒青菜", "加盐调味出锅"],
  },
  {
    id: "r12",
    name: "三明治",
    icon: "🥪",
    difficulty: "easy",
    ingredients: [
      { name: "面包", category: "grain", quantity: 2, unit: "个" },
      { name: "鸡蛋", category: "other", quantity: 1, unit: "个" },
      { name: "生菜", category: "vegetable", quantity: 2, unit: "片" },
    ],
    instructions: ["鸡蛋煎成荷包蛋", "面包烤至微焦", "依次放上生菜和荷包蛋", "盖上另一片面包"],
  },
];
