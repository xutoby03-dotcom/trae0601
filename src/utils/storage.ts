import type { BlindTest } from '../types';

const STORAGE_KEY = 'blind-coffee-tests';

export function saveToLocalStorage(blindTests: BlindTest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blindTests));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage(): BlindTest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return getMockData();
}

function getMockData(): BlindTest[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'mock1',
      coffeeName: '埃塞俄比亚 耶加雪菲',
      origin: '埃塞俄比亚 耶加雪菲',
      processMethod: '水洗',
      roastLevel: 'light',
      roastDate: '2026-06-15',
      createdAt: now,
      isRevealed: true,
      waterSamples: [
        {
          id: 's1',
          blindCode: 'A',
          realName: '矿泉水（怡宝）',
          tds: 80,
          hardness: 50,
          ph: 7.2,
          mineralNotes: '低矿物质，口感清爽',
        },
        {
          id: 's2',
          blindCode: 'B',
          realName: '自来水（过滤）',
          tds: 150,
          hardness: 120,
          ph: 7.5,
          mineralNotes: '中等矿物质，钙镁含量适中',
        },
        {
          id: 's3',
          blindCode: 'C',
          realName: '蒸馏水+矿物质',
          tds: 100,
          hardness: 80,
          ph: 6.8,
          mineralNotes: '人工调配，专注于镁离子',
        },
      ],
      brewingParams: [
        {
          id: 'b1',
          waterSampleId: 's1',
          grindSize: 3.5,
          waterTemp: 92,
          coffeeDose: 15,
          waterAmount: 240,
          brewTime: 150,
          pourMethod: '三段式注水',
        },
        {
          id: 'b2',
          waterSampleId: 's2',
          grindSize: 3.5,
          waterTemp: 92,
          coffeeDose: 15,
          waterAmount: 240,
          brewTime: 145,
          pourMethod: '三段式注水',
        },
        {
          id: 'b3',
          waterSampleId: 's3',
          grindSize: 3.5,
          waterTemp: 92,
          coffeeDose: 15,
          waterAmount: 240,
          brewTime: 155,
          pourMethod: '三段式注水',
        },
      ],
      tastingScores: [
        {
          id: 't1',
          waterSampleId: 's1',
          acidity: 8.5,
          sweetness: 7.0,
          bitterness: 2.0,
          aftertaste: 7.5,
          cleanliness: 9.0,
          preferenceRank: 2,
          flavorTags: ['柑橘', '花香', '茶感'],
          notes: '酸质明亮，但甜感稍弱，整体干净清爽',
        },
        {
          id: 't2',
          waterSampleId: 's2',
          acidity: 7.5,
          sweetness: 8.5,
          bitterness: 3.0,
          aftertaste: 8.0,
          cleanliness: 8.0,
          preferenceRank: 1,
          flavorTags: ['焦糖', '坚果', '巧克力'],
          notes: '甜感突出，body厚实，余韵持久',
        },
        {
          id: 't3',
          waterSampleId: 's3',
          acidity: 8.0,
          sweetness: 7.5,
          bitterness: 2.5,
          aftertaste: 7.0,
          cleanliness: 8.5,
          preferenceRank: 3,
          flavorTags: ['莓果', '蜂蜜', '香草'],
          notes: '风味均衡，但复杂度稍逊',
        },
      ],
    },
    {
      id: 'mock2',
      coffeeName: '哥伦比亚 慧兰',
      origin: '哥伦比亚 慧兰',
      processMethod: '水洗',
      roastLevel: 'medium',
      roastDate: '2026-06-10',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      isRevealed: false,
      waterSamples: [
        {
          id: 's4',
          blindCode: 'A',
          realName: '农夫山泉',
          tds: 120,
          hardness: 90,
          ph: 7.0,
          mineralNotes: '天然矿泉水',
        },
        {
          id: 's5',
          blindCode: 'B',
          realName: '屈臣氏蒸馏水',
          tds: 5,
          hardness: 0,
          ph: 5.8,
          mineralNotes: '几乎不含矿物质',
        },
      ],
      brewingParams: [],
      tastingScores: [],
    },
  ];
}
