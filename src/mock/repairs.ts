import type {
  RepairTicket,
  RepairIssueType,
  RepairStatus,
  RepairTimelineItem,
  MaintenanceRecord,
  PartItem,
} from "../types";
import { format } from "date-fns";

const ISSUE_TYPES: RepairIssueType[] = [
  "no_charge", "no_charge", "no_charge",
  "fee_error",
  "plug_hot", "plug_hot",
  "qrcode_invalid", "qrcode_invalid",
  "other",
];

const STATUSES: RepairStatus[] = [
  "pending", "pending", "pending",
  "processing", "processing",
  "maintenance",
  "completed", "completed", "completed", "completed",
  "cancelled",
];

const REPORTERS = [
  { name: "刘女士", building: "1号楼" },
  { name: "陈先生", building: "2号楼" },
  { name: "王阿姨", building: "3号楼" },
  { name: "张先生", building: "4号楼" },
  { name: "李奶奶", building: "5号楼" },
  { name: "赵师傅", building: "6号楼" },
  { name: "黄女士", building: "1号楼" },
  { name: "周先生", building: "3号楼" },
];

const DESCRIPTIONS: Record<RepairIssueType, string[]> = {
  no_charge: [
    "插上充电器完全没反应，指示灯不亮",
    "充电5分钟就自动断电，反复尝试都不行",
    "插上后屏幕显示故障代码E03",
    "插头发热严重，不敢继续使用",
  ],
  fee_error: [
    "充了2小时扣了5小时的钱",
    "扫码支付成功但未启动充电",
    "余额显示不对，多扣了费用",
    "订单完成后没有自动结算",
  ],
  plug_hot: [
    "充电10分钟后插头烫手",
    "插座有烧焦气味",
    "充电时电线发热变软",
    "插座外壳温度异常",
  ],
  qrcode_invalid: [
    "二维码扫不出来，摄像头没反应",
    "扫码后提示页面不存在",
    "二维码贴纸掉了",
    "二维码模糊无法识别",
  ],
  other: [
    "显示屏内容乱码",
    "充电桩无法停止充电",
    "充电时噪音很大",
    "刷卡没反应",
  ],
};

const TECHNICIANS = [
  { name: "吴工", phone: "138****1234" },
  { name: "郑工", phone: "139****5678" },
  { name: "孙工", phone: "137****9012" },
];

function getRandomDateWithinDays(days: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

function generatePhone(): string {
  const prefix = ["135", "136", "137", "138", "139", "158", "159"];
  return `${prefix[Math.floor(Math.random() * prefix.length)]}****${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateTimeline(
  createdAt: Date,
  status: RepairStatus
): RepairTimelineItem[] {
  const timeline: RepairTimelineItem[] = [];

  timeline.push({
    time: createdAt.toISOString(),
    action: "提交报修",
    operator: "居民",
  });

  if (status !== "pending" && status !== "cancelled") {
    const assignedAt = new Date(createdAt.getTime() + 30 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000);
    timeline.push({
      time: assignedAt.toISOString(),
      action: "受理派单",
      operator: "物业管理员",
      note: `指派给${TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)].name}处理`,
    });

    if (status === "maintenance" || status === "completed") {
      const maintAt = new Date(assignedAt.getTime() + 2 * 60 * 60 * 1000 + Math.random() * 4 * 60 * 60 * 1000);
      timeline.push({
        time: maintAt.toISOString(),
        action: "开始维修",
        operator: TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)].name,
        note: "已到达现场排查故障",
      });

      if (status === "completed") {
        const complAt = new Date(maintAt.getTime() + 30 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000);
        timeline.push({
          time: complAt.toISOString(),
          action: "维修完成",
          operator: TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)].name,
          note: "故障排除，充电桩恢复正常使用",
        });
      }
    }
  }

  if (status === "cancelled") {
    timeline.push({
      time: new Date(createdAt.getTime() + 60 * 60 * 1000).toISOString(),
      action: "取消工单",
      operator: "居民",
      note: "问题自行解决",
    });
  }

  return timeline;
}

export function generateRepairTickets(stationIds: string[]): RepairTicket[] {
  const tickets: RepairTicket[] = [];

  for (let i = 0; i < 45; i++) {
    const issueType = ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const reporter = REPORTERS[Math.floor(Math.random() * REPORTERS.length)];
    const stationId = stationIds[Math.floor(Math.random() * stationIds.length)];
    const createdAt = getRandomDateWithinDays(25);

    const descriptionList = DESCRIPTIONS[issueType];
    const description = descriptionList[Math.floor(Math.random() * descriptionList.length)];

    const ticketNo = `BX${format(createdAt, "yyyyMMdd")}${(1000 + i).toString()}`;
    const timeline = generateTimeline(createdAt, status);
    const lastTimeline = timeline[timeline.length - 1];

    let assignee: string | null = null;
    let assignedAt: string | null = null;
    if (status !== "pending" && status !== "cancelled") {
      const tech = TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)];
      assignee = tech.name;
      assignedAt = timeline[1]?.time || null;
    }

    tickets.push({
      id: `ticket_${i}`,
      ticketNo,
      stationId,
      issueType,
      description,
      photos:
        Math.random() > 0.3
          ? [
              "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ebike%20charging%20problem%20broken%20socket%20repair&image_size=square",
            ]
          : [],
      reporterName: reporter.name,
      reporterPhone: generatePhone(),
      reporterBuilding: reporter.building,
      status,
      createdAt: createdAt.toISOString(),
      assignee,
      assignedAt,
      completedAt: status === "completed" ? lastTimeline.time : null,
      resolution: status === "completed" ? "已修复并通过测试" : null,
      timeline,
    });
  }

  return tickets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const PART_CATALOG: PartItem[] = [
  { name: "国标三孔插座模块", quantity: 1, unitPrice: 85 },
  { name: "LED显示屏模组", quantity: 1, unitPrice: 320 },
  { name: "漏电保护开关", quantity: 1, unitPrice: 45 },
  { name: "主控电路板", quantity: 1, unitPrice: 580 },
  { name: "电源适配器", quantity: 1, unitPrice: 120 },
  { name: "线缆接头组件", quantity: 2, unitPrice: 35 },
  { name: "二维码贴纸套装", quantity: 1, unitPrice: 15 },
  { name: "散热风扇", quantity: 1, unitPrice: 65 },
];

const FAULT_CATEGORIES = ["插座故障", "屏幕故障", "电路故障", "通信故障", "机械损坏"];
const FAULT_REASONS = [
  "插座长期使用导致接触片松动",
  "屏幕进水受潮损坏",
  "漏保开关老化跳闸",
  "主板元器件烧坏",
  "线缆外皮破损短路",
  "二维码磨损无法扫描",
];

export function generateMaintenanceRecords(
  stationIds: string[],
  tickets: RepairTicket[]
): MaintenanceRecord[] {
  const records: MaintenanceRecord[] = [];
  const completedTickets = tickets.filter((t) => t.status === "completed");

  for (let i = 0; i < 28; i++) {
    const stationId = stationIds[Math.floor(Math.random() * stationIds.length)];
    const ticket = completedTickets[i % completedTickets.length];
    const tech = TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)];

    const startedAt = getRandomDateWithinDays(25);
    const completedAt = new Date(startedAt.getTime() + (30 + Math.random() * 150) * 60 * 1000);

    const partCount = 1 + Math.floor(Math.random() * 3);
    const partsPool = [...PART_CATALOG].sort(() => Math.random() - 0.5);
    const partsReplaced = partsPool.slice(0, partCount).map((p) => ({
      ...p,
      quantity: p.name.includes("线缆") ? 2 : 1,
    }));
    const totalCost = partsReplaced.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice,
      0
    ) + Math.floor(50 + Math.random() * 150);

    records.push({
      id: `maint_${i}`,
      stationId,
      repairTicketId: Math.random() > 0.4 ? ticket?.id : undefined,
      faultReason: FAULT_REASONS[Math.floor(Math.random() * FAULT_REASONS.length)],
      faultCategory: FAULT_CATEGORIES[Math.floor(Math.random() * FAULT_CATEGORIES.length)],
      partsReplaced,
      totalCost,
      technician: tech.name,
      technicianPhone: tech.phone,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      notes: "已完成维修并通过功能测试，设备恢复正常",
      beforePhotos: [
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=damaged%20charging%20station%20socket%20broken%20before%20repair&image_size=square",
      ],
      afterPhotos: [
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=repaired%20charging%20station%20working%20after%20maintenance%20clean&image_size=square",
      ],
      stationStatusAfter: Math.random() > 0.05 ? "online" : "maintenance",
    });
  }

  return records;
}
