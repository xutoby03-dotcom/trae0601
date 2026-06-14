import {
  type MeetingRoom,
  type InspectionRecord,
  type SupplyItem,
  DEPARTMENTS,
  INSPECTORS,
} from '@/types';
import { generateId, formatDate, checkStockLevel, createColorStocks } from '@/utils';

const MEETING_ROOMS: Omit<MeetingRoom, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'room-001',
    name: '创新会议室',
    capacity: 12,
    whiteboardCount: 2,
    defaultColors: ['black', 'blue', 'red', 'green'],
    minStock: 2,
    managerName: '张明',
    managerPhone: '13800138001',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20meeting%20room%20with%20whiteboard%20bright%20clean%20office&image_size=square_hd',
    department: '行政部',
  },
  {
    id: 'room-002',
    name: '协作会议室',
    capacity: 8,
    whiteboardCount: 1,
    defaultColors: ['black', 'blue', 'red'],
    minStock: 2,
    managerName: '李华',
    managerPhone: '13800138002',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20conference%20room%20with%20glass%20wall%20and%20whiteboard&image_size=square_hd',
    department: '研发部',
  },
  {
    id: 'room-003',
    name: '战略会议室',
    capacity: 20,
    whiteboardCount: 3,
    defaultColors: ['black', 'blue', 'red', 'green', 'purple'],
    minStock: 3,
    managerName: '王芳',
    managerPhone: '13800138003',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large%20boardroom%20with%20long%20table%20and%20multiple%20whiteboards&image_size=square_hd',
    department: '管理层',
  },
  {
    id: 'room-004',
    name: '头脑风暴室',
    capacity: 6,
    whiteboardCount: 2,
    defaultColors: ['black', 'blue', 'red', 'green', 'orange'],
    minStock: 2,
    managerName: '赵强',
    managerPhone: '13800138004',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20brainstorm%20room%20with%20colorful%20chairs%20and%20whiteboard%20wall&image_size=square_hd',
    department: '产品部',
  },
  {
    id: 'room-005',
    name: '培训教室',
    capacity: 30,
    whiteboardCount: 4,
    defaultColors: ['black', 'blue', 'red', 'green', 'purple', 'orange'],
    minStock: 4,
    managerName: '孙丽',
    managerPhone: '13800138005',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20training%20room%20with%20desks%20chairs%20and%20large%20whiteboards&image_size=square_hd',
    department: '人力资源部',
  },
  {
    id: 'room-006',
    name: '快速洽谈室',
    capacity: 4,
    whiteboardCount: 1,
    defaultColors: ['black', 'blue'],
    minStock: 1,
    managerName: '周杰',
    managerPhone: '13800138006',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20small%20meeting%20booth%20with%20whiteboard&image_size=square_hd',
    department: '销售部',
  },
];

export function generateMockMeetingRooms(): MeetingRoom[] {
  const now = new Date();
  return MEETING_ROOMS.map((room) => ({
    ...room,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }));
}

function generateInspectionForRoom(
  room: MeetingRoom,
  daysAgo: number,
  colorCounts: Record<string, number>,
  eraserCount: number,
  sprayCount: number,
  magnetCount: number,
  inspector: string,
  bookingDepartment: string
): InspectionRecord {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

  const colorStocks = createColorStocks(room, colorCounts);
  const eraserBelowMin = checkStockLevel(eraserCount, room.minStock);
  const sprayBelowMin = checkStockLevel(sprayCount, Math.ceil(room.minStock / 2));
  const magnetBelowMin = checkStockLevel(magnetCount, room.minStock * 2);

  const needReplenish =
    colorStocks.some((cs) => cs.belowMin) ||
    eraserBelowMin ||
    sprayBelowMin ||
    magnetBelowMin;

  return {
    id: generateId(),
    roomId: room.id,
    roomName: room.name,
    inspector,
    inspectionDate: formatDate(date),
    colorStocks,
    eraserCount,
    eraserBelowMin,
    sprayCount,
    sprayBelowMin,
    magnetCount,
    magnetBelowMin,
    needReplenish,
    notes: needReplenish ? '需要补货' : '',
    bookingDepartment,
    createdAt: date.toISOString(),
  };
}

export function generateMockInspectionRecords(rooms: MeetingRoom[]): InspectionRecord[] {
  const records: InspectionRecord[] = [];

  const room001 = rooms.find((r) => r.id === 'room-001')!;
  records.push(
    generateInspectionForRoom(room001, 14, { black: 3, blue: 3, red: 2, green: 2 }, 2, 2, 6, INSPECTORS[0], DEPARTMENTS[0]),
    generateInspectionForRoom(room001, 11, { black: 2, blue: 1, red: 2, green: 3 }, 1, 2, 5, INSPECTORS[1], DEPARTMENTS[2]),
    generateInspectionForRoom(room001, 8, { black: 1, blue: 0, red: 1, green: 2 }, 0, 1, 3, INSPECTORS[0], DEPARTMENTS[1]),
    generateInspectionForRoom(room001, 5, { black: 0, blue: 0, red: 0, green: 1 }, 0, 0, 2, INSPECTORS[2], DEPARTMENTS[0]),
    generateInspectionForRoom(room001, 2, { black: 0, blue: 0, red: 0, green: 0 }, 0, 0, 1, INSPECTORS[0], DEPARTMENTS[3]),
  );

  const room002 = rooms.find((r) => r.id === 'room-002')!;
  records.push(
    generateInspectionForRoom(room002, 13, { black: 3, blue: 2, red: 3 }, 2, 1, 4, INSPECTORS[1], DEPARTMENTS[0]),
    generateInspectionForRoom(room002, 10, { black: 2, blue: 2, red: 1 }, 1, 1, 3, INSPECTORS[0], DEPARTMENTS[0]),
    generateInspectionForRoom(room002, 7, { black: 1, blue: 1, red: 0 }, 1, 0, 2, INSPECTORS[2], DEPARTMENTS[4]),
    generateInspectionForRoom(room002, 4, { black: 0, blue: 0, red: 0 }, 0, 0, 1, INSPECTORS[1], DEPARTMENTS[0]),
  );

  const room003 = rooms.find((r) => r.id === 'room-003')!;
  records.push(
    generateInspectionForRoom(room003, 12, { black: 5, blue: 4, red: 4, green: 3, purple: 3 }, 3, 2, 8, INSPECTORS[0], DEPARTMENTS[6]),
    generateInspectionForRoom(room003, 9, { black: 4, blue: 3, red: 3, green: 2, purple: 2 }, 2, 2, 7, INSPECTORS[3], DEPARTMENTS[2]),
    generateInspectionForRoom(room003, 6, { black: 3, blue: 2, red: 2, green: 1, purple: 1 }, 2, 1, 5, INSPECTORS[0], DEPARTMENTS[1]),
    generateInspectionForRoom(room003, 3, { black: 2, blue: 1, red: 1, green: 0, purple: 0 }, 1, 1, 4, INSPECTORS[2], DEPARTMENTS[5]),
  );

  const room004 = rooms.find((r) => r.id === 'room-004')!;
  records.push(
    generateInspectionForRoom(room004, 14, { black: 4, blue: 3, red: 3, green: 3, orange: 2 }, 3, 2, 6, INSPECTORS[2], DEPARTMENTS[1]),
    generateInspectionForRoom(room004, 10, { black: 3, blue: 2, red: 2, green: 2, orange: 1 }, 2, 1, 5, INSPECTORS[0], DEPARTMENTS[1]),
    generateInspectionForRoom(room004, 6, { black: 2, blue: 1, red: 1, green: 0, orange: 0 }, 1, 1, 3, INSPECTORS[1], DEPARTMENTS[2]),
    generateInspectionForRoom(room004, 2, { black: 1, blue: 0, red: 0, green: 0, orange: 0 }, 0, 0, 2, INSPECTORS[3], DEPARTMENTS[1]),
  );

  const room005 = rooms.find((r) => r.id === 'room-005')!;
  records.push(
    generateInspectionForRoom(room005, 13, { black: 6, blue: 5, red: 5, green: 4, purple: 4, orange: 3 }, 5, 3, 12, INSPECTORS[0], DEPARTMENTS[5]),
    generateInspectionForRoom(room005, 9, { black: 5, blue: 4, red: 4, green: 3, purple: 3, orange: 2 }, 4, 2, 10, INSPECTORS[4], DEPARTMENTS[5]),
    generateInspectionForRoom(room005, 5, { black: 4, blue: 3, red: 3, green: 2, purple: 2, orange: 1 }, 3, 2, 8, INSPECTORS[0], DEPARTMENTS[7]),
    generateInspectionForRoom(room005, 1, { black: 3, blue: 2, red: 2, green: 1, purple: 1, orange: 0 }, 2, 1, 6, INSPECTORS[1], DEPARTMENTS[5]),
  );

  const room006 = rooms.find((r) => r.id === 'room-006')!;
  records.push(
    generateInspectionForRoom(room006, 12, { black: 2, blue: 2 }, 1, 1, 3, INSPECTORS[3], DEPARTMENTS[4]),
    generateInspectionForRoom(room006, 8, { black: 1, blue: 1 }, 1, 0, 2, INSPECTORS[1], DEPARTMENTS[4]),
    generateInspectionForRoom(room006, 4, { black: 0, blue: 0 }, 0, 0, 1, INSPECTORS[2], DEPARTMENTS[8]),
    generateInspectionForRoom(room006, 0, { black: 0, blue: 0 }, 0, 0, 0, INSPECTORS[0], DEPARTMENTS[4]),
  );

  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function generateMockSupplyItems(
  rooms: MeetingRoom[],
  records: InspectionRecord[]
): SupplyItem[] {
  const items: SupplyItem[] = [];
  const now = new Date();

  const latestRecords: Record<string, InspectionRecord> = {};
  for (const record of records) {
    if (!latestRecords[record.roomId] || new Date(record.createdAt) > new Date(latestRecords[record.roomId].createdAt)) {
      latestRecords[record.roomId] = record;
    }
  }

  for (const room of rooms) {
    const latest = latestRecords[room.id];
    if (!latest) continue;

    for (const cs of latest.colorStocks) {
      if (cs.belowMin) {
        const consecutive = records
          .filter((r) => r.roomId === room.id)
          .filter((r) => r.colorStocks.find((c) => c.color === cs.color)?.belowMin)
          .length;

        items.push({
          id: generateId(),
          roomId: room.id,
          roomName: room.name,
          itemType: 'marker',
          color: cs.color,
          colorName: cs.colorName,
          requiredQuantity: room.minStock - cs.count + 2,
          consecutiveShortage: consecutive,
          status: consecutive >= 2 ? 'pending' : 'pending',
          createdAt: now.toISOString(),
        });
      }
    }

    if (latest.eraserBelowMin) {
      items.push({
        id: generateId(),
        roomId: room.id,
        roomName: room.name,
        itemType: 'eraser',
        requiredQuantity: room.minStock - latest.eraserCount + 1,
        consecutiveShortage: 1,
        status: 'pending',
        createdAt: now.toISOString(),
      });
    }

    if (latest.sprayBelowMin) {
      items.push({
        id: generateId(),
        roomId: room.id,
        roomName: room.name,
        itemType: 'spray',
        requiredQuantity: Math.ceil(room.minStock / 2) - latest.sprayCount + 1,
        consecutiveShortage: 1,
        status: 'pending',
        createdAt: now.toISOString(),
      });
    }

    if (latest.magnetBelowMin) {
      items.push({
        id: generateId(),
        roomId: room.id,
        roomName: room.name,
        itemType: 'magnet',
        requiredQuantity: room.minStock * 2 - latest.magnetCount + 4,
        consecutiveShortage: 1,
        status: 'pending',
        createdAt: now.toISOString(),
      });
    }
  }

  const completedDate = new Date();
  completedDate.setDate(completedDate.getDate() - 7);
  items.push({
    id: generateId(),
    roomId: 'room-001',
    roomName: '创新会议室',
    itemType: 'marker',
    color: 'green',
    colorName: '绿色',
    requiredQuantity: 4,
    consecutiveShortage: 1,
    status: 'completed',
    createdAt: completedDate.toISOString(),
    completedAt: completedDate.toISOString(),
  });

  return items;
}
