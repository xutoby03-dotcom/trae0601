import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "T001",
    name: "林雅琴",
    role: "teacher",
    phone: "13800138001",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20violin%20teacher%20portrait%20photo&image_size=square",
  },
  {
    id: "T002",
    name: "王思月",
    role: "teacher",
    phone: "13800138002",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20cello%20teacher%20portrait%20photo&image_size=square",
  },
  {
    id: "T003",
    name: "陈鹏飞",
    role: "teacher",
    phone: "13800138003",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20flute%20teacher%20portrait%20photo&image_size=square",
  },
  {
    id: "T004",
    name: "赵明珠",
    role: "teacher",
    phone: "13800138004",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20drum%20teacher%20portrait%20photo&image_size=square",
  },
  {
    id: "T005",
    name: "孙浩然",
    role: "teacher",
    phone: "13800138005",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20piano%20teacher%20portrait%20photo&image_size=square",
  },
  {
    id: "T006",
    name: "周雨萱",
    role: "teacher",
    phone: "13800138006",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20guzheng%20teacher%20portrait%20photo&image_size=square",
  },
  {
    id: "T007",
    name: "吴志强",
    role: "teacher",
    phone: "13800138007",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20piano%20teacher%20middle%20aged%20portrait%20photo&image_size=square",
  },
  {
    id: "T008",
    name: "郑晓梅",
    role: "teacher",
    phone: "13800138008",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20erhu%20teacher%20portrait%20photo&image_size=square",
  },
  {
    id: "R001",
    name: "李建国",
    role: "repair_staff",
    phone: "13900139001",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20repair%20technician%20middle%20aged%20portrait%20photo&image_size=square",
  },
  {
    id: "R002",
    name: "张卫国",
    role: "repair_staff",
    phone: "13900139002",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20piano%20repair%20technician%20portrait%20photo&image_size=square",
  },
  {
    id: "R003",
    name: "黄丽华",
    role: "repair_staff",
    phone: "13900139003",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20instrument%20repair%20technician%20portrait%20photo&image_size=square",
  },
  {
    id: "A001",
    name: "刘德昌",
    role: "admin",
    phone: "13700137001",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20school%20principal%20portrait%20photo&image_size=square",
  },
  {
    id: "A002",
    name: "何文婷",
    role: "admin",
    phone: "13700137002",
    avatar:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20school%20administrator%20portrait%20photo&image_size=square",
  },
];

export const teachers = mockUsers.filter((u) => u.role === "teacher");
export const repairStaff = mockUsers.filter((u) => u.role === "repair_staff");
export const admins = mockUsers.filter((u) => u.role === "admin");

export const getUserById = (id: string) =>
  mockUsers.find((u) => u.id === id);
