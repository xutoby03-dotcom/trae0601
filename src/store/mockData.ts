import type { Store, Umbrella, LendRecord, ReturnRecord } from '../types';

export const initialStores: Store[] = [
  { id: 's1', name: '朝阳路旗舰店', address: '朝阳区朝阳路168号' },
  { id: 's2', name: '中关村创业店', address: '海淀区中关村大街1号' },
  { id: 's3', name: '国贸中心店', address: '朝阳区建国门外大街1号' },
  { id: 's4', name: '望京SOHO店', address: '朝阳区望京街10号' },
  { id: 's5', name: '西单商场店', address: '西城区西单北大街120号' },
];

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

const umbrellaColors = ['墨黑', '藏蓝', '酒红', '军绿', '驼色', '烟灰', '深棕', '钛灰'];
const photoPresets = [
  'https://images.unsplash.com/photo-1534309466160-70b22cc6252c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1577965535299-6f3e46b23e13?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1586610881410-321a835a3b9a?w=400&h=400&fit=crop',
];

function genUmbrellas(): Umbrella[] {
  const list: Umbrella[] = [];
  const codes = ['U-A-', 'U-B-', 'U-C-', 'U-D-', 'U-E-'];
  for (let s = 0; s < 5; s++) {
    for (let i = 1; i <= 8; i++) {
      const codeNum = i.toString().padStart(3, '0');
      const idx = s * 8 + i;
      let status: Umbrella['status'] = 'available';
      if (idx === 3 || idx === 10 || idx === 18 || idx === 27) status = 'lent';
      if (idx === 7 || idx === 22 || idx === 35) status = 'damaged';
      list.push({
        id: `u${idx}`,
        code: `${codes[s]}${codeNum}`,
        color: umbrellaColors[(idx - 1) % umbrellaColors.length],
        size: (['small', 'medium', 'large'] as const)[idx % 3],
        deposit: [30, 50, 80][idx % 3],
        storeId: `s${s + 1}`,
        status,
        damageNote: status === 'damaged' ? ['伞骨断裂一根', '伞面有破洞约3cm', '伞套丢失'][idx % 3] : '',
        photoUrl: photoPresets[idx % photoPresets.length],
        createdAt: daysAgo(30 + (idx % 20)),
      });
    }
  }
  return list;
}

export const initialUmbrellas: Umbrella[] = genUmbrellas();

export const initialLendRecords: LendRecord[] = [
  {
    id: 'l1',
    umbrellaId: 'u3',
    phoneLast4: '8821',
    lendTime: hoursAgo(62),
    expectedStoreId: 's1',
    depositStatus: 'paid',
    dueTime: hoursAgo(62 - 48),
    reminded: false,
  },
  {
    id: 'l2',
    umbrellaId: 'u10',
    phoneLast4: '3367',
    lendTime: hoursAgo(55),
    expectedStoreId: 's2',
    depositStatus: 'paid',
    dueTime: hoursAgo(55 - 48),
    reminded: true,
  },
  {
    id: 'l3',
    umbrellaId: 'u18',
    phoneLast4: '5109',
    lendTime: hoursAgo(36),
    expectedStoreId: 's4',
    depositStatus: 'paid',
    dueTime: hoursAgo(36 - 48),
    reminded: false,
  },
  {
    id: 'l4',
    umbrellaId: 'u27',
    phoneLast4: '2456',
    lendTime: hoursAgo(12),
    expectedStoreId: 's5',
    depositStatus: 'unpaid',
    dueTime: hoursAgo(12 - 48),
    reminded: false,
  },
];

export const initialReturnRecords: ReturnRecord[] = [
  {
    id: 'r1',
    lendRecordId: 'l0-past-1',
    returnTime: daysAgo(2),
    frameOk: true,
    surfaceOk: true,
    coverOk: true,
    isWet: false,
    damageNote: '',
    finalStatus: 'available',
  },
  {
    id: 'r2',
    lendRecordId: 'l0-past-2',
    returnTime: daysAgo(4),
    frameOk: false,
    surfaceOk: true,
    coverOk: true,
    isWet: true,
    damageNote: '伞骨轻微变形，风干后可继续使用',
    finalStatus: 'available',
  },
];
