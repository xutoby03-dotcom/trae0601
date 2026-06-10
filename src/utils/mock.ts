import type { FaultTicket, FaultStatus, FaultPhenomenon, ElevatorId } from '@/shared/types';
import { generateId } from '@/utils/storage';
import { BUILDINGS, UNITS, ELEVATORS_PER_UNIT, PHENOMENON_OPTIONS } from '@/shared/constants';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeElevator(): ElevatorId {
  const b = pick(BUILDINGS);
  return {
    building: b.code,
    unit: pick(UNITS),
    elevatorNo: pick(ELEVATORS_PER_UNIT),
    floorCount: b.floors,
  };
}

const PHENOMENA: FaultPhenomenon[] = PHENOMENON_OPTIONS.map((p) => p.value);

const DESCRIPTIONS: Record<FaultPhenomenon, string[]> = {
  door_stuck: [
    '电梯门在5楼卡住，关不上也打不开，有人在里面。',
    '出电梯时门突然夹人，随后一直无法正常闭合。',
    '按开门键无反应，门完全打不开。',
  ],
  not_moving: [
    '电梯完全停运，按任何楼层都没反应。',
    '停在12楼不动了，屏幕也不亮。',
    '早高峰停运，整栋楼只能走楼梯。',
  ],
  strange_noise: [
    '运行时发出哐当哐当的金属撞击声，很吓人。',
    '上升时电机异响，伴随轻微震动。',
    '过每层都有咯噔一声，比平时响很多。',
  ],
  button_fault: [
    '3楼和7楼按键按了没反应。',
    '关门键失灵，要等很久才自动关。',
    '紧急呼叫按钮按下无应答。',
  ],
  light_out: [
    '轿厢灯全灭，只剩应急灯亮着，很暗。',
    '灯一闪一闪的，像接触不良。',
    '显示面板背光灯不亮，看不清楼层。',
  ],
  air_condition: [
    '大热天空调完全没风，轿厢里闷得慌。',
    '通风口有异味，像什么东西发霉了。',
    '空调吹热风，越坐越热。',
  ],
  display_error: [
    '楼层数字一直跳，明明在8楼显示18楼。',
    '屏幕乱码，什么都看不清。',
    '方向箭头不显示，不知道上还是下。',
  ],
  other: [
    '轿厢地板有积水，担心漏电。',
    '内壁装饰板脱落，有安全隐患。',
    '总感觉运行速度忽快忽慢。',
  ],
};

const REPORTERS = [
  '业主李先生',
  '王阿姨',
  '302住户',
  '租客小张',
  '陈女士',
  '赵先生',
  '刘奶奶',
  '物业巡逻',
  '快递小哥',
  '保洁大姐',
];

const HANDLERS = ['张师傅', '李师傅', '王师傅', '赵师傅', '陈师傅'];

export function generateMockTickets(): FaultTicket[] {
  const tickets: FaultTicket[] = [];
  const now = Date.now();
  const elevatorUsage: Record<string, number> = {};

  function elevatorKey(e: ElevatorId): string {
    return `${e.building}-${e.unit}-${e.elevatorNo}`;
  }

  function pushTimeline(
    base: Partial<FaultTicket>,
    statuses: { status: FaultStatus; hoursAgo: number; remark?: string; withRecover?: boolean }[],
  ): FaultTicket {
    const elevator = base.elevator!;
    const key = elevatorKey(elevator);
    elevatorUsage[key] = (elevatorUsage[key] || 0) + 1;
    const repeatedCount = elevatorUsage[key];

    const timeline = statuses.map((s, i) => {
      const ts = now - s.hoursAgo * 3600 * 1000 - i * 60000;
      return {
        status: s.status,
        timestamp: ts,
        operator: s.status === 'urgent' ? undefined : pick(HANDLERS),
        remark: s.remark,
      };
    });

    const last = statuses[statuses.length - 1];
    const first = statuses[0];
    const reportedAt = now - first.hoursAgo * 3600 * 1000;
    const occurredAt = reportedAt - randInt(1, 15) * 60000;

    const phenom = base.phenomenon!;
    const recoveredAt = last.status === 'recovered' ? now - last.hoursAgo * 3600 * 1000 : undefined;
    const handler =
      last.status === 'urgent'
        ? undefined
        : last.status === 'recovered'
          ? timeline.find((t) => t.status === 'processing')?.operator
          : timeline[timeline.length - 1].operator;

    const estimated =
      last.status !== 'urgent' && last.status !== 'recovered'
        ? now + randInt(30, 240) * 60000
        : undefined;

    return {
      id: generateId(),
      elevator,
      phenomenon: phenom,
      description: base.description || pick(DESCRIPTIONS[phenom]),
      hasTrapped: base.hasTrapped ?? (last.status === 'urgent' && phenom === 'door_stuck' && Math.random() > 0.4),
      trappedCount: base.hasTrapped ? randInt(1, 4) : undefined,
      photos: base.photos ?? (Math.random() > 0.55 ? [`mock-photo-${randInt(1, 9)}.jpg`] : []),
      occurredAt,
      reportedBy: pick(REPORTERS),
      reportedAt,
      status: last.status,
      handler,
      estimatedRecoverAt: estimated,
      detourTip:
        last.status !== 'recovered'
          ? '请暂时使用旁边另一部电梯，或从B1层乘坐货梯绕行。'
          : undefined,
      timeline,
      recoveredAt,
      repeatedCount,
    };
  }

  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'door_stuck', hasTrapped: true },
      [{ status: 'urgent', hoursAgo: 0.15, remark: '有2人被困，已通知消防' }],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'not_moving' },
      [{ status: 'urgent', hoursAgo: 0.5 }, { status: 'processing', hoursAgo: 0.2, remark: '师傅已抵达现场排查' }],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'strange_noise' },
      [
        { status: 'urgent', hoursAgo: 2 },
        { status: 'processing', hoursAgo: 1.5 },
        { status: 'waiting_parts', hoursAgo: 0.8, remark: '需要更换导轨轴承，明天到货' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'button_fault' },
      [
        { status: 'urgent', hoursAgo: 4 },
        { status: 'processing', hoursAgo: 3 },
        { status: 'recovered', hoursAgo: 0.5, remark: '更换按键面板，测试通过' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'light_out' },
      [
        { status: 'urgent', hoursAgo: 6 },
        { status: 'processing', hoursAgo: 5 },
        { status: 'recovered', hoursAgo: 4.2, remark: '更换LED驱动板' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'not_moving' },
      [
        { status: 'urgent', hoursAgo: 12 },
        { status: 'processing', hoursAgo: 11 },
        { status: 'waiting_parts', hoursAgo: 9, remark: '变频器损坏，已紧急订货' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'door_stuck' },
      [
        { status: 'urgent', hoursAgo: 18 },
        { status: 'processing', hoursAgo: 17 },
        { status: 'recovered', hoursAgo: 15, remark: '调整门机皮带张力' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'air_condition' },
      [
        { status: 'urgent', hoursAgo: 24 },
        { status: 'processing', hoursAgo: 23 },
        { status: 'recovered', hoursAgo: 20, remark: '清洗滤网，补充冷媒' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'display_error' },
      [
        { status: 'urgent', hoursAgo: 36 },
        { status: 'processing', hoursAgo: 35 },
        { status: 'recovered', hoursAgo: 32, remark: '更换显示控制板' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'strange_noise' },
      [
        { status: 'urgent', hoursAgo: 48 },
        { status: 'processing', hoursAgo: 47 },
        { status: 'waiting_parts', hoursAgo: 40, remark: '钢丝绳磨损，等待更换' },
        { status: 'recovered', hoursAgo: 24, remark: '更换8根主钢丝绳' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'other' },
      [
        { status: 'urgent', hoursAgo: 60 },
        { status: 'processing', hoursAgo: 58 },
        { status: 'recovered', hoursAgo: 55, remark: '清理积水并检查电路' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'door_stuck' },
      [
        { status: 'urgent', hoursAgo: 72 },
        { status: 'processing', hoursAgo: 71 },
        { status: 'recovered', hoursAgo: 68, remark: '清理地坎异物' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: tickets[2].elevator, phenomenon: 'strange_noise' },
      [
        { status: 'urgent', hoursAgo: 120 },
        { status: 'processing', hoursAgo: 119 },
        { status: 'recovered', hoursAgo: 115, remark: '再次异响，加润滑油临时处理' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: tickets[5].elevator, phenomenon: 'not_moving' },
      [
        { status: 'urgent', hoursAgo: 240 },
        { status: 'processing', hoursAgo: 239 },
        { status: 'recovered', hoursAgo: 230, remark: '历史遗留问题临时恢复' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: tickets[2].elevator, phenomenon: 'button_fault' },
      [
        { status: 'urgent', hoursAgo: 360 },
        { status: 'processing', hoursAgo: 359 },
        { status: 'recovered', hoursAgo: 350, remark: '第三次维修' },
      ],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'door_stuck', hasTrapped: false },
      [{ status: 'urgent', hoursAgo: 1.5, remark: '无人员被困' }],
    ),
  );
  tickets.push(
    pushTimeline(
      { elevator: makeElevator(), phenomenon: 'not_moving' },
      [
        { status: 'urgent', hoursAgo: 8 },
        { status: 'processing', hoursAgo: 7, remark: '安全回路触发' },
        { status: 'waiting_parts', hoursAgo: 5, remark: '等安全钳开关' },
      ],
    ),
  );

  tickets.forEach((t) => {
    if ((t.repeatedCount && t.repeatedCount >= 3) && t.status === 'recovered') {
      t.status = 'repeated';
    }
  });

  return tickets;
}
