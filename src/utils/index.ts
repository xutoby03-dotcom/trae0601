const adjectives = [
  '神秘的', '勇敢的', '快乐的', '机智的', '温柔的', '闪亮的',
  '疯狂的', '甜蜜的', '酷炫的', '梦幻的', '幸运的', '调皮的',
  '安静的', '热情的', '迷人的', '聪明的', '淘气的', '优雅的',
  '活力的', '可爱的', '神奇的', '秘密的', '惊喜的', '隐匿的',
];

const nouns = [
  '企鹅', '浣熊', '独角兽', '阿尔法', '彗星', '海豚',
  '凤凰', '猫头鹰', '水獭', '樱花', '流星', '北极星',
  '彩虹', '蝴蝶', '萤火虫', '云朵', '月亮', '向日葵',
  '水晶', '火箭', '宝藏', '王冠', '糖果', '魔术',
];

const suffixes = ['行动', '计划', '任务', '作战', '项目', '方案'];

let usedCodeNames = new Set<string>();

export function generateCodeName(): string {
  let result = '';
  let attempts = 0;
  do {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    result = `${adj}${noun}${suffix}`;
    attempts++;
  } while (usedCodeNames.has(result) && attempts < 50);
  usedCodeNames.add(result);
  return result;
}

export function resetCodeNames(): void {
  usedCodeNames.clear();
}

export const avatarColors = [
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA', '#F472B6',
  '#34D399', '#FBBF24', '#60A5FA', '#F87171', '#38BDF8',
  '#FB7185', '#4ADE80', '#FACC15', '#818CF8', '#E879F9',
];

export function getAvatarColor(index: number): string {
  return avatarColors[index % avatarColors.length];
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  let suffix = '';
  if (days > 0) suffix = ` · 还有${days}天`;
  else if (days === 0) suffix = ' · 就是今天！';
  else suffix = ` · 已过${Math.abs(days)}天`;
  return `${month}月${day}日 ${weekday}${suffix}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
