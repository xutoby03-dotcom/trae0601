import type { Feedback, KeywordCount } from '@/types';

const STOP_WORDS = new Set([
  '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '那', '他', '她', '它', '们', '什么', '怎么', '为什么', '可以',
  '还是', '但是', '因为', '所以', '如果', '虽然', '而且', '或者', '以及',
  '这个', '那个', '这些', '那些', '一样', '一下', '一点', '一些', '真的',
  '觉得', '感觉', '不错', '还可以', '还行', '一般', '太', '更', '最',
  '吃', '喝', '尝', '试', '买', '喜欢',
]);

const POSITIVE_WORDS = [
  '好吃', '美味', '香甜', '酥脆', '鲜嫩', '爽口', '浓郁', '清香',
  '惊喜', '惊艳', '赞', '棒', '绝', '爱了', '推荐', '必吃',
  '划算', '实惠', '超值', '精致', '用心', '新鲜',
];

const NEGATIVE_WORDS = [
  '难吃', '太咸', '太甜', '太辣', '太油', '太干', '太硬', '太淡',
  '一般', '普通', '失望', '不好吃', '怪怪的', '奇怪', '难喝',
  '贵', '不值', '太小', '太少', '不新鲜',
];

export function extractKeywords(feedbacks: Feedback[], limit: number = 20): KeywordCount[] {
  const wordCount: Record<string, number> = {};

  feedbacks.forEach(feedback => {
    const text = feedback.comment;
    if (!text || text.length < 2) return;

    const words = segmentChinese(text);
    words.forEach(word => {
      if (word.length >= 2 && !STOP_WORDS.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    POSITIVE_WORDS.forEach(word => {
      if (text.includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    NEGATIVE_WORDS.forEach(word => {
      if (text.includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function segmentChinese(text: string): string[] {
  const results: string[] = [];

  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= text.length - len; i++) {
      const word = text.slice(i, i + len);
      if (/^[\u4e00-\u9fa5]+$/.test(word)) {
        results.push(word);
      }
    }
  }

  return results;
}

export function isPositiveWord(word: string): boolean {
  return POSITIVE_WORDS.some(w => word.includes(w) || w.includes(word));
}

export function isNegativeWord(word: string): boolean {
  return NEGATIVE_WORDS.some(w => word.includes(w) || w.includes(word));
}

export function getKeywordColor(word: string, count: number, maxCount: number): string {
  if (isPositiveWord(word)) return 'text-green-600 bg-green-50 border-green-200';
  if (isNegativeWord(word)) return 'text-red-500 bg-red-50 border-red-200';

  const ratio = count / maxCount;
  if (ratio > 0.7) return 'text-primary-600 bg-primary-50 border-primary-200';
  if (ratio > 0.4) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-brown-700 bg-brown-50 border-brown-200';
}

export function getKeywordSize(count: number, maxCount: number): string {
  const ratio = count / maxCount;
  if (ratio > 0.8) return 'text-xl font-bold';
  if (ratio > 0.6) return 'text-lg font-semibold';
  if (ratio > 0.4) return 'text-base font-medium';
  if (ratio > 0.2) return 'text-sm';
  return 'text-xs';
}

export function filterFeedbacksByKeyword(feedbacks: Feedback[], keyword: string): Feedback[] {
  if (!keyword) return feedbacks;
  return feedbacks.filter(f => f.comment.includes(keyword));
}
