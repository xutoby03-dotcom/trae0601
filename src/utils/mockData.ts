import type { TastingItem, Feedback } from '@/types';

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=400&h=300&fit=crop',
];

const FLAVORS = ['草莓', '巧克力', '抹茶', '芒果', '香草', '提拉米苏', '红豆', '芋泥', '椰香', '咖啡'];

const TARGET_AUDIENCES = ['年轻人', '上班族', '学生党', '甜品爱好者', '健身人群', '家庭客群'];

export function generateMockTastingItems(): TastingItem[] {
  const items: TastingItem[] = [];
  const names = [
    '云朵蛋糕', '爆浆麻薯', '千层酥', '布丁烧', '雪花酥', '奶盖茶',
  ];

  for (let i = 0; i < 6; i++) {
    const daysLater = i === 0 ? 1 : i === 1 ? 3 : i === 2 ? 5 : 7 + i;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysLater);

    items.push({
      id: `item-${i + 1}`,
      name: names[i],
      flavor: FLAVORS[i % FLAVORS.length],
      cost: Math.round(Math.random() * 20 + 5),
      targetAudience: TARGET_AUDIENCES[i % TARGET_AUDIENCES.length],
      totalPortions: 30 + Math.floor(Math.random() * 50),
      imageUrl: IMAGE_URLS[i % IMAGE_URLS.length],
      deadline: deadline.toISOString(),
      status: i < 3 ? 'collecting' : i < 5 ? 'popular' : 'ready',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      description: `全新口味${FLAVORS[i % FLAVORS.length]}风味${names[i]}，精选优质原料，口感丰富层次分明，邀您品鉴！`,
    });
  }

  items[2].status = 'controversial';

  return items;
}

const COMMENT_TEMPLATES = {
  positive: [
    '太好吃了！香甜可口，下次还会买',
    '味道绝了，口感很棒，推荐！',
    '超级喜欢这个口味，太赞了',
    '比想象中好吃，很惊喜',
    '甜度刚好，不会腻，爱了爱了',
    '口感丰富，层次分明，用心了',
    '颜值高味道好，必须回购',
    '酥脆香甜，停不下来',
    '这个味道太绝了，强烈推荐',
    '超级美味，一口气吃了好几个',
  ],
  neutral: [
    '还可以吧，中规中矩',
    '味道一般，没有特别惊喜',
    '还行，性价比一般',
    '普普通通，可以试试',
    '口感还行，但是价格有点贵',
    '味道不错，但是分量有点小',
  ],
  negative: [
    '太甜了，有点腻',
    '感觉一般，不会再买',
    '味道怪怪的，不太喜欢',
    '太硬了，不太好吃',
    '太咸了，不符合我的口味',
    '有点失望，没有想象中好',
  ],
};

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockFeedbacks(items: TastingItem[]): Feedback[] {
  const feedbacks: Feedback[] = [];
  let id = 1;

  items.forEach((item, itemIndex) => {
    const feedbackCount = 8 + Math.floor(Math.random() * 15);

    for (let i = 0; i < feedbackCount; i++) {
      const sentiment = itemIndex < 2
        ? (Math.random() > 0.3 ? 'positive' : 'neutral')
        : itemIndex === 2
        ? (Math.random() > 0.5 ? 'positive' : (Math.random() > 0.5 ? 'negative' : 'neutral'))
        : (Math.random() > 0.2 ? 'positive' : 'neutral');

      const comments = COMMENT_TEMPLATES[sentiment];
      const baseRating = sentiment === 'positive' ? 4.5 : sentiment === 'neutral' ? 3 : 2;
      const rating = Math.min(5, Math.max(1, baseRating + (Math.random() - 0.5)));

      feedbacks.push({
        id: `feedback-${id++}`,
        tastingItemId: item.id,
        overallRating: Math.round(rating * 2) / 2,
        sweetness: 2 + Math.floor(Math.random() * 3),
        saltiness: 1 + Math.floor(Math.random() * 2),
        spiciness: 1,
        portion: 2 + Math.floor(Math.random() * 3),
        packaging: 3 + Math.floor(Math.random() * 2),
        purchaseIntent: sentiment === 'positive' ? 'yes' : sentiment === 'neutral' ? 'maybe' : 'no',
        comment: randomChoice(comments),
        createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      });
    }
  });

  return feedbacks;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
