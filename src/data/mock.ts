import type { Chair, RepairOrder, RepairRecord, FaultType, Frequency, ArmrestType, OrderStatus } from '@/types';
import { AREAS, MODELS, HANDLERS } from '@/types';

const armrestTypes: ArmrestType[] = ['fixed', '3d', '4d', 'none'];
const faultTypes: FaultType[] = ['noise', 'sinking', 'backrest_loose', 'wheel_jammed', 'armrest_broken', 'seat_collapse'];
const frequencies: Frequency[] = ['rare', 'occasional', 'frequent', 'always'];
const statuses: OrderStatus[] = ['pending', 'repairing', 'done', 'done', 'done', 'closed'];
const reporters = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '冯十二'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function randomDateTime(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

function generateChairs(): Chair[] {
  const chairs: Chair[] = [];
  let idx = 1;
  AREAS.forEach((area, areaIdx) => {
    const count = 18 + areaIdx * 4;
    for (let i = 0; i < count; i++) {
      const areaCode = area.charAt(0);
      const code = `${areaCode}-${String(i + 1).padStart(3, '0')}`;
      chairs.push({
        id: `chair-${idx}`,
        code,
        area,
        model: randomItem(MODELS),
        purchaseDate: randomDate(new Date(2021, 0, 1), new Date(2024, 6, 1)),
        gasRodBatch: `GR${2021 + Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
        armrestType: randomItem(armrestTypes),
        photo: `https://picsum.photos/seed/chair${idx}/400/300`,
        disabled: Math.random() < 0.03,
      });
      idx++;
    }
  });
  return chairs;
}

const CHAIRS = generateChairs();

function generateOrders(): RepairOrder[] {
  const orders: RepairOrder[] = [];
  const start = new Date(2025, 0, 1);
  const end = new Date(2026, 5, 17);

  for (let i = 0; i < 128; i++) {
    const chair = randomItem(CHAIRS);
    const numFaults = 1 + Math.floor(Math.random() * 2);
    const selectedFaults = [...new Set(Array.from({ length: numFaults }, () => randomItem(faultTypes)))];
    const status = randomItem(statuses);
    const createdAt = randomDateTime(start, end);

    const order: RepairOrder = {
      id: `order-${i + 1}`,
      chairId: chair.id,
      reporter: randomItem(reporters),
      faultTypes: selectedFaults,
      frequency: randomItem(frequencies),
      description: '坐着不舒服，希望尽快处理。',
      status,
      createdAt,
      needDisable: Math.random() < 0.15,
    };

    if (status === 'repairing' || status === 'done' || status === 'closed') {
      order.assignee = randomItem(HANDLERS);
    }

    if (status === 'done' || status === 'closed') {
      const created = new Date(createdAt);
      const startRepair = new Date(created.getTime() + 1000 * 60 * 60 * (1 + Math.random() * 24));
      const finishRepair = new Date(startRepair.getTime() + 1000 * 60 * 60 * (0.5 + Math.random() * 48));
      const numParts = Math.floor(Math.random() * 3);
      const partsPool = [
        { name: '气压杆', cost: 280 },
        { name: '五星脚', cost: 180 },
        { name: '万向轮', cost: 45 },
        { name: '扶手垫', cost: 65 },
        { name: '靠背连接轴', cost: 150 },
        { name: '坐垫海绵', cost: 220 },
        { name: '调节弹簧', cost: 90 },
      ];
      const parts = Array.from({ length: numParts }, () => {
        const p = randomItem(partsPool);
        return { name: p.name, quantity: 1 + Math.floor(Math.random() * 2), unitCost: p.cost };
      });
      const partsCost = parts.reduce((s, p) => s + p.unitCost * p.quantity, 0);
      const laborCost = 80 + Math.floor(Math.random() * 200);
      const needDisable = Math.random() < 0.2;

      order.repair = {
        id: `repair-${i + 1}`,
        orderId: order.id,
        startedAt: startRepair.toISOString().replace('T', ' ').slice(0, 19),
        finishedAt: finishRepair.toISOString().replace('T', ' ').slice(0, 19),
        partsReplaced: parts,
        laborCost,
        totalCost: partsCost + laborCost,
        handler: order.assignee || randomItem(HANDLERS),
        needDisable,
        beforePhoto: `https://picsum.photos/seed/before${i}/400/300`,
        afterPhoto: `https://picsum.photos/seed/after${i}/400/300`,
        notes: '已按标准流程检修，测试正常后交付。',
      };
    }

    orders.push(order);
  }
  return orders;
}

export const MOCK_CHAIRS: Chair[] = CHAIRS;
export const MOCK_ORDERS: RepairOrder[] = generateOrders();
