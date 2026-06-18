import type { Seat, Feedback, Floor, Zone, SeatStatus } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function calculateStatus(feedbackCount: number): SeatStatus {
  if (feedbackCount >= 3) return 'serious';
  if (feedbackCount >= 1) return 'warning';
  return 'quiet';
}

export function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  const floors: Floor[] = [1, 2, 3];
  const zones: Zone[] = ['A', 'B', 'C'];

  const feedbackCounts: Record<string, number> = {
    '1-A-1': 3, '1-A-2': 1, '1-B-3': 2, '1-C-5': 4,
    '2-A-4': 1, '2-B-2': 3, '2-C-6': 2,
    '3-A-1': 5, '3-B-4': 2, '3-C-3': 1,
  };

  floors.forEach((floor) => {
    zones.forEach((zone) => {
      for (let desk = 1; desk <= 8; desk++) {
        for (let seatNum = 1; seatNum <= 2; seatNum++) {
          const key = `${floor}-${zone}-${desk}`;
          const feedbackCount = feedbackCounts[key] || 0;
          const isOccupied = Math.random() > 0.3;

          seats.push({
            id: `${floor}-${zone}-${desk}-${seatNum}`,
            floor,
            zone,
            deskNumber: desk,
            seatNumber: seatNum,
            status: calculateStatus(feedbackCount),
            feedbackCount24h: feedbackCount,
            isOccupied,
          });
        }
      }
    });
  });

  return seats;
}

const reporterNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '冯十二'];
const noiseTypes = ['call', 'keyboard', 'eating', 'occupied', 'talking', 'equipment'] as const;

function randomTime(daysAgo: number): string {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
  return now.toISOString();
}

export function generateMockFeedbacks(): Feedback[] {
  const feedbacks: Feedback[] = [];

  const rawData = [
    { floor: 1 as Floor, zone: 'A' as Zone, desk: 1, seat: 1, type: 'keyboard' as const, daysAgo: 0, reporter: 0 },
    { floor: 1 as Floor, zone: 'A' as Zone, desk: 1, seat: 2, type: 'call' as const, daysAgo: 0, reporter: 1 },
    { floor: 1 as Floor, zone: 'A' as Zone, desk: 1, seat: 1, type: 'talking' as const, daysAgo: 0, reporter: 2 },
    { floor: 1 as Floor, zone: 'A' as Zone, desk: 2, seat: 1, type: 'eating' as const, daysAgo: 0, reporter: 3 },
    { floor: 1 as Floor, zone: 'B' as Zone, desk: 3, seat: 2, type: 'keyboard' as const, daysAgo: 0, reporter: 0 },
    { floor: 1 as Floor, zone: 'B' as Zone, desk: 3, seat: 1, type: 'equipment' as const, daysAgo: 1, reporter: 4 },
    { floor: 1 as Floor, zone: 'C' as Zone, desk: 5, seat: 1, type: 'call' as const, daysAgo: 0, reporter: 5 },
    { floor: 1 as Floor, zone: 'C' as Zone, desk: 5, seat: 2, type: 'talking' as const, daysAgo: 0, reporter: 6 },
    { floor: 1 as Floor, zone: 'C' as Zone, desk: 5, seat: 1, type: 'eating' as const, daysAgo: 0, reporter: 7 },
    { floor: 1 as Floor, zone: 'C' as Zone, desk: 5, seat: 2, type: 'occupied' as const, daysAgo: 1, reporter: 8 },
    { floor: 2 as Floor, zone: 'A' as Zone, desk: 4, seat: 1, type: 'keyboard' as const, daysAgo: 1, reporter: 0 },
    { floor: 2 as Floor, zone: 'B' as Zone, desk: 2, seat: 1, type: 'call' as const, daysAgo: 0, reporter: 1 },
    { floor: 2 as Floor, zone: 'B' as Zone, desk: 2, seat: 2, type: 'talking' as const, daysAgo: 0, reporter: 2 },
    { floor: 2 as Floor, zone: 'B' as Zone, desk: 2, seat: 1, type: 'equipment' as const, daysAgo: 0, reporter: 3 },
    { floor: 2 as Floor, zone: 'C' as Zone, desk: 6, seat: 2, type: 'eating' as const, daysAgo: 1, reporter: 4 },
    { floor: 2 as Floor, zone: 'C' as Zone, desk: 6, seat: 1, type: 'occupied' as const, daysAgo: 2, reporter: 5 },
    { floor: 3 as Floor, zone: 'A' as Zone, desk: 1, seat: 2, type: 'call' as const, daysAgo: 0, reporter: 0 },
    { floor: 3 as Floor, zone: 'A' as Zone, desk: 1, seat: 1, type: 'keyboard' as const, daysAgo: 0, reporter: 0 },
    { floor: 3 as Floor, zone: 'A' as Zone, desk: 1, seat: 2, type: 'talking' as const, daysAgo: 0, reporter: 0 },
    { floor: 3 as Floor, zone: 'A' as Zone, desk: 1, seat: 1, type: 'eating' as const, daysAgo: 0, reporter: 1 },
    { floor: 3 as Floor, zone: 'A' as Zone, desk: 1, seat: 2, type: 'equipment' as const, daysAgo: 1, reporter: 0 },
    { floor: 3 as Floor, zone: 'B' as Zone, desk: 4, seat: 1, type: 'occupied' as const, daysAgo: 1, reporter: 2 },
    { floor: 3 as Floor, zone: 'B' as Zone, desk: 4, seat: 2, type: 'keyboard' as const, daysAgo: 2, reporter: 3 },
    { floor: 3 as Floor, zone: 'C' as Zone, desk: 3, seat: 1, type: 'call' as const, daysAgo: 2, reporter: 4 },
  ];

  const handleResults = ['reminded', 'moved', 'cleared', 'false_alarm', 'pending', 'pending', 'pending'] as const;

  rawData.forEach((item, index) => {
    const occurTime = randomTime(item.daysAgo);
    const submitTime = occurTime;
    const status = handleResults[index % handleResults.length];
    const isHandled = status !== 'pending';

    feedbacks.push({
      id: generateId(),
      seatId: `${item.floor}-${item.zone}-${item.desk}-${item.seat}`,
      floor: item.floor,
      zone: item.zone,
      deskNumber: item.desk,
      seatNumber: item.seat,
      noiseType: item.type,
      occurTime,
      submitTime,
      photos: [],
      reporterId: `S${20240001 + item.reporter}`,
      reporterName: reporterNames[item.reporter],
      status,
      ...(isHandled && {
        handleTime: randomTime(item.daysAgo),
        handlerId: 'A001',
        handlerName: '李管理员',
      }),
    });
  });

  return feedbacks;
}

export const mockSeats = generateSeats();
export const mockFeedbacks = generateMockFeedbacks();
