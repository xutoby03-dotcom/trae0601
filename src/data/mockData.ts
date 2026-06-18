import {
  Order,
  Employee,
  ServicePackage,
  Pet,
  OrderStep,
  StepType,
  STEP_META,
  Abnormality,
} from "@/types";
import { addMinutes } from "@/utils/time";

const now = new Date();

export const mockEmployees: Employee[] = [
  {
    id: "e1",
    name: "小美",
    role: "groomer",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    currentLoad: 1,
  },
  {
    id: "e2",
    name: "阿杰",
    role: "groomer",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    currentLoad: 2,
  },
  {
    id: "e3",
    name: "莉莉",
    role: "receptionist",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    currentLoad: 0,
  },
  {
    id: "e4",
    name: "大壮",
    role: "groomer",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    currentLoad: 1,
  },
];

export const mockPackages: ServicePackage[] = [
  {
    id: "p1",
    name: "精致洗剪吹套餐",
    price: 198,
    durationMinutes: 85,
    repurchaseCount: 328,
    description: "包含洗澡、吹干、造型修剪、耳爪护理",
  },
  {
    id: "p2",
    name: "基础洗护套餐",
    price: 98,
    durationMinutes: 45,
    repurchaseCount: 256,
    description: "包含洗澡、吹干、基础梳理",
  },
  {
    id: "p3",
    name: "SPA深度护理",
    price: 298,
    durationMinutes: 120,
    repurchaseCount: 189,
    description: "药浴SPA+按摩+全套洗护修剪",
  },
  {
    id: "p4",
    name: "幼犬首次洗护",
    price: 68,
    durationMinutes: 40,
    repurchaseCount: 145,
    description: "专为幼犬设计的温和洗护体验",
  },
  {
    id: "p5",
    name: "猫咪专用洗护",
    price: 158,
    durationMinutes: 60,
    repurchaseCount: 98,
    description: "猫咪专用低应激洗护流程",
  },
  {
    id: "p6",
    name: "大型犬豪华套餐",
    price: 388,
    durationMinutes: 150,
    repurchaseCount: 76,
    description: "大型犬专属全套洗护造型",
  },
];

function createSteps(
  orderId: string,
  completedUpTo: number,
  inProgressIdx: number | null
): OrderStep[] {
  const types: StepType[] = [
    "reception",
    "bath",
    "dry",
    "trim",
    "ear_paw_care",
    "photo_delivery",
  ];
  return types.map((t, idx) => {
    let status: OrderStep["status"] = "pending";
    let startTime: Date | undefined;
    let endTime: Date | undefined;
    let employeeId: string | undefined;

    if (idx < completedUpTo) {
      status = "completed";
      startTime = addMinutes(now, -60 + idx * 10);
      endTime = addMinutes(startTime, STEP_META[t].estimatedMinutes);
      employeeId = mockEmployees[idx % 2].id;
    } else if (inProgressIdx !== null && idx === inProgressIdx) {
      status = "in_progress";
      startTime = addMinutes(now, -5);
      employeeId = mockEmployees[idx % 2].id;
    }

    return {
      id: `${orderId}-step-${t}`,
      orderId,
      stepType: t,
      status,
      startTime,
      endTime,
      employeeId,
      photoUrl:
        status === "completed"
          ? `https://images.unsplash.com/photo-${1500000000000 + idx * 1000}?w=400&h=300&fit=crop`
          : undefined,
    };
  });
}

function createPet(
  idx: number,
  name: string,
  breed: string,
  weight: number
): Pet {
  const photos = [
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=400&fit=crop",
  ];
  const hairs: Pet["hairLength"][] = ["short", "medium", "long"];
  const allergieOptions = [["无"], ["鸡肉"], ["牛肉", "尘螨"], ["海鲜"]];
  const tempOptions = ["亲人乖巧，不怕生", "有点胆小，需要慢慢来", "活泼好动", "对陌生人警惕"];

  return {
    id: `pet-${idx}`,
    name,
    breed,
    weight,
    hairLength: hairs[idx % 3],
    allergies: allergieOptions[idx % allergieOptions.length],
    temperament: tempOptions[idx % tempOptions.length],
    photoUrl: photos[idx % photos.length],
    createdAt: addMinutes(now, -idx * 30),
  };
}

function createAbnormalities(orderId: string, idx: number): Abnormality[] {
  if (idx === 1) {
    return [
      {
        id: `ab-${orderId}-1`,
        orderId,
        type: "severe_matting",
        description: "后腿内侧毛发打结严重，需要耐心梳理",
        notifiedOwner: true,
        createdAt: addMinutes(now, -40),
      },
    ];
  }
  if (idx === 3) {
    return [
      {
        id: `ab-${orderId}-2`,
        orderId,
        type: "skin_redness",
        description: "腹部发现少量红点，疑似过敏",
        notifiedOwner: true,
        createdAt: addMinutes(now, -25),
      },
    ];
  }
  return [];
}

export const mockOrders: Order[] = [
  {
    id: "o1",
    petId: "pet-1",
    pet: createPet(0, "豆豆", "柯基", 10.5),
    queueNumber: "A001",
    status: "in_progress",
    packageId: "p1",
    package: mockPackages[0],
    steps: createSteps("o1", 3, 3),
    abnormalities: [],
    createdAt: addMinutes(now, -55),
    estimatedFinish: addMinutes(now, 30),
    ownerPhone: "138****1234",
  },
  {
    id: "o2",
    petId: "pet-2",
    pet: createPet(1, "奶茶", "比熊", 5.2),
    queueNumber: "A002",
    status: "in_progress",
    packageId: "p1",
    package: mockPackages[0],
    steps: createSteps("o2", 2, 2),
    abnormalities: createAbnormalities("o2", 1),
    createdAt: addMinutes(now, -45),
    estimatedFinish: addMinutes(now, 40),
    ownerPhone: "139****5678",
  },
  {
    id: "o3",
    petId: "pet-3",
    pet: createPet(2, "布丁", "金毛", 28),
    queueNumber: "A003",
    status: "queuing",
    packageId: "p6",
    package: mockPackages[5],
    steps: createSteps("o3", 0, null),
    abnormalities: [],
    createdAt: addMinutes(now, -20),
    estimatedFinish: addMinutes(now, 150),
    ownerPhone: "137****9012",
  },
  {
    id: "o4",
    petId: "pet-4",
    pet: createPet(3, "咪咪", "英短", 4.1),
    queueNumber: "A004",
    status: "in_progress",
    packageId: "p5",
    package: mockPackages[4],
    steps: createSteps("o4", 1, 1),
    abnormalities: createAbnormalities("o4", 3),
    createdAt: addMinutes(now, -35),
    estimatedFinish: addMinutes(now, 25),
    ownerPhone: "136****3456",
  },
  {
    id: "o5",
    petId: "pet-5",
    pet: createPet(4, "可乐", "柴犬", 12.8),
    queueNumber: "A005",
    status: "queuing",
    packageId: "p2",
    package: mockPackages[1],
    steps: createSteps("o5", 0, null),
    abnormalities: [],
    createdAt: addMinutes(now, -10),
    estimatedFinish: addMinutes(now, 55),
    ownerPhone: "135****7890",
  },
  {
    id: "o6",
    petId: "pet-6",
    pet: createPet(5, "雪球", "萨摩耶", 22),
    queueNumber: "A006",
    status: "overdue",
    packageId: "p3",
    package: mockPackages[2],
    steps: createSteps("o6", 4, 4),
    abnormalities: [],
    createdAt: addMinutes(now, -130),
    estimatedFinish: addMinutes(now, -10),
    ownerPhone: "134****2345",
  },
  {
    id: "o7",
    petId: "pet-7",
    pet: createPet(6, " Lucky", "拉布拉多", 25),
    queueNumber: "A007",
    status: "completed",
    packageId: "p2",
    package: mockPackages[1],
    steps: createSteps("o7", 6, null),
    abnormalities: [],
    createdAt: addMinutes(now, -120),
    estimatedFinish: addMinutes(now, -70),
    ownerPhone: "133****6789",
  },
];
