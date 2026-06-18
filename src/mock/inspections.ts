import type { InspectionRecord, InspectionTask, InspectionItem, ItemStatus } from "../types";

const INSPECTORS = ["张建国", "李明辉", "王海涛", "赵志强"];

function getRandomDateWithinDays(days: number): string {
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime).toISOString();
}

const ITEMS_POOL: InspectionItem[] = [
  "screen", "socket", "leakage", "cable", "qrcode", "fireSpace", "clutter",
];

const ABNORMAL_ITEMS_POOL: InspectionItem[] = [
  "socket", "screen", "clutter", "fireSpace", "qrcode",
];

function generateInspectionItems(abnormalRate: number = 0.08) {
  const items = {} as Record<InspectionItem, ItemStatus>;
  const abnormalPhotos: Partial<Record<InspectionItem, string[]>> = {};
  let hasAbnormal = false;

  ITEMS_POOL.forEach((item) => {
    const isAbnormal = Math.random() < abnormalRate;
    if (isAbnormal && ABNORMAL_ITEMS_POOL.includes(item)) {
      items[item] = "abnormal";
      hasAbnormal = true;
      abnormalPhotos[item] = [
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=broken%20charging%20station%20socket%20loose%20wire%20damage&image_size=square",
      ];
    } else if (Math.random() < 0.02) {
      items[item] = "skipped";
    } else {
      items[item] = "normal";
    }
  });

  return { items, abnormalPhotos, hasAbnormal };
}

export function generateInspectionRecords(stationIds: string[]): InspectionRecord[] {
  const records: InspectionRecord[] = [];
  const totalDays = 30;
  const recordsPerDay = 18;

  for (let day = 0; day < totalDays; day++) {
    for (let r = 0; r < recordsPerDay; r++) {
      const stationId = stationIds[Math.floor(Math.random() * stationIds.length)];
      const inspector = INSPECTORS[Math.floor(Math.random() * INSPECTORS.length)];
      const { items, abnormalPhotos, hasAbnormal } = generateInspectionItems(0.08);

      const recordDate = new Date();
      recordDate.setDate(recordDate.getDate() - day);
      recordDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

      records.push({
        id: `insp_rec_${day}_${r}`,
        taskId: `task_${day}`,
        stationId,
        inspector,
        inspectorId: `inspector_${INSPECTORS.indexOf(inspector)}`,
        inspectDate: recordDate.toISOString(),
        items,
        abnormalPhotos,
        remarks: hasAbnormal ? "发现异常项，已上报处理" : "",
        hasAbnormal,
      });
    }
  }

  return records;
}

export function generateInspectionTasks(stationIds: string[]): InspectionTask[] {
  const tasks: InspectionTask[] = [];
  const taskNames = ["日常巡检", "周度专项检查", "节前安全巡检", "恶劣天气特检"];

  for (let day = 0; day < 14; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);

    const shuffled = [...stationIds].sort(() => Math.random() - 0.5);
    const taskStations = shuffled.slice(0, 15 + Math.floor(Math.random() * 8));

    let completedCount: number;
    let status: "pending" | "in_progress" | "completed";
    if (day === 0) {
      completedCount = Math.floor(taskStations.length * 0.4);
      status = "in_progress";
    } else if (day === 1) {
      completedCount = Math.floor(taskStations.length * 0.9);
      status = Math.random() > 0.5 ? "in_progress" : "completed";
    } else {
      completedCount = taskStations.length;
      status = "completed";
    }

    tasks.push({
      id: `task_${day}`,
      name: `${taskNames[Math.floor(Math.random() * taskNames.length)]} - ${day === 0 ? "今日" : day + "天前"}`,
      date: date.toISOString(),
      inspector: INSPECTORS[Math.floor(Math.random() * INSPECTORS.length)],
      stationIds: taskStations,
      completedCount,
      status,
    });
  }

  return tasks;
}
