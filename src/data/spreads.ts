import { Spread } from '@/types';

export const spreads: Spread[] = [
  {
    id: 'three-card',
    name: '三牌阵',
    description: '简洁经典的牌阵，适合日常问题的快速占卜',
    cardCount: 3,
    icon: '✨',
    positions: [
      { index: 0, name: '过去', meaning: '代表问题的过去根源、已经发生的事情' },
      { index: 1, name: '现在', meaning: '代表当前的状况、正在经历的事情' },
      { index: 2, name: '未来', meaning: '代表可能的发展趋势、未来的结果' }
    ]
  },
  {
    id: 'celtic-cross',
    name: '凯尔特十字',
    description: '最经典复杂的牌阵，深度剖析问题的各个层面',
    cardCount: 10,
    icon: '⚔️',
    positions: [
      { index: 0, name: '现状', meaning: '问题目前的核心状况' },
      { index: 1, name: '挑战', meaning: '当前面临的主要障碍或挑战' },
      { index: 2, name: '潜意识', meaning: '内心深处的真实想法和感受' },
      { index: 3, name: '过去', meaning: '导致现状的过去因素' },
      { index: 4, name: '可能性', meaning: '近期可能出现的变化' },
      { index: 5, name: '近期未来', meaning: '短期内可能发生的事情' },
      { index: 6, name: '自我态度', meaning: '你对这个问题的态度' },
      { index: 7, name: '外部环境', meaning: '周围人和事对你的影响' },
      { index: 8, name: '希望与恐惧', meaning: '内心的期望和担忧' },
      { index: 9, name: '最终结果', meaning: '问题发展的最终走向' }
    ]
  },
  {
    id: 'time-flow',
    name: '时间之流',
    description: '探索时间轴上的发展变化，洞察趋势走向',
    cardCount: 5,
    icon: '⏳',
    positions: [
      { index: 0, name: '遥远过去', meaning: '很久以前就存在的根源因素' },
      { index: 1, name: '近期过去', meaning: '最近发生的相关事件' },
      { index: 2, name: '当下时刻', meaning: '此时此刻的真实状况' },
      { index: 3, name: '近期未来', meaning: '即将到来的发展变化' },
      { index: 4, name: '长远未来', meaning: '长期来看的最终结果' }
    ]
  },
  {
    id: 'soul-mirror',
    name: '心灵镜像',
    description: '深入内心世界，探索真实的自我与情感',
    cardCount: 4,
    icon: '🪞',
    positions: [
      { index: 0, name: '外在表现', meaning: '你展现给外界的形象和行为' },
      { index: 1, name: '内在自我', meaning: '内心深处真实的感受和想法' },
      { index: 2, name: '隐藏潜力', meaning: '你尚未发现的自身潜能' },
      { index: 3, name: '整合建议', meaning: '如何协调内外，达到身心合一' }
    ]
  }
];

export const getSpreadById = (id: string): Spread | undefined => {
  return spreads.find(s => s.id === id);
};
