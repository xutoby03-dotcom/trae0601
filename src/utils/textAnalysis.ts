import type { AnalysisResult, ArticleType, TypoItem, RepeatedWord } from '../types';

const typoDictionary: Record<string, string> = {
  '好象': '好像',
  '象': '像',
  '部份': '部分',
  '作做': '做作',
  '按装': '安装',
  '必竟': '毕竟',
  '辩别': '辨别',
  '禀承': '秉承',
  '苍桑': '沧桑',
  '重迭': '重叠',
  '粗旷': '粗犷',
  '殆工': '怠工',
  '倒蛋': '捣蛋',
  '凋蔽': '凋敝',
  '迭起': '叠起',
  '发楞': '发愣',
  '坟莹': '坟茔',
  '风彩': '风采',
  '复盖': '覆盖',
  '告馨': '告罄',
  '耗废': '耗费',
  '哄响': '轰响',
  '弧度': '弧度',
  '黄莲': '黄连',
  '悔气': '晦气',
  '及待': '亟待',
  '藉贯': '籍贯',
  '既使': '即使',
  '灸热': '灼热',
  '就序': '就绪',
  '决窍': '诀窍',
  '勘误': '刊误',
  '刻服': '克服',
  '溃乏': '匮乏',
  '蜡梅': '腊梅',
  '蓝球': '篮球',
  '老俩口': '老两口',
  '了望': '瞭望',
  '罗唆': '啰嗦',
  '脉博': '脉搏',
  '密诀': '秘诀',
  '明片': '名片',
  '摸范': '模范',
  '年令': '年龄',
  '欧打': '殴打',
  '陪偿': '赔偿',
  '歉虚': '谦虚',
  '清彻': '清澈',
  '顷倒': '倾倒',
  '全愈': '痊愈',
  '劝戒': '劝诫',
  '溶洽': '融洽',
  '如竞': '如竟',
  '瑞智': '睿智',
  '闪砾': '闪烁',
  '善长': '擅长',
  '神密': '神秘',
  '势式': '势式',
  '受予': '授予',
  '书藉': '书籍',
  '坦城': '坦诚',
  '搪塞': '搪塞',
  '题纲': '提纲',
  '体帖': '体贴',
  '婉惜': '惋惜',
  '妄费': '枉费',
  '危协': '威胁',
  '污告': '诬告',
  '无空': '无缝',
  '希翼': '希冀',
  '息灭': '熄灭',
  '习贯': '习惯',
  '弦耀': '炫耀',
  '羡幕': '羡慕',
  '详和': '祥和',
  '消遥': '逍遥',
  '协从': '胁从',
  '卸任': '卸任',
  '辛福': '幸福',
  '暄闹': '喧闹',
  '训服': '驯服',
  '严竣': '严峻',
  '摇憾': '摇撼',
  '夜霄': '夜宵',
  '遗撼': '遗憾',
  '以经': '已经',
  '因该': '应该',
  '隐诲': '隐晦',
  '膺品': '赝品',
  '营光': '荧光',
  '尤如': '犹如',
  '鱼船': '渔船',
  '原气': '元气',
  '缘份': '缘分',
  '陨星': '陨星',
  '燥音': '噪音',
  '瞻养': '赡养',
  '招幕': '招募',
  '帐蓬': '帐篷',
  '蜇伏': '蛰伏',
  '真缔': '真谛',
  '振惊': '震惊',
  '直捷': '直接',
  '装定': '装订',
  '自抱': '自暴',
  '尊循': '遵循',
};

const argumentativeKeywords = [
  '论点', '论据', '因此', '所以', '因为', '综上所述', '由此可见',
  '我认为', '观点', '论证', '反驳', '支持', '反对', '首先', '其次',
  '最后', '总之', '故而', '由此看来', '不可否认', '诚然', '然而'
];

const narrativeKeywords = [
  '记得', '那天', '当时', '曾经', '回忆', '往事', '小时候', '从前',
  '突然', '然后', '接着', '最后', '终于', '就在这时', '那时候',
  '有一天', '记得那是', '至今难忘', '记忆犹新', '回想起来'
];

const expositoryKeywords = [
  '首先', '其次', '步骤', '方法', '说明', '介绍', '什么是', '如何',
  '怎样', '特点', '功能', '使用', '操作', '流程', '注意事项',
  '具体来说', '一般来说', '通常', '定义', '分类', '原理'
];

export function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function countChars(text: string): number {
  return text.replace(/\s/g, '').length;
}

export function countWords(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}

export function countParagraphs(html: string): number {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
  return Array.from(paragraphs).filter(p => p.textContent?.trim()).length;
}

export function countSentences(text: string): number {
  const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
  return sentences.length;
}

export function findTypos(text: string): TypoItem[] {
  const typos: TypoItem[] = [];
  for (const [wrong, correct] of Object.entries(typoDictionary)) {
    const regex = new RegExp(wrong, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      typos.push({
        word: wrong,
        position: match.index,
        suggestion: correct
      });
    }
  }
  return typos;
}

export function findRepeatedWords(text: string): RepeatedWord[] {
  const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, ' ');
  const words = cleaned.split(/\s+/).filter(w => w.length > 1);
  
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .filter(([, count]) => count >= 3)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function calculateReadability(text: string): number {
  if (text.length === 0) return 0;

  const sentenceCount = countSentences(text);
  const wordCount = countWords(text);
  
  if (sentenceCount === 0 || wordCount === 0) return 50;

  const avgSentenceLength = wordCount / sentenceCount;
  const charCount = countChars(text);
  const avgWordLength = charCount / wordCount;

  let score = 100;
  
  if (avgSentenceLength > 25) {
    score -= (avgSentenceLength - 25) * 2;
  }
  if (avgSentenceLength > 40) {
    score -= (avgSentenceLength - 40) * 3;
  }

  if (avgWordLength > 3) {
    score -= (avgWordLength - 3) * 5;
  }

  const uniqueWords = new Set(text.match(/[\u4e00-\u9fa5]|[a-zA-Z]+/g)).size;
  const lexicalDiversity = uniqueWords / wordCount;
  if (lexicalDiversity < 0.3) {
    score -= (0.3 - lexicalDiversity) * 100;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function analyzeArticleType(text: string): { type: ArticleType; confidence: number } {
  if (text.length < 20) {
    return { type: 'other', confidence: 0 };
  }

  const scores: Record<ArticleType, number> = {
    argumentative: 0,
    narrative: 0,
    expository: 0,
    other: 0
  };

  argumentativeKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'g');
    const matches = text.match(regex);
    if (matches) scores.argumentative += matches.length * 2;
  });

  narrativeKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'g');
    const matches = text.match(regex);
    if (matches) scores.narrative += matches.length * 2;
  });

  expositoryKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'g');
    const matches = text.match(regex);
    if (matches) scores.expository += matches.length * 2;
  });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  
  if (totalScore === 0) {
    return { type: 'other', confidence: 0 };
  }

  const maxType = (Object.keys(scores) as ArticleType[]).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );
  
  const confidence = Math.round((scores[maxType] / totalScore) * 100);

  if (confidence < 40) {
    return { type: 'other', confidence };
  }

  return { type: maxType, confidence };
}

export function analyzeText(html: string): AnalysisResult {
  const text = stripHtml(html);
  
  const typeResult = analyzeArticleType(text);
  
  return {
    totalChars: countChars(text),
    totalWords: countWords(text),
    paragraphCount: countParagraphs(html),
    sentenceCount: countSentences(text),
    typos: findTypos(text),
    repeatedWords: findRepeatedWords(text),
    readabilityScore: calculateReadability(text),
    articleType: typeResult.type,
    typeConfidence: typeResult.confidence
  };
}

export function getArticleTypeName(type: ArticleType): string {
  const names: Record<ArticleType, string> = {
    argumentative: '议论文',
    narrative: '叙事文',
    expository: '说明文',
    other: '其他'
  };
  return names[type];
}

export function getReadabilityLabel(score: number): string {
  if (score >= 80) return '非常易读';
  if (score >= 60) return '比较易读';
  if (score >= 40) return '一般';
  if (score >= 20) return '较难阅读';
  return '非常难读';
}

export function getReadabilityColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-emerald-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-red-600';
}
