import type { RewriteStyle } from '../types';

const concisePatterns: Array<{ from: RegExp; to: string }> = [
  { from: /非常\s*([\u4e00-\u9fa5])/g, to: '$1' },
  { from: /十分\s*([\u4e00-\u9fa5])/g, to: '$1' },
  { from: /极其\s*([\u4e00-\u9fa5])/g, to: '$1' },
  { from: /特别\s*([\u4e00-\u9fa5])/g, to: '$1' },
  { from: /相当\s*([\u4e00-\u9fa5])/g, to: '$1' },
  { from: /比较\s*([\u4e00-\u9fa5])/g, to: '$1' },
  { from: /的话/g, to: '' },
  { from: /然后/g, to: '' },
  { from: /其实/g, to: '' },
  { from: /基本上/g, to: '' },
  { from: /大概/g, to: '' },
  { from: /可能/g, to: '' },
  { from: /也许/g, to: '' },
  { from: /我觉得/g, to: '' },
  { from: /我认为/g, to: '' },
  { from: /个人认为/g, to: '' },
  { from: /在我看来/g, to: '' },
  { from: /总的来说/g, to: '总之' },
  { from: /综上所述/g, to: '综上' },
  { from: /由此可见/g, to: '可见' },
];

const formalPatterns: Array<{ from: RegExp; to: string }> = [
  { from: /啥/g, to: '什么' },
  { from: /咋/g, to: '怎么' },
  { from: /挺/g, to: '很' },
  { from: /蛮/g, to: '很' },
  { from: /超/g, to: '非常' },
  { from: /巨/g, to: '极其' },
  { from: /贼/g, to: '非常' },
  { from: /忒/g, to: '太' },
  { from: /搞定/g, to: '完成' },
  { from: /弄好/g, to: '做好' },
  { from: /整好/g, to: '整理好' },
  { from: /靠谱/g, to: '可靠' },
  { from: /给力/g, to: '得力' },
  { from: /悲催/g, to: '悲惨' },
  { from: /纠结/g, to: '犹豫' },
  { from: /郁闷/g, to: '烦闷' },
  { from: /开心/g, to: '高兴' },
  { from: /高兴坏了/g, to: '十分高兴' },
  { from: /吧/g, to: '' },
  { from: /呢/g, to: '' },
  { from: /啊/g, to: '' },
  { from: /哦/g, to: '' },
  { from: /啦/g, to: '' },
  { from: /~+/g, to: '。' },
  { from: /！{2,}/g, to: '！' },
  { from: /\?{2,}/g, to: '？' },
];

const livelyPatterns: Array<{ from: RegExp; to: string }> = [
  { from: /非常好/g, to: '太棒了' },
  { from: /很好/g, to: '超棒' },
  { from: /好的/g, to: '好呀' },
  { from: /是的/g, to: '没错呀' },
  { from: /不是/g, to: '才不是呢' },
  { from: /高兴/g, to: '超开心' },
  { from: /难过/g, to: '好难过呀' },
  { from: /生气/g, to: '气鼓鼓' },
  { from: /惊讶/g, to: '哇塞' },
  { from: /思考/g, to: '琢磨着' },
  { from: /。$/gm, to: '～' },
  { from: /！/g, to: '！！' },
  { from: /因为/g, to: '因为呀' },
  { from: /所以/g, to: '所以呀' },
  { from: /但是/g, to: '但是呢' },
  { from: /而且/g, to: '而且呀' },
];

const conciseSynonyms: Record<string, string> = {
  '进行了': '做了',
  '给予了': '给了',
  '作出了': '做了',
  '实现了': '做到了',
  '完成了': '做完了',
  '开展了': '做了',
  '实施了': '做了',
  '进行': '做',
  '给予': '给',
  '作出': '做',
  '实现': '做到',
  '开展': '做',
  '实施': '做',
  '对于': '对',
  '关于': '关于',
  '根据': '按',
  '按照': '按',
  '通过': '用',
  '经过': '经',
  '由于': '因',
  '为了': '为',
};

const formalSynonyms: Record<string, string> = {
  '你': '您',
  '我们': '我方',
  '他们': '对方',
  '说': '表示',
  '看': '查看',
  '想': '认为',
  '要': '需要',
  '做': '执行',
  '给': '提供',
  '拿': '获取',
  '用': '使用',
  '好': '良好',
  '坏': '不佳',
  '大': '较大',
  '小': '较小',
  '多': '较多',
  '少': '较少',
  '快': '迅速',
  '慢': '缓慢',
};

const livelySynonyms: Record<string, string> = {
  '好': '好好',
  '美': '美美',
  '香': '香香',
  '甜': '甜甜',
  '高兴': '开开心心',
  '快乐': '快快乐乐',
  '漂亮': '漂漂亮亮',
  '干净': '干干净净',
  '认真': '认认真真',
  '仔细': '仔仔细细',
  '非常': '超级',
  '很': '超',
  '十分': '巨',
};

export function rewriteText(text: string, style: RewriteStyle): string {
  let result = text;

  switch (style) {
    case 'concise':
      concisePatterns.forEach(({ from, to }) => {
        result = result.replace(from, to);
      });
      Object.entries(conciseSynonyms).forEach(([from, to]) => {
        result = result.replace(new RegExp(from, 'g'), to);
      });
      result = result.replace(/\s+/g, ' ').trim();
      break;

    case 'formal':
      formalPatterns.forEach(({ from, to }) => {
        result = result.replace(from, to);
      });
      Object.entries(formalSynonyms).forEach(([from, to]) => {
        result = result.replace(new RegExp(from, 'g'), to);
      });
      result = result.replace(/\s+/g, ' ').trim();
      break;

    case 'lively':
      livelyPatterns.forEach(({ from, to }) => {
        result = result.replace(from, to);
      });
      Object.entries(livelySynonyms).forEach(([from, to]) => {
        result = result.replace(new RegExp(from, 'g'), to);
      });
      break;
  }

  return result || text;
}

export function getStyleName(style: RewriteStyle): string {
  const names: Record<RewriteStyle, string> = {
    concise: '简洁风格',
    formal: '正式风格',
    lively: '活泼风格'
  };
  return names[style];
}

export function getStyleDescription(style: RewriteStyle): string {
  const descriptions: Record<RewriteStyle, string> = {
    concise: '去除冗余修饰，精简表达，突出核心',
    formal: '使用书面语，替换口语化表达，更专业',
    lively: '使用生动词汇，语气更轻松活泼'
  };
  return descriptions[style];
}
