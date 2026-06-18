import type { ChargingStation } from "../types";

const BUILDINGS = ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"];
const LOCATIONS = ["地下车库B1层", "地下车库B2层", "地面停车区东侧", "地面停车区西侧", "单元门口旁"];
const FEE_RULES = [
  "1.5元/小时，每日封顶12元",
  "1.2元/小时，每日封顶10元",
  "2.0元/小时，每日封顶15元",
  "1.8元/小时，每日封顶14元",
];

const STATION_PHOTOS = [
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20electric%20vehicle%20charging%20station%20in%20residential%20parking%20lot%20with%20blue%20LED%20lights%20clean%20design&image_size=landscape_4_3",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20community%20ebike%20charging%20station%20multiple%20outlets%20green%20energy%20concept&image_size=landscape_4_3",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=underground%20parking%20garage%20EV%20charger%20row%20with%20illuminated%20screen%20modern%20facility&image_size=landscape_4_3",
];

function getRandomDate(start: Date, end: Date): string {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString();
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateStations(): ChargingStation[] {
  const stations: ChargingStation[] = [];
  const statusPool: ChargingStation["status"][] = [
    "online", "online", "online", "online", "online", "online",
    "online", "online", "online", "online", "online", "online",
    "online", "online", "online", "online", "online", "online",
    "offline", "offline",
    "fault", "fault", "fault",
    "maintenance",
  ];

  let idx = 0;
  BUILDINGS.forEach((building, bIdx) => {
    for (let i = 0; i < 4; i++) {
      const stationNum = (bIdx * 4 + i + 1).toString().padStart(2, "0");
      const status = statusPool[idx] || "online";
      const socketCount = Math.random() > 0.5 ? 4 : 2;
      const power = Math.random() > 0.5 ? 7 : 3.5;
      const feePerHour = [1.2, 1.5, 1.8, 2.0][Math.floor(Math.random() * 4)];

      stations.push({
        id: `station_${bIdx}_${i}`,
        code: `CDZ-${building.replace("号楼", "")}${stationNum}`,
        building,
        location: `${building} ${getRandomItem(LOCATIONS)}`,
        socketCount,
        power,
        installDate: getRandomDate(new Date("2023-01-01"), new Date("2025-06-01")),
        feeRule: getRandomItem(FEE_RULES),
        feePerHour,
        photo: STATION_PHOTOS[idx % STATION_PHOTOS.length],
        status,
        createdAt: getRandomDate(new Date("2023-01-01"), new Date("2025-06-01")),
        lastInspectionAt:
          status === "maintenance"
            ? null
            : getRandomDate(new Date("2026-05-01"), new Date("2026-06-17")),
        usageRate: Math.random() * 0.6 + 0.15,
      });
      idx++;
    }
  });

  return stations;
}

export const mockStations = generateStations();
