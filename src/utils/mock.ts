import {
  Plant,
  ServiceRecord,
  Issue,
  Supplier,
  Staff,
  Reminder,
  OperationType,
} from "@/types";
import { generateId } from "./date";

const now = new Date();

export const SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "绿叶园林有限公司",
    contact: "张经理",
    phone: "138-0000-1111",
  },
  {
    id: "sup-2",
    name: "青松绿植养护中心",
    contact: "李师傅",
    phone: "139-0000-2222",
  },
];

export const STAFFS: Staff[] = [
  {
    id: "staff-1",
    name: "王师傅",
    role: "maintenance",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=WS",
  },
  {
    id: "staff-2",
    name: "刘师傅",
    role: "maintenance",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LS",
  },
  {
    id: "admin-1",
    name: "行政管理员",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AD",
  },
];

const LOCATIONS = [
  "前台大厅",
  "会议室A",
  "会议室B",
  "开放办公区-北",
  "开放办公区-南",
  "总经理办公室",
  "茶水间",
  "走廊东侧",
  "走廊西侧",
  "前台接待区",
];

const SPECIES = [
  { name: "绿萝", photo: "pothos" },
  { name: "发财树", photo: "money-tree" },
  { name: "幸福树", photo: "happy-tree" },
  { name: "龟背竹", photo: "monstera" },
  { name: "虎皮兰", photo: "snake-plant" },
  { name: "散尾葵", photo: "areca-palm" },
  { name: "琴叶榕", photo: "fiddle-leaf" },
  { name: "吊兰", photo: "spider-plant" },
];

function getPlantPhoto(type: string): string {
  const prompts: Record<string, string> = {
    pothos: "green%20pothos%20plant%20in%20white%20ceramic%20pot%20office%20interior%20natural%20light",
    "money-tree": "pachira%20aquatica%20money%20tree%20plant%20modern%20office%20pot",
    "happy-tree": "radermachera%20sinica%20happy%20tree%20plant%20elegant%20office",
    monstera: "monstera%20deliciosa%20plant%20large%20leaves%20office%20pot",
    "snake-plant": "sansevieria%20snake%20plant%20tall%20leaves%20minimalist%20pot",
    "areca-palm": "areca%20palm%20plant%20tropical%20office%20interior",
    "fiddle-leaf": "ficus%20lyrata%20fiddle%20leaf%20fig%20large%20office%20plant",
    "spider-plant": "chlorophytum%20spider%20plant%20hanging%20pot%20green%20leaves",
  };
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompts[type] || "green%20office%20plant"}&image_size=square`;
}

export function generateMockPlants(): Plant[] {
  const plants: Plant[] = [];
  for (let i = 0; i < 12; i++) {
    const species = SPECIES[i % SPECIES.length];
    const statusRoll = Math.random();
    const status =
      statusRoll < 0.65 ? "healthy" : statusRoll < 0.85 ? "warning" : "problem";
    const createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 3600 * 1000);
    const lastServiceAt = new Date(
      createdAt.getTime() + Math.random() * 30 * 24 * 3600 * 1000
    );

    plants.push({
      id: `plant-${i + 1}`,
      location: LOCATIONS[i % LOCATIONS.length],
      species: species.name,
      potDiameter: [20, 25, 30, 35, 40][Math.floor(Math.random() * 5)],
      supplierId: SUPPLIERS[i % 2].id,
      maintenanceFrequency: ["每周一次", "每周两次", "每两周一次"][i % 3],
      photoUrl: getPlantPhoto(species.photo),
      status: status as Plant["status"],
      createdAt: createdAt.toISOString(),
      lastServiceAt: lastServiceAt.toISOString(),
    });
  }
  return plants;
}

const OPERATION_TYPES: OperationType[] = [
  "watering",
  "pruning",
  "fertilizing",
  "repotting",
  "pest_control",
];

export function generateMockServiceRecords(plants: Plant[]): ServiceRecord[] {
  const records: ServiceRecord[] = [];
  const plantPhotoPrompts = [
    "plant%20care%20watering%20service%20green%20leaves%20office",
    "gardener%20pruning%20indoor%20plant%20professional%20service",
    "plant%20fertilizing%20nutrient%20soil%20green%20foliage",
  ];

  plants.forEach((plant, plantIdx) => {
    const recordCount = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < recordCount; i++) {
      const checkinAt = new Date(
        now.getTime() - (recordCount - i) * (3 + Math.random() * 4) * 24 * 3600 * 1000
      );
      const opCount = 1 + Math.floor(Math.random() * 3);
      const operations = [...new Set(
        Array.from({ length: opCount }, () =>
          OPERATION_TYPES[Math.floor(Math.random() * OPERATION_TYPES.length)]
        )
      )] as OperationType[];

      const photoCount = i === recordCount - 1 && Math.random() < 0.3 ? 0 : 1 + Math.floor(Math.random() * 2);
      const photos = Array.from({ length: photoCount }, (_, pIdx) => ({
        id: `photo-${plantIdx}-${i}-${pIdx}`,
        url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${plantPhotoPrompts[pIdx % plantPhotoPrompts.length]}&image_size=square`,
        type: (["before", "after", "detail"] as const)[pIdx % 3],
      }));

      records.push({
        id: `svc-${plantIdx}-${i}`,
        plantId: plant.id,
        staffId: STAFFS[i % 2].id,
        checkinAt: checkinAt.toISOString(),
        operations,
        notes: `正常养护${operations.length > 0 ? "，完成" + operations.length + "项操作" : ""}`,
        photos,
        createdAt: checkinAt.toISOString(),
      });
    }
  });

  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function generateMockIssues(plants: Plant[]): Issue[] {
  const issues: Issue[] = [];
  const problemPlants = plants.filter((p) => p.status !== "healthy");
  const issueTypes = [
    { type: "叶片枯黄", desc: "部分叶片出现枯黄现象，需要检查水分和光照" },
    { type: "生长不良", desc: "植株整体生长缓慢，叶片暗淡无光" },
    { type: "病虫害", desc: "发现疑似蚜虫或红蜘蛛，需要喷洒药物处理" },
    { type: "土壤板结", desc: "土壤变硬，透气性差，建议换盆换土" },
    { type: "枯萎风险", desc: "植株状态不佳，有枯萎风险，需要重点关注" },
  ];

  problemPlants.forEach((plant, idx) => {
    const issueType = issueTypes[idx % issueTypes.length];
    const createdAt = new Date(now.getTime() - Math.random() * 14 * 24 * 3600 * 1000);
    const deadline = new Date(createdAt.getTime() + (3 + Math.random() * 10) * 24 * 3600 * 1000);
    const statusRoll = Math.random();
    const status =
      statusRoll < 0.4 ? "pending" : statusRoll < 0.75 ? "processing" : "closed";

    issues.push({
      id: `issue-${idx + 1}`,
      plantId: plant.id,
      type: issueType.type,
      description: issueType.desc,
      assignedTo: STAFFS[idx % 2].id,
      responsibleSupplierId: plant.supplierId,
      deadline: deadline.toISOString(),
      status: status as Issue["status"],
      createdAt: createdAt.toISOString(),
      closedAt: status === "closed" ? new Date(deadline.getTime() - Math.random() * 2 * 24 * 3600 * 1000).toISOString() : undefined,
      responseAt: status !== "pending" ? new Date(createdAt.getTime() + Math.random() * 24 * 3600 * 1000).toISOString() : undefined,
    });
  });

  return issues;
}

export function generateMockReminders(
  plants: Plant[],
  records: ServiceRecord[],
  issues: Issue[]
): Reminder[] {
  const reminders: Reminder[] = [];

  plants.forEach((plant) => {
    const plantRecords = records.filter((r) => r.plantId === plant.id);
    const lastRecord = plantRecords[0];

    if (!lastRecord) {
      reminders.push({
        id: generateId(),
        type: "missed_service",
        title: `${plant.location} - ${plant.species} 从未养护`,
        description: "该绿植尚未有任何养护记录，请尽快安排",
        plantId: plant.id,
        createdAt: now.toISOString(),
        read: false,
      });
    } else {
      const daysSince = Math.floor(
        (now.getTime() - new Date(lastRecord.checkinAt).getTime()) /
          (24 * 3600 * 1000)
      );
      if (daysSince > 10) {
        reminders.push({
          id: generateId(),
          type: "missed_service",
          title: `${plant.location} - ${plant.species} 超期未养护`,
          description: `已超过 ${daysSince} 天未养护，上次养护：${new Date(
            lastRecord.checkinAt
          ).toLocaleDateString("zh-CN")}`,
          plantId: plant.id,
          createdAt: now.toISOString(),
          read: daysSince < 14,
        });
      }
    }

    if (lastRecord && lastRecord.photos.length === 0) {
      reminders.push({
        id: generateId(),
        type: "missing_photo",
        title: `${plant.location} - ${plant.species} 服务记录缺失照片`,
        description: "上次养护服务未上传现场照片",
        plantId: plant.id,
        createdAt: lastRecord.createdAt,
        read: false,
      });
    }
  });

  issues
    .filter((i) => i.status !== "closed")
    .forEach((issue) => {
      const daysLeft = Math.floor(
        (new Date(issue.deadline).getTime() - now.getTime()) / (24 * 3600 * 1000)
      );
      if (daysLeft <= 3) {
        reminders.push({
          id: generateId(),
          type: "deadline_approaching",
          title: `问题处理即将截止（剩余 ${daysLeft} 天）`,
          description: `问题：${issue.type}，请及时跟进处理`,
          issueId: issue.id,
          createdAt: now.toISOString(),
          read: daysLeft > 1,
        });
      }
    });

  return reminders;
}
